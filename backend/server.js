// A simple Node.js Express server to act as a proxy for the accessibility checker.
// It fetches website HTML and then calls the Gemini API for analysis.
require('dotenv').config();
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/analyze', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    console.log(`Received request to analyze: ${url}`);
    try {
        console.log('Fetching website content...');
        const siteResponse = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        if (!siteResponse.ok) {
            throw new Error(`Failed to fetch website content. Status: ${siteResponse.status}`);
        }
        let htmlContent = await siteResponse.text();
        console.log('Successfully fetched website content.');

        const MAX_CHARS = 70000;
        if (htmlContent.length > MAX_CHARS) {
            htmlContent = htmlContent.substring(0, MAX_CHARS);
            console.log('Truncated HTML content.');
        }

        const prompt = `
            You are an expert web accessibility auditor. Analyze the following HTML code for accessibility issues according to WCAG 2.1 standards.
            Focus on issues like:
            - Missing or uninformative 'alt' text for images.
            - Improper heading structure (e.g., skipping levels).
            - Vague link text like "click here".
            - Missing 'lang' attribute on <html> tag.
            - Missing form labels or incorrect 'for' attributes.
            - Potential color contrast issues (describe why they might occur).
            - Lack of ARIA attributes for complex widgets where necessary.

            HTML to analyze:
            \`\`\`html
            ${htmlContent}
            \`\`\`

            Based on your analysis, generate a detailed accessibility report. Provide the response as a JSON object following this exact schema:
            {
                "type": "OBJECT",
                "properties": {
                    "score": { "type": "NUMBER", "description": "An overall accessibility score from 0 to 100, based on the severity and number of issues found in the provided HTML." },
                    "issues": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "id": { "type": "STRING" },
                                "title": { "type": "STRING" },
                                "description": { "type": "STRING", "description": "Explain the issue from the perspective of a user with a disability." },
                                "suggestion": { "type": "STRING", "description": "Provide a concrete, actionable code-level suggestion." },
                                "severity": { "type": "STRING", "enum": ["Critical", "Serious", "Moderate", "Minor"] }
                            },
                            "required": ["id", "title", "description", "suggestion", "severity"]
                        }
                    }
                },
                "required": ["score", "issues"]
            }
        `;

        console.log('Calling Gemini API...');
        const apiKey = process.env.GEMINI_API_KEY || "";
        if (!apiKey) {
            console.warn("GEMINI_API_KEY environment variable not set. Using empty key.");
        }
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        };
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!apiResponse.ok) {
            const errorBody = await apiResponse.text();
            throw new Error(`AI analysis failed: ${apiResponse.statusText}. Body: ${errorBody}`);
        }
        const result = await apiResponse.json();
        console.log('Successfully received response from Gemini API.');
        res.json(result);
    } catch (err) {
        console.error("Error in /analyze endpoint:", err.message);
        res.status(500).json({ error: err.message || "An unexpected server error occurred." });
    }
});

app.listen(port, () => {
    console.log(`Accessibility checker backend listening at http://localhost:${port}`);
});