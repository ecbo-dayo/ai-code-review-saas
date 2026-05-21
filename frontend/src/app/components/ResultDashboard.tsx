'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const testData = {
  overallScore: 82,
  totalFiles: 8,
  totalIssues: 18,
  debt: { high: 0, medium: 2, low: 6 },
  status: { bad: 0, warning: 2, good: 6 },
  complexity: [
    { file: 'main.py', value: 3.2 },
    { file: 'auth.py', value: 2.2 },
    { file: 'index.js', value: 3.2 },
    { file: 'app.ts', value: 2.2 },
    { file: 'main.js', value: 3.2 },
    { file: 'main.ts', value: 2.2 },
    { file: 'app.tsx', value: 10 },
    { file: 'app.py', value: 7.8 },
  ],
  insight: 'このプロジェクトは概ね良好ですが、一部に改善の余地があります。特にauth.pyに問題が集中しており、優先的な対応が必要です。また、utils.pyにも軽微な問題が見られます。',
  priority: [
    { file: 'auth.py', dot: 'bg-red-500', debt: 'High', complexity: 10 },
    { file: 'utils.py', dot: 'bg-yellow-500', debt: 'Low', complexity: 7.8 },
    { file: 'main.py', dot: 'bg-yellow-500', debt: 'Medium', complexity: 3.2 },
  ],
  actions: [
    'auth.pyのネストを減らし、処理を分割してください',
    'auth.pyの責務を見直し、リファクタリングを行ってください',
    'utils.pyの問題数が多いため、段階的に修正してください',
  ],
  files: [
    { name: 'main.py', score: 95, issues: 0, debt: 'Low', complexity: 2.0, status: 'Good' },
    { name: 'auth.py', score: 90, issues: 2, debt: 'Low', complexity: 2.0, status: 'Good' },
    { name: 'indexse...json', score: 85, issues: 2, debt: 'Medium', complexity: 3.0, status: 'Good' },
    { name: 'app.ts', score: 72, issues: 6, debt: 'Medium', complexity: 6.0, status: 'Warning' },
    { name: 'main.js', score: 68, issues: 2, debt: 'Low', complexity: 8.5, status: 'Warning' },
    { name: 'main.ts', score: 58, issues: 50, debt: 'Medium', complexity: 4.0, status: 'Bad' },
    { name: 'app.tsx', score: 55, issues: 3, debt: 'Low', complexity: 9.5, status: 'Bad' },
    { name: 'app.py', score: 42, issues: 2, debt: 'High', complexity: 7.8, status: 'Bad' },
  ],
  selectedFile: {
    name: 'app.tsx',
    status: 'Bad',
    issues: 3,
    complexity: 9.5,
    issueList: [
      { category: 'Structure', label: 'ネストが深い', severity: 'medium' },
      { category: 'Structure', label: '条件分岐が多い', severity: 'medium' },
      { category: 'Readability', label: '責務が集中', severity: 'low' },
    ]
  }
};

const statusDot = (status: string) => {
  if (status === 'Bad') return 'bg-red-500';
  if (status === 'Warning') return 'bg-yellow-500';
  return 'bg-green-500';
};

const scoreColor = (score: number) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
};

const debtColor = (debt: string) => {
  if (debt === 'High') return 'text-red-400';
  if (debt === 'Medium') return 'text-yellow-400';
  return 'text-green-400';
};

const complexityColor = (value: number) => {
  if (value >= 8) return 'bg-red-500';
  if (value >= 5) return 'bg-yellow-500';
  return 'bg-blue-500';
};

