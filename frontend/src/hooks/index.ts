import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Session, Project, SearchResult, StatsOverview, StatsTrend, ProjectStats, KnowledgeItem } from '../types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { projects, loading, error, refetch: fetch };
}

export function useSessions(projectId?: number) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = projectId 
        ? await api.getSessionsByProject(projectId)
        : await api.getSessions();
      setSessions(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { sessions, loading, error, refetch: fetch };
}

export function useSession(id: number) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSession(id);
      setSession(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch session');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { 
    if (id) fetch(); 
  }, [id, fetch]);

  return { session, loading, error, refetch: fetch };
}

export function useMessages(sessionId: number) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMessages(sessionId);
      const parsed = data.map(m => ({
        ...m,
        parsed: JSON.parse(m.data)
      }));
      setMessages(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { 
    if (sessionId) fetch(); 
  }, [sessionId, fetch]);

  return { messages, loading, error, refetch: fetch };
}

export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.search(query);
        setResults(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return { results, loading, error };
}

export function useStats() {
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [trends, setTrends] = useState<StatsTrend[]>([]);
  const [projectStats, setProjectStats] = useState<ProjectStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, trendsData, projectData] = await Promise.all([
        api.getStatsOverview(),
        api.getStatsTrends(30),
        api.getStatsProjects(),
      ]);
      setOverview(overviewData);
      setTrends(trendsData);
      setProjectStats(projectData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { overview, trends, projectStats, loading, error, refetch: fetch };
}

export function useKnowledge(sessionId: number) {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extract = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.extractKnowledge(sessionId);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to extract knowledge');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  return { items, loading, error, extract };
}