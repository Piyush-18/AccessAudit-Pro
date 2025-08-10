import React from 'react';

const _uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const App = () => {
    const [url, setUrl] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [results, setResults] = React.useState(null);
    const [error, setError] = React.useState('');
    const [activeModal, setActiveModal] = React.useState(null);
    const API_THRESHOLD = 85;

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!url) {
            setError('Please enter a website URL.');
            return;
        }
        setError('');
        setLoading(true);
        setResults(null);
        try {
            const backendUrl = 'http://localhost:3001/analyze';
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Backend error: ${response.status}`);
            }
            const result = await response.json();
            if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
                const text = result.candidates[0].content.parts[0].text;
                const parsedJson = JSON.parse(text);
                parsedJson.issues = parsedJson.issues.map(issue => ({...issue, id: _uuid()}));
                setResults(parsedJson);
            } else {
                throw new Error("Unexpected API response structure from backend.");
            }
        } catch (err) {
            console.error("Analysis Error:", err);
            setError(err.message || "An unexpected error occurred. Make sure the backend server is running.");
            setResults(null);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (issue) => setActiveModal(issue);
    const closeModal = () => setActiveModal(null);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 antialiased">
            <Header />
            <main id="main-content" className="p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <section aria-labelledby="form-heading" className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-200">
                        <h1 id="form-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Accessibility Auditor</h1>
                        <p className="text-gray-600 mb-6">Enter a website URL to analyze its HTML for accessibility issues using AI.</p>
                        <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-4">
                            <label htmlFor="url-input" className="sr-only">Website URL</label>
                            <input
                                id="url-input"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com"
                                required
                                className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 w-full"
                                aria-describedby="error-message"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? <Loader /> : 'Analyze'}
                            </button>
                        </form>
                        {error && <p id="error-message" className="text-red-600 mt-4" role="alert">{error}</p>}
                        <p className="text-xs text-gray-500 mt-4">
                            Note: This tool requires the local backend server to be running.
                        </p>
                    </section>
                    {loading && (
                        <div className="text-center p-8" aria-live="polite">
                            <p className="text-lg text-gray-600">Contacting backend to run analysis... This may take a moment.</p>
                        </div>
                    )}
                    {results && <ResultsDisplay results={results} threshold={API_THRESHOLD} onLearnMore={openModal} />}
                </div>
            </main>
            {activeModal && <Modal issue={activeModal} onClose={closeModal} />}
        </div>
    );
};

const Header = () => (
    <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M12 1.5a10.5 10.5 0 1 0 10.5 10.5A10.5 10.5 0 0 0 12 1.5zm0 15a4.5 4.5 0 1 1 4.5-4.5A4.5 4.5 0 0 1 12 16.5z"/><path d="M12 6.5a1 1 0 1 1-1-1 1 1 0 0 1 1 1z"/></svg>
                <span className="text-xl font-bold text-gray-900">AI Accessibility Auditor</span>
            </div>
        </div>
    </header>
);

const Loader = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ResultsDisplay = ({ results, threshold, onLearnMore }) => {
    const isAccessible = results.score >= threshold;
    const scoreColor = isAccessible ? 'text-green-600' : 'text-orange-600';
    return (
        <section aria-labelledby="results-heading" className="mt-8">
            <h2 id="results-heading" className="sr-only">Analysis Results</h2>
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-200">
                <div className="grid md:grid-cols-3 gap-8 items-center">
                    <div className="flex flex-col items-center justify-center text-center">
                        <p className="text-lg font-semibold text-gray-700 mb-2">Accessibility Score</p>
                        <div className={`text-6xl font-bold ${scoreColor}`}>{results.score}
                            <span className="text-4xl text-gray-500">/100</span>
                        </div>
                    </div>
                    <div className="md:col-span-2 text-center md:text-left">
                        <h3 className={`text-xl font-bold ${isAccessible ? 'text-green-700' : 'text-orange-800'}`}>
                            {isAccessible ? 'Great! This site seems highly accessible.' : 'Improvements Needed'}
                        </h3>
                        <p className="text-gray-600 mt-2">
                            {isAccessible
                                ? `A score above ${threshold} indicates a strong commitment to accessibility. Minor issues might still exist, but the core structure is solid.`
                                : `This score is below the recommended threshold of ${threshold}. Addressing the issues below will significantly improve the experience for users with disabilities.`}
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Identified Issues ({results.issues.length})</h3>
                {results.issues.length > 0 ? (
                    <ul className="space-y-4">
                        {results.issues.map((issue) => <IssueCard key={issue.id} issue={issue} onLearnMore={onLearnMore} />)}
                    </ul>
                ) : (
                    <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                        <p className="text-gray-600">No critical accessibility issues were identified by the AI. Fantastic work!</p>
                    </div>
                )}
            </div>
        </section>
    );
};

const IssueCard = ({ issue, onLearnMore }) => {
    const severityStyles = {
        'Critical': 'bg-red-100 text-red-800 border-red-300',
        'Serious': 'bg-orange-100 text-orange-800 border-orange-300',
        'Moderate': 'bg-yellow-100 text-yellow-800 border-yellow-300',
        'Minor': 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return (
        <li className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 transition-shadow hover:shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-grow">
                    <h4 className="text-lg font-semibold text-gray-800">{issue.title}</h4>
                    <span className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full ${severityStyles[issue.severity] || 'bg-gray-100 text-gray-800'}`}>
                        {issue.severity} Severity
                    </span>
                </div>
                <button
                    onClick={() => onLearnMore(issue)}
                    className="bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 w-full sm:w-auto"
                    aria-label={`Learn more about ${issue.title}`}
                >
                    Learn More
                </button>
            </div>
        </li>
    );
};

const Modal = ({ issue, onClose }) => {
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 id="modal-title" className="text-2xl font-bold text-gray-900">{issue.title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close dialog">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg text-gray-800 mb-2">The Problem</h4>
                        <p className="text-gray-600 leading-relaxed">{issue.description}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg text-gray-800 mb-2">How to Fix It</h4>
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-gray-700 leading-relaxed font-mono text-sm whitespace-pre-wrap">{issue.suggestion}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;