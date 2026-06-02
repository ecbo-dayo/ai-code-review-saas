'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AnalyzeResponse, FileResult, IssueItem, SuggestionRequest } from '../lib/api';
import IssueTab from './IssueTab';

interface Props {
  result: AnalyzeResponse | null;
}

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

const complexityTextColor = (value: number) => {
  if (value >= 8) return 'text-red-400';
  if (value >= 6) return 'text-yellow-400';
  return 'text-gray-400';
};

export default function ResultDashboard({ result }: Props) {
  const [activeTab, setActiveTab] = useState<'summary' | 'failsummary'>('summary');
  const [selectedFile, setSelectedFile] = useState<FileResult | null>(result?.files[0] ?? null);
  const [expandedIssues, setExpandedIssues] = useState<{ [key: string]: boolean }>({});

  const toggleIssue = (key: string) => {
    setExpandedIssues(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!result) return <div className="text-gray-400">解析結果がありません</div>;

  const debtCounts = result.files.reduce(
    (acc, f) => {
      acc[f.debt] = (acc[f.debt] || 0) + 1;
      return acc;
    },
    { High: 0, Medium: 0, Low: 0 } as Record<string, number>
  );

  const statusCounts = result.files.reduce(
    (acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1;
      return acc;
    },
    { Bad: 0, Warning: 0, Good: 0 } as Record<string, number>
  );

  const sortedByPriority = [...result.files].sort((a, b) => a.score - b.score);
  const maxComplexity = Math.max(...result.files.map(f => f.complexity));

  const worstFile = sortedByPriority[0];
  const secondFile = sortedByPriority[1];
  const insight = result.overallScore >= 80
    ? '全体的に良好な品質を保っています。一部に軽微な改善点はありますが、大きな問題は見られません。'
    : result.overallScore >= 60
    ? `このプロジェクトは概ね良好ですが、一部に改善の余地があります。特に${worstFile?.name}に問題が集中しており、優先的な対応が必要です。${secondFile ? `また、${secondFile.name}にも軽微な問題が見られます。` : ''}`
    : `このプロジェクトは全体的に品質に課題があります。特に${worstFile?.name}に深刻な問題が集中しています。早急な改善が必要な状態です。`;

  const currentSelected = selectedFile ?? result.files[0];

  return (
    <div className="flex gap-4 h-full">
      {/* 左：コードビューア */}
      <div className="w-[640px] flex flex-col gap-3 flex-shrink-0">
        {result.files.map(file => (
          <div key={file.name} className="border border-[#1e2a3a] rounded-md overflow-hidden">
            <div className="bg-[#0d1b2a] px-4 py-2 flex items-center justify-between">
              <span className="text-gray-300 text-sm">{file.name}</span>
              <ChevronUp className="text-blue-400 w-4 h-4" />
            </div>
            <div className="bg-[#0a1628] h-[150px] flex">
              <div className="text-gray-600 text-sm px-3 pt-3 select-none min-w-[40px] text-right">
                {Array.from({ length: 5 }, (_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <div className="text-gray-500 text-sm p-3 font-mono text-xs">
                <div className="text-gray-500">コードを入力して解析してください</div>
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
            <div className="flex gap-4">
              {/* スコアカード */}
              <div className="flex-1 bg-[#0d1f35] border border-[#1e2a3a] rounded-lg p-4">
                <p className="text-sm mb-1">Quality Score <span className="text-gray-400">- コード品質スコア</span></p>
                <p className={`text-xl font-bold ${scoreColor(result.overallScore)}`}>{result.overallScore} / 100</p>
                <p className="text-sm mt-3 mb-1">Issues Count <span className="text-gray-400">- 問題数</span></p>
                <p className="text-blue-400 text-sm">{result.totalIssues} Issues</p>
                <p className="text-sm mt-3 mb-1">Technical Debt <span className="text-gray-400">- 技術負債</span></p>
                <div className="flex gap-3 text-sm">
                  <span className="text-red-400">High: {debtCounts.High}</span>
                  <span className="text-yellow-400">Medium: {debtCounts.Medium}</span>
                  <span className="text-green-400">Low: {debtCounts.Low}</span>
                </div>
                <p className="text-sm mt-3 mb-1">Status <span className="text-gray-400">- ファイル状態</span></p>
                <div className="flex gap-3 text-sm">
                  <span className="text-red-400">Bad: {statusCounts.Bad}</span>
                  <span className="text-yellow-400">Warning: {statusCounts.Warning}</span>
                  <span className="text-green-400">Good: {statusCounts.Good}</span>
                </div>
              </div>

              {/* 複雑度グラフ */}
              <div className="w-48 bg-[#0d1f35] border border-[#1e2a3a] rounded-lg p-4">
                <p className="text-sm mb-3">Complexity <span className="text-gray-400">- 複雑度</span></p>
                <div className="flex flex-col gap-2">
                  {result.files.map(item => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs w-14 truncate">{item.name}</span>
                      <div className="flex-1 bg-[#1e2a3a] rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${complexityColor(item.complexity)}`}
                          style={{ width: `${(item.complexity / maxComplexity) * 100}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-xs w-6">{item.complexity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Insight */}
            <div className="bg-[#0d1f35] border border-[#1e2a3a] rounded-lg p-4 h-fit">
              <p className="text-sm mb-2">Project Insight <span className="text-gray-400">- プロジェクト分析</span></p>
              <p className="text-gray-400 text-xs leading-relaxed mb-3">{insight}</p>
              <p className="text-sm mb-2">Priority <span className="text-gray-400">- 優先順位</span></p>
              {sortedByPriority.slice(0, 3).map((item, i) => (
                <div key={item.name} className="flex items-center gap-2 text-xs mb-1">
                  <span className="text-gray-400">{i + 1}.</span>
                  <span className="text-blue-400">{item.name}</span>
                  <span className={`w-2 h-2 rounded-full ${statusDot(item.status)}`} />
                  <span className="text-gray-300">(Debt: <span className={debtColor(item.debt)}>{item.debt}</span>, Complexity <span className={complexityTextColor(item.complexity)}>{item.complexity}</span>)</span>
                </div>
              ))}
              <p className="text-sm mt-3 mb-2">Recommended Actions <span className="text-gray-400">- 改善アクション</span></p>
              <p className="text-gray-400 text-xs">
                ・<span className="text-blue-400">{worstFile?.name}</span>
                の問題を優先的に修正してください
              </p>
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
                {result.files.map(file => (
                  <tr
                    key={file.name}
                    onClick={() => setSelectedFile(file)}
                    className={`border-b border-[#1e2a3a] cursor-pointer hover:bg-[#0d1f35] transition-colors ${
                      currentSelected.name === file.name ? 'bg-[#0d1f35]' : ''
                    }`}
                  >
                    <td className="px-2 py-2 text-gray-300">{file.name}</td>
                    <td className={`px-2 py-2 font-bold ${scoreColor(file.score)}`}>{file.score}</td>
                    <td className="px-2 py-2 text-gray-300">{file.issues}</td>
                    <td className={`px-2 py-2 ${debtColor(file.debt)}`}>{file.debt}</td>
                    <td className={`px-2 py-2 ${complexityTextColor(file.complexity)}`}>{file.complexity}</td>
                    <td className="px-2 py-2">
                      <span className={`w-2 h-2 rounded-full inline-block ${statusDot(file.status)}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ファイル詳細 */}
            <div className="bg-[#0d1f35] border border-[#1e2a3a] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-400 text-sm font-medium">{currentSelected.name}</span>
                <button className="text-blue-400 text-xs">✨ Review Refactor</button>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${statusDot(currentSelected.status)}`} />
                <span className="text-gray-300 text-xs">{currentSelected.status}</span>
              </div>
              <p className="text-gray-400 text-xs mb-1">
                Issues <span className="text-gray-400">{currentSelected.issues}</span> (
                High: <span className={currentSelected.issueList.filter((i: IssueItem) => i.severity === 'high').length > 0 ? 'text-red-400' : 'text-gray-400'}>{currentSelected.issueList.filter((i: IssueItem) => i.severity === 'high').length}</span>,{' '}
                Medium: <span className={currentSelected.issueList.filter((i: IssueItem) => i.severity === 'medium').length > 0 ? 'text-yellow-400' : 'text-gray-400'}>{currentSelected.issueList.filter((i: IssueItem) => i.severity === 'medium').length}</span>,{' '}
                Low: <span className={currentSelected.issueList.filter((i: IssueItem) => i.severity === 'low').length > 0 ? 'text-green-400' : 'text-gray-400'}>{currentSelected.issueList.filter((i: IssueItem) => i.severity === 'low').length}</span>
                )
              </p>
              <p className="text-gray-400 text-xs mb-3">
                Complexity <span className={complexityTextColor(currentSelected.complexity)}>{currentSelected.complexity}</span>
              </p>
              <div className="flex flex-col gap-1">
                {(() => {
                  const list = currentSelected.issueList;
                  const highs = list.filter(i => i.severity === 'high');
                  const mediums = list.filter(i => i.severity === 'medium');
                  const lows = list.filter(i => i.severity === 'low');

                  // カテゴリごとにまとめる関数
                  const groupByCategory = (items: IssueItem[]) => {
                    const map: { [cat: string]: IssueItem[] } = {};
                    items.forEach(i => {
                      if (!map[i.category]) map[i.category] = [];
                      map[i.category].push(i);
                    });
                    return map;
                  };

                  const mediumGroups = groupByCategory(mediums);
                  const lowGroups = groupByCategory(lows);

                  const tabs: React.ReactNode[] = [];

                  // High → issueごとに1タブ
                  highs.forEach((issue, idx) => {
                    const req: SuggestionRequest = {
                      type: 'issue',
                      code: currentSelected.code,
                      category: issue.category,
                      problem: issue.problem,
                    };
                    tabs.push(
                      <IssueTab
                        key={`high-${idx}`}
                        dotColor="bg-red-500"
                        textColor="text-red-400"
                        title={issue.category}
                        problems={[issue.problem]}
                        suggestReq={req}
                      />
                    );
                  });

                  // Medium → カテゴリごとに1タブ
                  Object.entries(mediumGroups).forEach(([cat, items]) => {
                    const totalCount = items.reduce((s, i) => s + i.count, 0);
                    const req: SuggestionRequest = {
                      type: 'issue',
                      code: currentSelected.code,
                      category: cat,
                      problem: items.map(i => i.problem).join(' / '),
                    };
                    tabs.push(
                      <IssueTab
                        key={`med-${cat}`}
                        dotColor="bg-yellow-500"
                        textColor="text-yellow-400"
                        title={totalCount > 1 ? `${cat} (${totalCount})` : cat}
                        problems={items.map(i => i.problem)}
                        suggestReq={req}
                      />
                    );
                  });

                  // Low → カテゴリごとに1タブ
                  Object.entries(lowGroups).forEach(([cat, items]) => {
                    const totalCount = items.reduce((s, i) => s + i.count, 0);
                    const req: SuggestionRequest = {
                      type: 'issue',
                      code: currentSelected.code,
                      category: cat,
                      problem: items.map(i => i.problem).join(' / '),
                    };
                    tabs.push(
                      <IssueTab
                        key={`low-${cat}`}
                        dotColor="bg-green-500"
                        textColor="text-green-400"
                        title={totalCount > 1 ? `${cat} (${totalCount})` : cat}
                        problems={items.map(i => i.problem)}
                        suggestReq={req}
                      />
                    );
                  });

                  // 複雑度タブ → medium/highのときだけ
                  if (currentSelected.complexityLevel === 'high' || currentSelected.complexityLevel === 'medium') {
                    const isHigh = currentSelected.complexityLevel === 'high';
                    const req: SuggestionRequest = {
                      type: 'complexity',
                      code: currentSelected.code,
                      complexity: currentSelected.complexity,
                    };
                    tabs.push(
                      <IssueTab
                        key="complexity"
                        dotColor={isHigh ? 'bg-red-500' : 'bg-yellow-500'}
                        textColor={isHigh ? 'text-red-400' : 'text-yellow-400'}
                        title="Complexity"
                        problems={[`複雑度が${currentSelected.complexity}です。${isHigh ? '処理が複雑で理解しにくい状態です。' : 'やや複雑になっています。'}`]}
                        suggestReq={req}
                      />
                    );
                  }
                  return tabs;
                })()}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}