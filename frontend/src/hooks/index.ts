import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { Session, Project, SearchResult, StatsOverview, StatsTrend, ProjectStats, KnowledgeItem, DataSource, Message } from '../types';

export function useProjects(source: DataSource) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getProjects(source)
      .then(setProjects)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [source]);

  return { projects, loading, error };
}

export function useSessions(source: DataSource, projectId?: string) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getSessions({ source, project_id: projectId || undefined, limit: 500 })
      .then(data => {
        console.log('[useSessions] loaded', data.length, 'sessions');
        setSessions(data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [source, projectId]);

  return { sessions, loading, error };
}

export function useSession(source: DataSource, sessionId: string | null) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) { setSession(null); return; }
    setLoading(true);
    api.getSession(sessionId, source)
      .then(setSession)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [source, sessionId]);

  return { session, loading, error };
}

export function useMessages(source: DataSource, sessionId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) { setMessages([]); return; }
    setLoading(true);
    api.getMessages(sessionId, source)
      .then(setMessages)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [source, sessionId]);

  return { messages, loading, error };
}

export function useSearch(source: DataSource, query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(() => {
      setLoading(true);
      api.search(query, source)
        .then(setResults)
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [source, query]);

  return { results, loading, error };
}

export function useStats(source: DataSource) {
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [trends, setTrends] = useState<StatsTrend[]>([]);
  const [projectStats, setProjectStats] = useState<ProjectStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getStatsOverview(source),
      api.getStatsTrends(30, source),
      api.getStatsProjects(source),
    ])
      .then(([o, t, p]) => { setOverview(o); setTrends(t); setProjectStats(p); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [source]);

  return { overview, trends, projectStats, loading, error };
}

export function useKnowledge(source: DataSource, sessionId: string | null) {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extract = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.extractKnowledge(sessionId, source);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, [source, sessionId]);

  return { items, loading, error, extract };
}