export default function ResultDashboard() {
  const [activeTab, setActiveTab] = useState<'summary' | 'failsummary'>('summary');
  const [selectedFile, setSelectedFile] = useState(testData.selectedFile);
  const [expandedIssues, setExpandedIssues] = useState<{ [key: string]: boolean }>({});

  const toggleIssue = (key: string) => {
    setExpandedIssues(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const maxComplexity = Math.max(...testData.complexity.map(f => f.value));

  return (
    <div className="flex gap-4 h-full">
      {/* 左：コードビューア */}
      <div className="w-[640px] flex flex-col gap-3 flex-shrink-0">
        {['main.py', 'auth.py'].map(file => (
          <div key={file} className="border border-[#1e2a3a] rounded-md overflow-hidden">
            <div className="bg-[#0d1b2a] px-4 py-2 flex items-center justify-between">
              <span className="text-gray-300 text-sm">{file}</span>
              <ChevronUp className="text-blue-400 w-4 h-4" />
            </div>
            <div className="bg-[#0a1628] h-[200px] flex">
              <div className="text-gray-600 text-sm px-3 pt-3 select-none min-w-[40px] text-right">
                {Array.from({ length: 8 }, (_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <div className="text-gray-500 text-sm p-3 font-mono text-xs">
                {file === 'main.py' ? (
                  <>
                    <div>while 1:</div>
                    <div className="ml-4">character=text.readline()</div>
                    <div className="ml-4">I=0</div>
                    <div className="ml-4">while I &lt; len(character):</div>
                    <div className="ml-8">if character[I] == _num and judgment == False:</div>
                    <div className="ml-12">I+=2</div>
                    <div className="ml-12">judgment=True</div>
                  </>
                ) : (
                  <>
                    <div>def login(user, password):</div>
                    <div className="ml-4">if user != "":</div>
                    <div className="ml-8">if password != "":</div>
                    <div className="ml-12">if user == "admin":</div>
                    <div className="ml-16">if password == "1234":</div>
                    <div className="ml-20">print("Login success")</div>
                    <div className="ml-16">else:</div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 右：結果パネル */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        {/* タブ */}
        <div className="flex border-b border-[#1e2a3a]">
          {[
            { id: 'summary', label: 'Summary' },
            { id: 'failsummary', label: 'Fail Summary' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'summary' | 'failsummary')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      {/* Summary */}
      {activeTab === 'summary' && (
        <div className="flex flex-col gap-3">
          {/* 上段：スコアカード + 複雑度グラフ 横並び */}
          <div className="flex gap-4">
            {/* スコアカード */}
            <div className="flex-1 bg-[#0d1b2a] border border-[#1e2a3a] rounded-lg p-4">
              <p className="text-sm mb-1">Quality Score <span className="text-gray-400">- コード品質スコア</span></p>
              <p className="text-blue-400 text-xl font-bold">{testData.overallScore} / 100</p>
              <p className="text-sm mt-3 mb-1">Issues Count <span className="text-gray-400">- 問題数</span></p>
              <p className="text-blue-400 text-sm">{testData.totalIssues} Issues</p>
              <p className="text-sm mt-3 mb-1">Technical Debt <span className="text-gray-400">- 技術負債</span></p>
              <div className="flex gap-3 text-sm">
                <span className="text-red-400">High: {testData.debt.high}</span>
                <span className="text-yellow-400">Medium: {testData.debt.medium}</span>
                <span className="text-green-400">Low: {testData.debt.low}</span>
              </div>
              <p className="text-sm mt-3 mb-1">Status <span className="text-gray-400">- ファイル状態</span></p>
              <div className="flex gap-3 text-sm">
                <span className="text-red-400">Bad: {testData.status.bad}</span>
                <span className="text-yellow-400">Warning: {testData.status.warning}</span>
                <span className="text-green-400">Good: {testData.status.good}</span>
              </div>
            </div>

            {/* 複雑度グラフ */}
            <div className="w-48 bg-[#0d1b2a] border border-[#1e2a3a] rounded-lg p-4">
              <p className="text-sm mb-3">Complexity <span className="text-gray-400">- 複雑度</span></p>
              <div className="flex flex-col gap-2">
                {testData.complexity.map(item => (
                  <div key={item.file} className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs w-14 truncate">{item.file}</span>
                    <div className="flex-1 bg-[#1e2a3a] rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${complexityColor(item.value)}`}
                        style={{ width: `${(item.value / maxComplexity) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-400 text-xs w-6">{item.value}</span>
                  </div>
                ))}
              </div>
              <button className="text-blue-400 text-xs mt-3">Show all files</button>
            </div>
          </div>

          {/* 下段：Insight + Priority + Actions */}
          <div className="bg-[#0d1b2a] border border-[#1e2a3a] rounded-lg p-4">
            <p className="text-sm mb-2">Project Insight <span className="text-gray-400">- プロジェクト分析</span></p>
            <p className="text-gray-400 text-xs leading-relaxed mb-3">
              {testData.insight.split(/(auth\.py|utils\.py|main\.py)/).map((part, i) =>
                ['auth.py', 'utils.py', 'main.py'].includes(part)
                  ? <span key={i} className="text-blue-400">{part}</span>
                  : part
              )}
            </p>
            <p className="text-sm mb-2">Priority <span className="text-gray-400">- 優先順位</span></p>
            {testData.priority.map((item, i) => (
              <div key={item.file} className="flex items-center gap-2 text-xs mb-1">
                <span className="text-gray-400">{i + 1}.</span>
                <span className="text-blue-400">{item.file}</span>
                <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                <span className="text-gray-300">(Debt: <span className={debtColor(item.debt)}>{item.debt}</span>,  Complexity <span className={item.complexity >= 8 ? 'text-red-400' : item.complexity >= 5 ? 'text-yellow-400' : 'text-gray-300'}>{item.complexity}</span>)</span>
              </div>
            ))}
            <p className="text-sm mt-3 mb-2">Recommended Actions <span className="text-gray-400">- 改善アクション</span></p>
            {testData.actions.slice(0, 1).map((action, i) => (
              <p key={i} className="text-gray-400 text-xs">
                ・<span className="text-blue-400">{action.split('の')[0]}.py</span>
                の{action.split('の').slice(1).join('の')}
              </p>
            ))}
          </div>
        </div>
      )}

        {/* Fail Summary */}
        {activeTab === 'failsummary' && (
          <div className="flex flex-col gap-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1e2a3a]">
                  {['File', 'Score', 'Issue', 'Debt', 'Complexity', 'Status'].map(h => (
                    <th key={h} className="text-left text-gray-400 px-2 py-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {testData.files.map(file => (
                  <tr
                    key={file.name}
                    onClick={() => setSelectedFile({ ...file, issueList: selectedFile.issueList })}
                    className={`border-b border-[#1e2a3a] cursor-pointer hover:bg-[#0d1b2a] transition-colors ${
                      selectedFile.name === file.name ? 'bg-[#0d1b2a]' : ''
                    }`}
                  >
                    <td className="px-2 py-2 text-gray-300">{file.name}</td>
                    <td className={`px-2 py-2 font-bold ${scoreColor(file.score)}`}>{file.score}</td>
                    <td className="px-2 py-2 text-gray-300">{file.issues}</td>
                    <td className={`px-2 py-2 ${debtColor(file.debt)}`}>{file.debt}</td>
                    <td className={`px-2 py-2 ${
                      file.complexity >= 8 ? 'text-red-400' :
                      file.complexity >= 6 ? 'text-yellow-400' :
                      'text-gray-300'
                    }`}>
                      {file.complexity}
                    </td>
                    <td className="px-2 py-2">
                      <span className={`inline-flex items-center gap-1`}>
                        <span className={`w-2 h-2 rounded-full ${statusDot(file.status)}`} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ファイル詳細 */}
            <div className="bg-[#0d1b2a] border border-[#1e2a3a] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-400 text-sm font-medium">{selectedFile.name}</span>
                <button className="flex items-center gap-1 text-blue-400 text-xs">
                  ✨ Review Refactor
                </button>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${statusDot(selectedFile.status)}`} />
                <span className="text-gray-300 text-xs">{selectedFile.status}</span>
              </div>
              <p className="text-gray-400 text-xs mb-1">
                Issues <span className="text-gray-400">{selectedFile.issues}</span> (
                High: <span className={selectedFile.issueList.filter(i => i.severity === 'high').length > 0 ? 'text-red-400' : 'text-gray-400'}>{selectedFile.issueList.filter(i => i.severity === 'high').length}</span>,{' '}
                Medium: <span className={selectedFile.issueList.filter(i => i.severity === 'medium').length > 0 ? 'text-yellow-400' : 'text-gray-400'}>{selectedFile.issueList.filter(i => i.severity === 'medium').length}</span>,{' '}
                Low: <span className={selectedFile.issueList.filter(i => i.severity === 'low').length > 0 ? 'text-green-400' : 'text-gray-400'}>{selectedFile.issueList.filter(i => i.severity === 'low').length}</span>
                )
              </p>
              <p className="text-gray-400 text-xs mb-3">Complexity <span className={
                selectedFile.complexity >= 8 ? 'text-red-400' :
                selectedFile.complexity >= 6 ? 'text-yellow-400' :
                selectedFile.complexity < 6 ? 'text-gray-400' :
                'text-gray-300'
              }>{selectedFile.complexity}</span></p>

              <div className="flex flex-col gap-1">
                {selectedFile.issueList.map((issue, i) => (
                  <div key={i} className="border border-[#1e2a3a] rounded">
                    <button
                      onClick={() => toggleIssue(`${i}`)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          issue.severity === 'high' ? 'bg-red-500' :
                          issue.severity === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                        }`} />
                        <span className={
                          issue.severity === 'high' ? 'text-red-400' :
                          issue.severity === 'medium' ? 'text-orange-400' :
                          'text-green-400'
                        }>{issue.category}</span>
                        <span className="text-gray-300">{issue.label}</span>
                      </div>
                      {expandedIssues[`${i}`]
                        ? <ChevronUp className="w-3 h-3 text-gray-500" />
                        : <ChevronDown className="w-3 h-3 text-gray-500" />
                      }
                    </button>
                    {expandedIssues[`${i}`] && (
                      <div className="px-3 pb-2 text-xs text-gray-400 border-t border-[#1e2a3a] pt-2">
                        <p>[ 問題 ] {issue.label}が検出されました</p>
                        <p className="mt-1">[ 改善 ] 処理を分割し、責務を明確にしてください</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}