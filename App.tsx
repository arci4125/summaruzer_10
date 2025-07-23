import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { TextInputArea } from './components/TextInputArea';
import { SummaryDisplay } from './components/SummaryDisplay';
import { generateContent } from './services/geminiService';
import { extractTextFromFile } from './utils/fileParsers';
import { ArrowPathIcon, DocumentTextIcon, ArrowUpTrayIcon } from './components/Icons';
import { OutputTypeSelector, OutputType } from './components/OutputTypeSelector';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';

type Status = 'idle' | 'parsing' | 'summarizing';

function App() {
  const { isAuthenticated } = useAuth();
  const [documentText, setDocumentText] = useState<string>('');
  const [documentImages, setDocumentImages] = useState<{ mimeType: string; data: string }[] | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [outputType, setOutputType] = useState<OutputType>('summary');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading = status !== 'idle';
  const hasContent = !!documentText.trim() || !!documentImages;

  const handleGenerate = useCallback(async () => {
    if (!hasContent) {
      setError('Please enter some text or upload a document.');
      return;
    }

    setStatus('summarizing');
    setError(null);
    setSummary('');

    try {
      const contentToGenerate = documentImages || documentText;
      const generatedSummary = await generateContent(contentToGenerate, outputType);
      setSummary(generatedSummary);
    } catch (err) {
      console.error(err);
      setError('Failed to generate content. Please check your connection or API key and try again.');
    } finally {
      setStatus('idle');
    }
  }, [documentText, documentImages, outputType, hasContent]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setStatus('parsing');
    setError(null);
    setDocumentText('');
    setDocumentImages(null);
    setSummary('');

    try {
      const extractedContent = await extractTextFromFile(file);
      if (typeof extractedContent === 'string') {
        setDocumentText(extractedContent);
        setDocumentImages(null);
      } else {
        setDocumentText('');
        setDocumentImages(extractedContent);
      }
    } catch (err) {
        const message = err instanceof Error ? err.message : "An unknown error occurred while processing the file.";
        console.error("Error processing file:", message);
        setError(message);
    } finally {
        setStatus('idle');
        if(event.target) {
            event.target.value = '';
        }
    }
  };

  const getButtonContent = () => {
    const icon = <ArrowPathIcon className="animate-spin w-6 h-6 mr-3" />;
    switch (status) {
        case 'parsing':
            return <>{icon} Processing File...</>;
        case 'summarizing':
            return <>{icon} Generating Content...</>;
        default:
            const actionText = {
                summary: 'Generate Summary',
                briefingNote: 'Generate Briefing Note',
                transmittalNote: 'Generate Transmittal Note'
            };
            return actionText[outputType];
    }
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl">
        <Header />
        
        <main className="mt-8 flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/2 flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-slate-300 flex items-center">
                    <DocumentTextIcon className="w-6 h-6 mr-2" />
                    Original Document
                </h2>
                <button
                    onClick={handleUploadClick}
                    disabled={isLoading}
                    className="flex items-center px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 hover:text-white"
                >
                    <ArrowUpTrayIcon className="w-4 h-4 mr-1.5" />
                    Upload File
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".txt,.md,.pdf,.docx,.xlsx,.xls"
                    className="hidden"
                    disabled={isLoading}
                />
            </div>

            <TextInputArea
              value={documentText}
              onChange={(e) => {
                  setDocumentText(e.target.value);
                  // If user starts typing, clear the image-based document
                  if (documentImages) {
                      setDocumentImages(null);
                  }
              }}
              placeholder={
                documentImages
                  ? `Ready to process a ${documentImages.length}-page image-based document via OCR. Click "Generate" to continue.`
                  : "Paste text here, or upload a file (.txt, .md, .pdf, .docx, .xlsx)..."
              }
              disabled={isLoading || !!documentImages}
            />
          </div>
          <div className="lg:w-1/2 flex flex-col">
            <SummaryDisplay
              summary={summary}
              isLoading={isLoading}
              error={error}
              status={status}
              outputType={outputType}
            />
          </div>
        </main>

        <div className="mt-8 flex flex-col items-center gap-6">
            <OutputTypeSelector
                selectedType={outputType}
                onTypeChange={(type) => setOutputType(type)}
                disabled={isLoading}
            />
            <button
                onClick={handleGenerate}
                disabled={isLoading || !hasContent}
                className="w-full max-w-xs flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-400 transition-all duration-300 transform hover:scale-105 disabled:scale-100 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
            >
                {getButtonContent()}
            </button>
        </div>

        <footer className="text-center text-slate-500 mt-12 pb-4">
            <p>Powered by Gemini AI</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
