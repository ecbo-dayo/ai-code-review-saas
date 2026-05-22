'use client';
import { useState } from 'react';
import { Trash2, ChevronUp } from 'lucide-react';
import { FileInput } from '../lib/api';

interface Props {
  index: number;
  onRemove?: () => void;
  showRemove?: boolean;
  onChange?: (data: FileInput) => void;
}

export default function CodeEditorPanel({ index, onRemove, showRemove, onChange }: Props) {
  const [fileName, setFileName] = useState('');
  const [code, setCode] = useState('');

  const handleFileNameChange = (value: string) => {
    setFileName(value);
    onChange?.({ filename: value, code });
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    onChange?.({ filename: fileName, code: value });
  };

  const lines = code.split('\n');

  return (
    <div className="border border-[#1e2a3a] rounded-md overflow-hidden mb-4">
      {/* ファイル名ヘッダー */}
      <div className="bg-[#0d1b2a] px-4 py-2 flex items-center justify-between">
        <input
          type="text"
          value={fileName}
          onChange={(e) => handleFileNameChange(e.target.value)}
          placeholder="File name (e.g., main.py)"
          className="bg-transparent text-gray-300 text-sm outline-none placeholder-gray-500 flex-1"
        />
        <div className="flex items-center gap-3">
          {showRemove && (
            <button
              onClick={onRemove}
              className="flex items-center gap-1 text-blue-400 text-sm hover:text-blue-300"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          )}
          <ChevronUp className="text-blue-400 w-4 h-4" />
        </div>
      </div>

      {/* コードエリア */}
      <div className="flex bg-[#0a1628] min-h-[200px]">
        {/* 行番号 */}
        <div className="text-gray-500 text-sm px-3 pt-3 select-none text-right min-w-[40px]">
          {(lines.length === 1 && lines[0] === '' ? ['1'] : lines).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        {/* テキストエリア */}
        <textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder="Paste your code here..."
          className="flex-1 bg-transparent text-gray-300 text-sm p-3 outline-none resize-none placeholder-gray-600 font-mono"
          rows={10}
        />
      </div>
    </div>
  );
}