'use client';
import { useState } from 'react';
import { Plus, XCircle, BarChart2, Upload, GitBranch, Code } from 'lucide-react';
import Header from './components/Header';
import CodeEditorPanel from './components/CodeEditorPanel';
import ResultDashboard from './components/ResultDashboard';

export default function Home() {
  const [panels, setPanels] = useState([0]);
  const [showResult, setShowResult] = useState(false);

  const addPanel = () => setPanels([...panels, panels.length]);
  const removePanel = (index: number) =>
    setPanels(panels.filter((_, i) => i !== index));

  return (
    <div className="min-h-screen bg-[#070e1a] text-white">
      <Header />

      {/* サブナビ */}
      <div className="border-b border-[#1e2a3a] px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {[
            { icon: <Code className="w-4 h-4" />, label: 'Code', active: !showResult },
            { icon: <Upload className="w-4 h-4" />, label: 'Upload' },
            { icon: <GitBranch className="w-4 h-4" />, label: 'GitHub' },
            ...(showResult ? [{ icon: <BarChart2 className="w-4 h-4" />, label: 'Results', active: true }] : []),
          ].map(({ icon, label, active }) => (
            <button
              key={label}
              onClick={() => label === 'Results' ? setShowResult(true) : setShowResult(false)}
              className={`flex items-center gap-1.5 text-sm pb-1 ${
                active
                  ? 'text-white border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {!showResult && (
            <>
              <button
                onClick={addPanel}
                className="flex items-center gap-1 text-blue-400 text-sm hover:text-blue-300"
              >
                <Plus className="w-4 h-4" />
                Create
              </button>
              <button
                onClick={() => setPanels([0])}
                className="flex items-center gap-1 text-blue-400 text-sm hover:text-blue-300"
              >
                <XCircle className="w-4 h-4" />
                Clear
              </button>
            </>
          )}
          <button
            onClick={() => setShowResult(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm px-4 py-2 rounded-md"
          >
            <BarChart2 className="w-4 h-4" />
            Analyze
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="p-6">
        {showResult ? (
          <ResultDashboard />
        ) : (
          panels.map((_, i) => (
            <CodeEditorPanel
              key={i}
              index={i}
              showRemove={i !== 0}
              onRemove={() => removePanel(i)}
            />
          ))
        )}
      </div>
    </div>
  );
}