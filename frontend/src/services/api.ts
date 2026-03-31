import type { Session, Message, Project, SearchResult, KnowledgeItem, StatsOverview, StatsTrend, ProjectStats, DataSource } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

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
  // Sources
  getSources: () => fetchApi<{ available: string[]; default: string; paths: Record<string, string> }>('/sources'),

  // Sessions
  getSessions: (params?: { source?: DataSource; project_id?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.source) query.set('source', params.source);
    if (params?.project_id) query.set('project_id', params.project_id);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    return fetchApi<Session[]>(`/sessions?${query}`);
  },
  getSession: (id: string, source?: DataSource) => {
    const query = new URLSearchParams();
    if (source) query.set('source', source);
    return fetchApi<Session>(`/sessions/${id}?${query}`);
  },

  // Messages (with parts, parsed data)
  getMessages: (sessionId: string, source?: DataSource) => {
    const query = new URLSearchParams();
    if (source) query.set('source', source);
    return fetchApi<any[]>(`/messages/session/${sessionId}/with-parts?${query}`);
  },

  // Projects
  getProjects: (source?: DataSource) => {
    const query = new URLSearchParams();
    if (source) query.set('source', source);
    return fetchApi<Project[]>(`/projects?${query}`);
  },

  // Search
  search: (query: string, source?: DataSource, limit = 20, offset = 0) => {
    const params = new URLSearchParams();
    params.set('q', query);
    if (source) params.set('source', source);
    params.set('limit', limit.toString());
    params.set('offset', offset.toString());
    return fetchApi<SearchResult[]>(`/search?${params}`);
  },

  // Stats
  getStatsOverview: (source?: DataSource) => {
    const query = new URLSearchParams();
    if (source) query.set('source', source);
    return fetchApi<StatsOverview>(`/stats/overview?${query}`);
  },
  getStatsTrends: (days = 30, source?: DataSource) => {
    const query = new URLSearchParams();
    query.set('days', days.toString());
    if (source) query.set('source', source);
    return fetchApi<StatsTrend[]>(`/stats/trends?${query}`);
  },
  getStatsProjects: (source?: DataSource) => {
    const query = new URLSearchParams();
    if (source) query.set('source', source);
    return fetchApi<ProjectStats[]>(`/stats/projects?${query}`);
  },

  // Knowledge
  extractKnowledge: (sessionId: string, source?: DataSource) =>
    fetchApi<KnowledgeItem[]>(`/knowledge/extract?session_id=${sessionId}&source=${source || 'kilo'}`, { method: 'POST' }),

  // Export
  exportMarkdown: (sessionId: string, source?: DataSource) =>
    fetch(`${API_BASE}/export/markdown/${sessionId}?source=${source || 'kilo'}`, { method: 'POST' })
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session-${sessionId}.md`;
        a.click();
        URL.revokeObjectURL(url);
      }),

  // Copy session as Markdown text
  getSessionMarkdown: async (sessionId: string, source?: DataSource): Promise<string> => {
    const query = new URLSearchParams();
    if (source) query.set('source', source);
    const msgs = await fetchApi<any[]>(`/messages/session/${sessionId}/with-parts?${query}`);
    let md = '';
    for (const msg of msgs) {
      const pd = msg.parsed_data || {};
      const role = pd.role || 'assistant';
      let content = '';
      if (pd.content) content = pd.content;
      else {
        for (const part of (msg.parts || [])) {
          try { const d = typeof part.data === 'string' ? JSON.parse(part.data) : part.data; if (d?.text) { content = d.text; break; } } catch {}
        }
      }
      if (!content) continue;
      md += `## ${role === 'user' ? '👤 User' : '🤖 AI'}\n\n${content}\n\n`;
    }
    return md;
  },

  batchGetMarkdown: async (sessionIds: string[], sessions: any[], source?: DataSource): Promise<string> => {
    let md = '';
    for (const id of sessionIds) {
      const sess = sessions.find((s: any) => s.id === id);
      md += `# ${sess?.title || 'Untitled Session'}\n\n`;
      if (sess?.project_name) md += `**Project:** ${sess.project_name}\n\n`;
      md += `---\n\n`;
      const msgs = await fetchApi<any[]>(`/messages/session/${id}/with-parts?source=${source || 'kilo'}`);
      for (const msg of msgs) {
        const pd = msg.parsed_data || {};
        const role = pd.role || 'assistant';
        let content = '';
        if (pd.content) content = pd.content;
        else {
          for (const part of (msg.parts || [])) {
            try { const d = typeof part.data === 'string' ? JSON.parse(part.data) : part.data; if (d?.text) { content = d.text; break; } } catch {}
          }
        }
        if (!content) continue;
        md += `## ${role === 'user' ? '👤 User' : '🤖 AI'}\n\n${content}\n\n`;
      }
      md += `\n---\n\n`;
    }
    return md;
  },
};
