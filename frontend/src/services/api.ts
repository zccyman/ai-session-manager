import { Session, Message, Project, SearchResult, KnowledgeItem, StatsOverview, StatsTrend, ProjectStats } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export const api = {
  // Projects
  getProjects: () => fetchApi<Project[]>('/projects'),
  getProject: (id: number) => fetchApi<Project>(`/projects/${id}`),
  
  // Sessions
  getSessions: (params?: { project_id?: number; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.project_id) query.set('project_id', params.project_id.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    return fetchApi<Session[]>(`/sessions?${query}`);
  },
  getSession: (id: number) => fetchApi<Session>(`/sessions/${id}`),
  getSessionsByProject: (projectId: number) => fetchApi<Session[]>(`/sessions/by-project/${projectId}`),
  getSessionsByDate: (date: string) => fetchApi<Session[]>(`/sessions/by-date/${date}`),
  
  // Messages
  getMessages: (sessionId: number) => fetchApi<Message[]>(`/sessions/${sessionId}/messages`),
  getMessage: (id: number) => fetchApi<Message>(`/messages/${id}`),
  
  // Search
  search: (query: string, limit = 20, offset = 0) => 
    fetchApi<SearchResult[]>(`/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`),
  
  // Stats
  getStatsOverview: () => fetchApi<StatsOverview>('/stats/overview'),
  getStatsTrends: (days = 30) => fetchApi<StatsTrend[]>(`/stats/trends?days=${days}`),
  getStatsProjects: () => fetchApi<ProjectStats[]>('/stats/projects'),
  
  // Knowledge
  extractKnowledge: (sessionId: number) => 
    fetchApi<KnowledgeItem[]>(`/knowledge/extract?session_id=${sessionId}`, { method: 'POST' }),
  getKnowledgeBySession: (sessionId: number) => 
    fetchApi<KnowledgeItem[]>(`/knowledge?session_id=${sessionId}`),
  
  // Export
  exportMarkdown: (sessionId: number) => 
    fetch(`${API_BASE}/export/markdown/${sessionId}`, { method: 'POST' })
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session-${sessionId}.md`;
        a.click();
        URL.revokeObjectURL(url);
      }),
  batchExport: (sessionIds: number[]) => 
    fetch(`${API_BASE}/export/batch`, { 
      method: 'POST',
      body: JSON.stringify({ session_ids: sessionIds })
    })
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sessions-export.zip';
        a.click();
        URL.revokeObjectURL(url);
      }),
};