'use client';
import { useState } from 'react';
import { Plus, XCircle, BarChart2, Upload, GitBranch, Code } from 'lucide-react';
import Header from './components/Header';
import CodeEditorPanel from './components/CodeEditorPanel';
import ResultDashboard from './components/ResultDashboard';
import { analyzeCode, AnalyzeResponse, FileInput } from './lib/api';

export default function Home() {
  const [panels, setPanels] = useState([0]);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(null);
  const [panelData, setPanelData] = useState<FileInput[]>([{ filename: '', code: '' }]);

  const addPanel = () => {
    setPanels([...panels, panels.length]);
    setPanelData([...panelData, { filename: '', code: '' }]);
  };

  const removePanel = (index: number) => {
    setPanels(panels.filter((_, i) => i !== index));
    setPanelData(panelData.filter((_, i) => i !== index));
  };

  const updatePanel = (index: number, data: FileInput) => {
    const updated = [...panelData];
    updated[index] = data;
    setPanelData(updated);
  };

  const handleAnalyze = async () => {
    const validFiles = panelData.filter(f => f.code.trim() !== '');
    if (validFiles.length === 0) return;

    setIsLoading(true);
    try {
      const result = await analyzeCode(validFiles);
      setAnalysisResult(result);
      setShowResult(true);
    } catch (error) {
      console.error('解析エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
            onClick={handleAnalyze}
            disabled={isLoading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white text-sm px-4 py-2 rounded-md"
          >
            <BarChart2 className="w-4 h-4" />
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="p-6">
        {showResult ? (
          <ResultDashboard result={analysisResult} />
        ) : (
          panels.map((_, i) => (
            <CodeEditorPanel
              key={i}
              index={i}
              showRemove={i !== 0}
              onRemove={() => removePanel(i)}
              onChange={(data) => updatePanel(i, data)}
            />
          ))
        )}
      </div>
    </div>
  );
}