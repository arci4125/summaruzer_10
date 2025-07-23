import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRightOnRectangleIcon } from './Icons';

export const Header: React.FC = () => {
    const { logout } = useAuth();

    return (
        <header className="relative text-center py-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Document Summarizer AI
            </h1>
            <p className="mt-3 text-lg text-slate-400 max-w-2xl mx-auto">
                Instantly generate concise and professional summaries for your records. Paste your document below and let AI create the perfect overview.
            </p>
            <button
                onClick={logout}
                className="absolute top-0 right-0 mt-2 flex items-center gap-2 px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors duration-200 text-slate-300 hover:text-white"
                aria-label="Logout"
            >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
            </button>
        </header>
    );
};
