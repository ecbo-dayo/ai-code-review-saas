import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface FileInput {
  filename: string;
  code: string;
}

export interface IssueItem {
  category: string;
  label: string;
  severity: string;
  problem: string;
  count: number;
}

export interface FileResult {
  name: string;
  score: number;
  issues: number;
  debt: string;
  complexity: number;
  complexityLevel: string;
  status: string;
  issueList: IssueItem[];
  code: string;
}

export interface AnalyzeResponse {
  overallScore: number;
  totalFiles: number;
  totalIssues: number;
  files: FileResult[];
}

export const analyzeCode = async (files: FileInput[]): Promise<AnalyzeResponse> => {
  const response = await axios.post(`${API_URL}/api/analyze/`, { files });
  return response.data;
};

// ---- AI提案（モック窓口を呼ぶ）----

export interface SuggestionRequest {
  type: 'issue' | 'complexity' | 'refactor';
  code: string;
  category?: string;
  problem?: string;
  complexity?: number;
}

export interface SuggestionResponse {
  suggestion: string;
  isMock: boolean;
}

export const getSuggestion = async (req: SuggestionRequest): Promise<SuggestionResponse> => {
  const response = await axios.post(`${API_URL}/api/suggest/`, req);
  return response.data;
};