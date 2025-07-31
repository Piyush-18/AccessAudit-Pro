import { AccessibilityIssue, AccessibilityReport } from '../types/accessibility';

interface AnalysisResult {
  issues: AccessibilityIssue[];
  score: number;
}

export class AccessibilityAnalyzer {
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private calculateColorContrast(foreground: string, background: string): number {
    // Simplified contrast calculation
    const getLuminance = (color: string): number => {
      // Convert hex to RGB and calculate relative luminance
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      
      const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };

    try {
      const l1 = getLuminance(foreground);
      const l2 = getLuminance(background);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    } catch {
      return 4.5; // Default to passing ratio if calculation fails
    }
  }

  private analyzeImages(html: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const imgRegex = /<img[^>]*>/gi;
    const images = html.match(imgRegex) || [];

    images.forEach((img, index) => {
      const altMatch = img.match(/alt\s*=\s*["']([^"']*)["']/i);
      const srcMatch = img.match(/src\s*=\s*["']([^"']*)["']/i);
      
      if (!altMatch || altMatch[1].trim() === '') {
        issues.push({
          id: this.generateId(),
          category: 'images',
          severity: 'critical',
          title: 'Image missing alt text',
          description: 'Image lacks alternative text, making it inaccessible to screen readers and users with visual impairments.',
          element: img.substring(0, 100) + (img.length > 100 ? '...' : ''),
          wcagGuideline: '1.1.1 Non-text Content',
          suggestion: 'Add a descriptive alt attribute that explains the content and purpose of the image. For decorative images, use alt="" (empty alt text).',
          impact: 9
        });
      } else if (altMatch[1].length < 3) {
        issues.push({
          id: this.generateId(),
          category: 'images',
          severity: 'moderate',
          title: 'Alt text too short',
          description: 'Alt text is too brief to be meaningful for screen reader users.',
          element: img.substring(0, 100) + (img.length > 100 ? '...' : ''),
          wcagGuideline: '1.1.1 Non-text Content',
          suggestion: 'Provide more descriptive alt text that adequately describes the image content and context.',
          impact: 6
        });
      }
    });

    return issues;
  }

  private analyzeForms(html: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const inputRegex = /<input[^>]*>/gi;
    const inputs = html.match(inputRegex) || [];

    inputs.forEach((input) => {
      const hasLabel = html.includes(`for="${input.match(/id\s*=\s*["']([^"']*)["']/i)?.[1]}"`) ||
                      input.includes('aria-label') ||
                      input.includes('aria-labelledby');
      
      const typeMatch = input.match(/type\s*=\s*["']([^"']*)["']/i);
      const type = typeMatch ? typeMatch[1] : 'text';

      if (!hasLabel && type !== 'hidden' && type !== 'submit' && type !== 'button') {
        issues.push({
          id: this.generateId(),
          category: 'forms',
          severity: 'critical',
          title: 'Form input without label',
          description: 'Form input is not properly labeled, making it difficult for screen reader users to understand its purpose.',
          element: input.substring(0, 100) + (input.length > 100 ? '...' : ''),
          wcagGuideline: '1.3.1 Info and Relationships',
          suggestion: 'Add a <label> element with a "for" attribute matching the input\'s id, or use aria-label to provide an accessible name.',
          impact: 9
        });
      }
    });

    // Check for form validation
    const formRegex = /<form[^>]*>/gi;
    const forms = html.match(formRegex) || [];
    
    forms.forEach((form) => {
      if (!form.includes('novalidate') && !html.includes('aria-invalid')) {
        issues.push({
          id: this.generateId(),
          category: 'forms',
          severity: 'moderate',
          title: 'Missing form validation feedback',
          description: 'Form lacks proper validation feedback mechanisms for users with disabilities.',
          element: form.substring(0, 100) + (form.length > 100 ? '...' : ''),
          wcagGuideline: '3.3.1 Error Identification',
          suggestion: 'Implement proper error messaging with aria-invalid and aria-describedby attributes to help users understand and correct form errors.',
          impact: 7
        });
      }
    });

    return issues;
  }

