
import React from 'react';

interface TextInputAreaProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  disabled: boolean;
}

export const TextInputArea: React.FC<TextInputAreaProps> = ({ value, onChange, placeholder, disabled }) => {
  const charCount = value.length;
  
  return (
    <div className="flex-grow flex flex-col bg-slate-800 rounded-lg shadow-inner overflow-hidden border border-slate-700 focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200">
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-full flex-grow p-4 bg-transparent text-slate-200 resize-none focus:outline-none disabled:cursor-not-allowed disabled:text-slate-500"
        rows={20}
      />
      <div className="text-right px-4 py-2 bg-slate-900/50 text-sm text-slate-400">
        {charCount} characters
      </div>
    </div>
  );
};
