import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircleIcon } from './Icons';

const LoginPage: React.FC = () => {
    const { login } = useAuth();

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
            <div className="text-center w-full max-w-md">
                <header className="mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                        Document Summarizer AI
                    </h1>
                    <p className="mt-3 text-lg text-slate-400">
                        Welcome. Please log in to continue.
                    </p>
                </header>
                
                <main>
                    <button
                        onClick={login}
                        className="w-full max-w-xs flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        <UserCircleIcon className="w-6 h-6 mr-3" />
                        Login as Guest
                    </button>
                </main>
                 <footer className="text-center text-slate-500 mt-24">
                    <p>Powered by Gemini AI</p>
                </footer>
            </div>
        </div>
    );
};

export default LoginPage;