  private analyzeHeadings(html: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const headingRegex = /<h([1-6])[^>]*>([^<]*)<\/h[1-6]>/gi;
    const headings: { level: number; text: string; element: string }[] = [];
    
    let match;
    while ((match = headingRegex.exec(html)) !== null) {
      headings.push({
        level: parseInt(match[1]),
        text: match[2].trim(),
        element: match[0]
      });
    }

    // Check for h1
    const h1Count = headings.filter(h => h.level === 1).length;
    if (h1Count === 0) {
      issues.push({
        id: this.generateId(),
        category: 'navigation',
        severity: 'critical',
        title: 'Missing main heading (h1)',
        description: 'Page lacks a main heading (h1), which is essential for screen reader navigation and SEO.',
        wcagGuideline: '1.3.1 Info and Relationships',
        suggestion: 'Add a single h1 element that describes the main content or purpose of the page.',
        impact: 8
      });
    } else if (h1Count > 1) {
      issues.push({
        id: this.generateId(),
        category: 'navigation',
        severity: 'moderate',
        title: 'Multiple h1 headings',
        description: 'Page has multiple h1 headings, which can confuse screen reader users about the page structure.',
        wcagGuideline: '1.3.1 Info and Relationships',
        suggestion: 'Use only one h1 per page for the main heading, and use h2-h6 for subheadings in hierarchical order.',
        impact: 6
      });
    }

    // Check heading hierarchy
    for (let i = 1; i < headings.length; i++) {
      const current = headings[i];
      const previous = headings[i - 1];
      
      if (current.level > previous.level + 1) {
        issues.push({
          id: this.generateId(),
          category: 'navigation',
          severity: 'moderate',
          title: 'Skipped heading level',
          description: 'Heading levels are not in sequential order, which can confuse screen reader users.',
          element: current.element,
          wcagGuideline: '1.3.1 Info and Relationships',
          suggestion: 'Use heading levels in sequential order (h1, h2, h3, etc.) without skipping levels.',
          impact: 5
        });
      }
    }

    return issues;
  }

  private analyzeColors(html: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // Extract inline styles and check for color contrast
    const styleRegex = /style\s*=\s*["']([^"']*)["']/gi;
    let match;
    
    while ((match = styleRegex.exec(html)) !== null) {
      const style = match[1];
      const colorMatch = style.match(/color\s*:\s*([^;]+)/i);
      const backgroundMatch = style.match(/background(?:-color)?\s*:\s*([^;]+)/i);
      
      if (colorMatch && backgroundMatch) {
        const textColor = colorMatch[1].trim();
        const bgColor = backgroundMatch[1].trim();
        
        // Simple hex color check
        if (textColor.startsWith('#') && bgColor.startsWith('#')) {
          const contrast = this.calculateColorContrast(textColor, bgColor);
          
          if (contrast < 4.5) {
            issues.push({
              id: this.generateId(),
              category: 'colors',
              severity: 'critical',
              title: 'Insufficient color contrast',
              description: `Color contrast ratio is ${contrast.toFixed(2)}:1, which is below the WCAG AA standard of 4.5:1.`,
              element: match[0],
              wcagGuideline: '1.4.3 Contrast (Minimum)',
              suggestion: 'Increase the contrast ratio to at least 4.5:1 for normal text or 3:1 for large text by using darker text colors or lighter background colors.',
              impact: 8
            });
          }
        }
      }
    }

    return issues;
  }

  private analyzeARIA(html: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // Check for buttons without accessible names
    const buttonRegex = /<button[^>]*>([^<]*)<\/button>/gi;
    let match;
    
    while ((match = buttonRegex.exec(html)) !== null) {
      const button = match[0];
      const content = match[1].trim();
      
      const hasAriaLabel = button.includes('aria-label');
      const hasAriaLabelledby = button.includes('aria-labelledby');
      
      if (!content && !hasAriaLabel && !hasAriaLabelledby) {
        issues.push({
          id: this.generateId(),
          category: 'aria',
          severity: 'critical',
          title: 'Button without accessible name',
          description: 'Button lacks text content or ARIA labels, making it unclear to screen reader users.',
          element: button,
          wcagGuideline: '4.1.2 Name, Role, Value',
          suggestion: 'Add descriptive text content to the button or use aria-label to provide an accessible name.',
          impact: 9
        });
      }
    }

    // Check for missing landmarks
    const hasMain = html.includes('<main') || html.includes('role="main"');
    const hasNav = html.includes('<nav') || html.includes('role="navigation"');
    
    if (!hasMain) {
      issues.push({
        id: this.generateId(),
        category: 'aria',
        severity: 'moderate',
        title: 'Missing main landmark',
        description: 'Page lacks a main landmark, making it harder for screen reader users to navigate to the primary content.',
        wcagGuideline: '1.3.6 Identify Purpose',
        suggestion: 'Add a <main> element or role="main" to identify the primary content area of the page.',
        impact: 6
      });
    }

    return issues;
  }

  private analyzeKeyboard(html: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // Check for elements that might need tabindex
    const clickableRegex = /<(div|span)[^>]*onclick[^>]*>/gi;
    let match;
    
    while ((match = clickableRegex.exec(html)) !== null) {
      const element = match[0];
      
      if (!element.includes('tabindex') && !element.includes('role="button"')) {
        issues.push({
          id: this.generateId(),
          category: 'keyboard',
          severity: 'moderate',
          title: 'Non-interactive element with click handler',
          description: 'Element has click functionality but is not keyboard accessible.',
          element: element,
          wcagGuideline: '2.1.1 Keyboard',
          suggestion: 'Add tabindex="0" and role="button" to make the element keyboard accessible, or use a proper <button> element instead.',
          impact: 7
        });
      }
    }

    return issues;
  }

