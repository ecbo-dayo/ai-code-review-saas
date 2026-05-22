import axios from 'axios';

const API_URL = 'http://localhost:8000';

export interface FileInput {
  filename: string;
  code: string;
}

export interface IssueItem {
  category: string;
  label: string;
  severity: string;
}

export interface FileResult {
  name: string;
  score: number;
  issues: number;
  debt: string;
  complexity: number;
  status: string;
  issueList: IssueItem[];
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