import React from 'react';

export type OutputType = 'summary' | 'briefingNote' | 'transmittalNote';

interface OutputTypeSelectorProps {
  selectedType: OutputType;
  onTypeChange: (type: OutputType) => void;
  disabled: boolean;
}

const options: { id: OutputType; label: string }[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'briefingNote', label: 'Briefing Note' },
  { id: 'transmittalNote', label: 'Transmittal Note' },
];

export const OutputTypeSelector: React.FC<OutputTypeSelectorProps> = ({ selectedType, onTypeChange, disabled }) => {
  return (
    <div className="flex w-full max-w-md bg-slate-800 p-1 rounded-lg shadow-md border border-slate-700">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onTypeChange(option.id)}
          disabled={disabled}
          className={`w-full text-center px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 ${
            selectedType === option.id
              ? 'bg-blue-600 text-white shadow'
              : 'bg-transparent text-slate-300 hover:bg-slate-700/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};