  async analyzeWebsite(url: string): Promise<AccessibilityReport> {
    try {
      // In a real implementation, you would fetch the actual website
      // For now, we'll simulate different responses based on the URL
      const response = await this.fetchWebsiteContent(url);
      const html = response.html;
      
      const allIssues: AccessibilityIssue[] = [
        ...this.analyzeImages(html),
        ...this.analyzeForms(html),
        ...this.analyzeHeadings(html),
        ...this.analyzeColors(html),
        ...this.analyzeARIA(html),
        ...this.analyzeKeyboard(html)
      ];

      const criticalIssues = allIssues.filter(issue => issue.severity === 'critical').length;
      const moderateIssues = allIssues.filter(issue => issue.severity === 'moderate').length;
      const minorIssues = allIssues.filter(issue => issue.severity === 'minor').length;
      
      // Calculate score based on issues
      const criticalPenalty = criticalIssues * 15;
      const moderatePenalty = moderateIssues * 8;
      const minorPenalty = minorIssues * 3;
      
      const score = Math.max(0, 100 - criticalPenalty - moderatePenalty - minorPenalty);

      return {
        url,
        score,
        totalIssues: allIssues.length,
        criticalIssues,
        moderateIssues,
        minorIssues,
        issues: allIssues,
        scannedAt: new Date(),
        isAccessible: score >= 80
      };
    } catch (error) {
      console.error('Error analyzing website:', error);
      throw new Error('Failed to analyze website. Please check the URL and try again.');
    }
  }

  private async fetchWebsiteContent(url: string): Promise<{ html: string }> {
    // Simulate different website structures based on URL patterns
    if (url.includes('google.com')) {
      return {
        html: `
          <!DOCTYPE html>
          <html>
          <head><title>Google</title></head>
          <body>
            <h1>Google Search</h1>
            <main>
              <form>
                <input type="text" aria-label="Search" placeholder="Search Google">
                <button type="submit">Google Search</button>
              </form>
            </main>
            <nav>
              <a href="/images">Images</a>
              <a href="/maps">Maps</a>
            </nav>
          </body>
          </html>
        `
      };
    } else if (url.includes('github.com')) {
      return {
        html: `
          <!DOCTYPE html>
          <html>
          <head><title>GitHub</title></head>
          <body>
            <h1>GitHub</h1>
            <nav role="navigation">
              <a href="/explore">Explore</a>
              <a href="/pricing">Pricing</a>
            </nav>
            <main>
              <h2>Where the world builds software</h2>
              <img src="hero.jpg" alt="Developers collaborating on code">
              <form>
                <label for="email">Email address</label>
                <input type="email" id="email" required>
                <button type="submit">Sign up for GitHub</button>
              </form>
            </main>
          </body>
          </html>
        `
      };
    } else if (url.includes('bad') || url.includes('poor')) {
      return {
        html: `
          <!DOCTYPE html>
          <html>
          <head><title>Poorly Accessible Site</title></head>
          <body style="color: #ccc; background: #fff;">
            <div onclick="navigate()">Click me</div>
            <img src="image1.jpg">
            <img src="image2.jpg" alt="">
            <img src="image3.jpg" alt="a">
            <h3>Welcome</h3>
            <h5>Subtitle</h5>
            <form>
              <input type="text" placeholder="Enter name">
              <input type="email" placeholder="Enter email">
              <button></button>
            </form>
            <button style="color: #999; background: #fff;">Submit</button>
            <div onclick="doSomething()">Clickable div</div>
          </body>
          </html>
        `
      };
    } else {
      // Default website with some common issues
      return {
        html: `
          <!DOCTYPE html>
          <html>
          <head><title>Sample Website</title></head>
          <body>
            <h1>Welcome to Our Website</h1>
            <nav>
              <a href="/home">Home</a>
              <a href="/about">About</a>
              <a href="/contact">Contact</a>
            </nav>
            <main>
              <h2>About Us</h2>
              <img src="team.jpg" alt="Our team working together">
              <img src="office.jpg">
              <p>We are a company dedicated to excellence.</p>
              <form>
                <input type="text" placeholder="Your name">
                <label for="email-field">Email</label>
                <input type="email" id="email-field">
                <button type="submit">Send Message</button>
              </form>
              <div onclick="showMore()" style="cursor: pointer;">Show more details</div>
            </main>
          </body>
          </html>
        `
      };
    }
  }
}