'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getSuggestion, SuggestionRequest } from '../lib/api';

interface Props {
  dotColor: string;      // ●の色
  textColor: string;     // カテゴリ名の色
  title: string;         // 見出し（例: "Security" や "Structure (2)" や "複雑度"）
  problems: string[];    // 問題文（1個以上）
  suggestReq: SuggestionRequest;  // AIに渡すリクエスト
}

export default function IssueTab({ dotColor, textColor, title, problems, suggestReq }: Props) {
  const [open, setOpen] = useState(false);
  const [suggestion, setSuggestion] = useState<string>('');
  const [isMock, setIsMock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    // 初めて開いたときだけAIを呼ぶ（遅延生成）
    if (next && !loaded) {
      setLoading(true);
      try {
        const res = await getSuggestion(suggestReq);
        setSuggestion(res.suggestion);
        setIsMock(res.isMock);
        setLoaded(true);
      } catch {
        setSuggestion('改善案の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="border border-[#1e2a3a] rounded">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-xs"
      >
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <span className={textColor}>{title}</span>
        </div>
        {open
          ? <ChevronUp className="w-3 h-3 text-gray-500" />
          : <ChevronDown className="w-3 h-3 text-gray-500" />
        }
      </button>

      {open && (
        <div className="px-3 pb-3 text-xs border-t border-[#1e2a3a] pt-2 flex flex-col gap-2">
          {/* 問題（バック由来） */}
          <div className="flex flex-col gap-1">
            {problems.map((p, i) => (
              <p key={i} className="text-gray-400">
                <span className="text-gray-500">[ 問題 ]</span> {p}
              </p>
            ))}
          </div>

          {/* 改善（AI由来） */}
          <div>
            <p className="text-gray-300 mb-1 flex items-center gap-1">
              <span>✨ 改善</span>
              <span className="text-[10px] text-gray-500 border border-gray-600 rounded px-1">
                {isMock ? 'AI (mock)' : 'AI'}
              </span>
            </p>
            {loading
              ? <p className="text-gray-500">生成中...</p>
              : <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{suggestion}</p>
            }
          </div>
        </div>
      )}
    </div>
  );
}