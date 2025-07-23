import React, { useState, useEffect } from 'react';
import { CopyIcon, CheckIcon, SparklesIcon, ExclamationTriangleIcon, DocumentArrowDownIcon, ClipboardDocumentListIcon, PaperAirplaneIcon } from './Icons';
import { OutputType } from './OutputTypeSelector';

interface SummaryDisplayProps {
  summary: string;
  isLoading: boolean;
  error: string | null;
  status: 'idle' | 'parsing' | 'summarizing';
  outputType: OutputType;
}

const outputDetails: Record<OutputType, { title: string; icon: React.ReactElement<{ className?: string }>; placeholder: string }> = {
    summary: {
        title: "Generated Summary",
        icon: <SparklesIcon className="w-6 h-6 mr-2 text-blue-400" />,
        placeholder: "Summary will appear here"
    },
    briefingNote: {
        title: "Generated Briefing Note",
        icon: <ClipboardDocumentListIcon className="w-6 h-6 mr-2 text-purple-400" />,
        placeholder: "Briefing Note will appear here"
    },
    transmittalNote: {
        title: "Generated Transmittal Note",
        icon: <PaperAirplaneIcon className="w-6 h-6 mr-2 text-green-400" />,
        placeholder: "Transmittal Note will appear here"
    }
};

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, isLoading, error, status, outputType }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (summary) {
      setIsCopied(false);
    }
  }, [summary]);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const renderContent = () => {
    if (status === 'parsing') {
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <DocumentArrowDownIcon className="w-12 h-12 text-blue-400 animate-bounce" />
            <p className="mt-4 text-lg">Processing file...</p>
            <p className="text-sm">Extracting text from the document.</p>
          </div>
        );
    }

    if (status === 'summarizing') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <SparklesIcon className="w-12 h-12 text-blue-400 animate-pulse" />
          <p className="mt-4 text-lg">Generating content...</p>
          <p className="text-sm">Please wait while the AI processes the request.</p>
        </div>
      );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-red-400 p-4">
              <ExclamationTriangleIcon className="w-12 h-12" />
              <p className="mt-4 text-lg font-semibold">An Error Occurred</p>
              <p className="text-sm text-center text-red-300">{error}</p>
            </div>
          );
    }

    if (!summary) {
      const details = outputDetails[outputType];
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500">
          <div className="w-20 h-20 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center">
             {React.cloneElement(details.icon, { className: "w-8 h-8" })}
          </div>
          <p className="mt-4 text-lg">{details.placeholder}</p>
        </div>
      );
    }
    
    return (
      <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-slate-100 p-4 whitespace-pre-wrap">
        {summary}
      </div>
    );
  };

  const currentOutput = outputDetails[outputType];

  return (
    <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-slate-300 flex items-center">
              {currentOutput.icon}
              {currentOutput.title}
            </h2>
            {summary && !error && (
            <button
                onClick={handleCopy}
                className="flex items-center px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors duration-200 disabled:opacity-50"
                disabled={isCopied}
            >
                {isCopied ? (
                <>
                    <CheckIcon className="w-4 h-4 mr-1.5 text-green-400" />
                    Copied!
                </>
                ) : (
                <>
                    <CopyIcon className="w-4 h-4 mr-1.5" />
                    Copy
                </>
                )}
            </button>
            )}
        </div>
        <div className="flex-grow bg-slate-800 rounded-lg shadow-inner border border-slate-700 overflow-y-auto custom-scrollbar">
            {renderContent()}
        </div>
    </div>
  );
};