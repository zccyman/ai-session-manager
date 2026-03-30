export interface Session {
  id: number;
  project_id: number;
  title: string;
  directory: string;
  time_created: string;
  time_updated: string;
  message_count?: number;
  project_name?: string;
}

export interface Message {
  id: number;
  session_id: number;
  time_created: string;
  data: string;
  parts?: Part[];
}

export interface Part {
  id: number;
  message_id: number;
  session_id: number;
  data: string;
}

export interface Project {
  id: number;
  name: string;
  directory: string;
  session_count?: number;
}

export interface SearchResult {
  session_id: number;
  session_title: string;
  message_id: number;
  snippet: string;
  highlights: string[];
}

export interface KnowledgeItem {
  id: number;
  session_id: number;
  category: string;
  content: string;
  created_at: string;
}

export interface StatsOverview {
  total_sessions: number;
  total_messages: number;
  total_projects: number;
}

export interface StatsTrend {
  date: string;
  sessions: number;
  messages: number;
}

export interface ProjectStats {
  project_name: string;
  session_count: number;
  message_count: number;
}

export type DataSource = 'kilo' | 'opencode';

export interface AppState {
  dataSource: DataSource;
  projects: Project[];
  selectedProject: number | null;
  selectedSession: number | null;
}