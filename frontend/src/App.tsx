import { useState, useMemo, useCallback } from 'react';
import { SearchBar } from './components/Search/SearchBar';
import { SearchResults } from './components/Search/SearchResults';
import { MessageThread } from './components/Messages/MessageThread';
import { StatsPanel } from './components/Stats/StatsPanel';
import { ExportButton } from './components/Export/ExportButton';
import { useProjects, useSessions, useMessages, useSearch, useStats } from './hooks';
import { api } from './services/api';
import type { DataSource } from './types';
import {
  MessageSquare, Folder, ArrowLeft, FileText,
  CheckSquare, Square, Clock, Hash,
  BarChart3, LayoutGrid, Copy, Check
} from 'lucide-react';

type TimeFilter = 'all' | 'today' | 'week' | 'month';
type SortBy = 'updated' | 'messages';

export default function App() {
  const [dataSource, setDataSource] = useState<DataSource>('kilo');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { projects } = useProjects(dataSource);
  const { sessions, loading: sessionsLoading } = useSessions(dataSource, selectedProject ?? undefined);
  const { messages, loading: messagesLoading } = useMessages(dataSource, selectedSession);
  const { results: searchResults, loading: searchLoading } = useSearch(dataSource, searchQuery);
  const { overview, projectStats, loading: statsLoading } = useStats(dataSource);

  const filteredSessions = useMemo(() => {
    let list = [...sessions];
    const now = Date.now();
    if (timeFilter === 'today') list = list.filter(s => now - (s.time_updated || s.time_created) < 86400000);
    else if (timeFilter === 'week') list = list.filter(s => now - (s.time_updated || s.time_created) < 604800000);
    else if (timeFilter === 'month') list = list.filter(s => now - (s.time_updated || s.time_created) < 2592000000);
    if (sortBy === 'messages') list.sort((a, b) => (b.message_count || 0) - (a.message_count || 0));
    return list;
  }, [sessions, timeFilter, sortBy]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIds.size === filteredSessions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSessions.map(s => s.id)));
    }
  }, [selectedIds.size, filteredSessions]);

  const exportMarkdown = useCallback(async (sessionIds: string[]) => {
    for (const id of sessionIds) {
      try { await api.exportMarkdown(id, dataSource); }
      catch (e) { console.error('Export failed:', id, e); }
    }
  }, [dataSource]);

  const copySessionMarkdown = useCallback(async (sessionId: string) => {
    try {
      const md = await api.getSessionMarkdown(sessionId, dataSource);
      await navigator.clipboard.writeText(md);
      setCopiedId(sessionId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) { console.error('Copy failed:', e); }
  }, [dataSource]);

  const copySelectedMarkdown = useCallback(async () => {
    try {
      const md = await api.batchGetMarkdown([...selectedIds], sessions, dataSource);
      await navigator.clipboard.writeText(md);
      setCopiedId('__batch__');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) { console.error('Batch copy failed:', e); }
  }, [selectedIds, sessions, dataSource]);

  const sessionObj = sessions.find(s => s.id === selectedSession);

  return (
    <div className="h-screen flex flex-col bg-[#F5F6F7]">
      {/* Top Bar */}
      <header className="h-14 bg-white border-b border-[#DEE0E3] flex items-center px-4 gap-4 flex-shrink-0">
        <h1 className="text-base font-semibold text-[#1F2329] flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#3370FF]" />
          AI Session Manager
        </h1>
        <div className="w-px h-6 bg-[#DEE0E3]" />
        <div className="flex bg-[#F0F1F2] rounded-lg p-0.5">
          {(['kilo', 'opencode'] as DataSource[]).map(src => (
            <button key={src} onClick={() => setDataSource(src)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                dataSource === src ? 'bg-white text-[#3370FF] shadow-sm' : 'text-[#8F959E] hover:text-[#646A73]'
              }`}>
              {src === 'kilo' ? 'Kilo Code' : 'OpenCode'}
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-md mx-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="flex items-center gap-4 text-xs text-[#8F959E]">
          <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{overview?.total_sessions || 0} sessions</span>
          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{overview?.total_messages?.toLocaleString() || 0} msgs</span>
          <span className="flex items-center gap-1"><Folder className="w-3 h-3" />{overview?.total_projects || 0} projects</span>
        </div>
        <BarChart3 className="w-4 h-4 text-[#8F959E] cursor-pointer hover:text-[#3370FF] ml-2" title="Analytics" />
      </header>

      {/* Main */}
      {searchQuery ? (
        <div className="flex-1 overflow-auto p-6">
          <SearchResults results={searchResults} query={searchQuery} loading={searchLoading} onSelectSession={setSelectedSession} />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Projects */}
          <aside className="w-52 bg-white border-r border-[#DEE0E3] flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-[#DEE0E3]">
              <p className="text-xs font-semibold text-[#8F959E] uppercase tracking-wider">Projects</p>
            </div>
            <div className="flex-1 overflow-auto py-1">
              <button onClick={() => setSelectedProject(null)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                  selectedProject === null ? 'bg-[#E8F0FF] text-[#3370FF]' : 'text-[#646A73] hover:bg-[#F0F1F2]'
                }`}>
                <LayoutGrid className="w-3.5 h-3.5" /> All
              </button>
              {projects.filter(p => p.name && p.name !== 'Unknown').map(project => (
                <button key={project.id} onClick={() => setSelectedProject(project.id)}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                    selectedProject === project.id ? 'bg-[#E8F0FF] text-[#3370FF]' : 'text-[#646A73] hover:bg-[#F0F1F2]'
                  }`}>
                  <Folder className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate flex-1">{project.name}</span>
                  <span className="text-xs text-[#8F959E]">{project.session_count || 0}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Middle: Session List */}
          <section className="w-96 bg-white border-r border-[#DEE0E3] flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-[#DEE0E3] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button onClick={toggleAll} className="p-1 text-[#8F959E] hover:text-[#3370FF]">
                    {selectedIds.size === filteredSessions.length && filteredSessions.length > 0
                      ? <CheckSquare className="w-4 h-4 text-[#3370FF]" />
                      : <Square className="w-4 h-4" />}
                  </button>
                  <span className="text-xs text-[#8F959E]">{filteredSessions.length} sessions</span>
                </div>
                {selectedIds.size > 0 && (
                  <div className="flex gap-1.5">
                    <button onClick={copySelectedMarkdown}
                      className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-[#DEE0E3] text-[#646A73] hover:bg-[#F0F1F2] transition-colors">
                      {copiedId === '__batch__' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      复制选中 ({selectedIds.size})
                    </button>
                    <ExportButton label="导出选中" count={selectedIds.size} onExport={() => exportMarkdown([...selectedIds])} />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-[#F0F1F2] rounded-md p-0.5">
                  {([['all', '全部'], ['today', '今天'], ['week', '7天'], ['month', '30天']] as [TimeFilter, string][]).map(([k, v]) => (
                    <button key={k} onClick={() => setTimeFilter(k)}
                      className={`px-2 py-0.5 rounded text-xs ${
                        timeFilter === k ? 'bg-white text-[#3370FF] shadow-sm' : 'text-[#8F959E]'
                      }`}>{v}</button>
                  ))}
                </div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}
                  className="text-xs border border-[#DEE0E3] rounded px-1.5 py-0.5 text-[#646A73] bg-white">
                  <option value="updated">最新更新</option>
                  <option value="messages">消息数</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {sessionsLoading ? (
                <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-[#3370FF] border-t-transparent rounded-full animate-spin" /></div>
              ) : filteredSessions.map((session, index) => (
                <div key={session.id}
                  className={`px-3 py-3 border-b border-[#F0F1F2] cursor-pointer transition-colors flex items-start gap-2 ${
                    selectedSession === session.id ? 'bg-[#E8F0FF]' : 'hover:bg-[#F8F9FA]'
                  }`}>
                  <button onClick={e => { e.stopPropagation(); toggleSelect(session.id); }} className="mt-1 flex-shrink-0">
                    {selectedIds.has(session.id)
                      ? <CheckSquare className="w-4 h-4 text-[#3370FF]" />
                      : <Square className="w-4 h-4 text-[#C4C7CC] hover:text-[#8F959E]" />}
                  </button>
                  <span className="mt-1 text-xs text-[#8F959E] w-6 text-right flex-shrink-0">{index + 1}</span>
                  <button onClick={() => setSelectedSession(session.id)} className="text-left flex-1 min-w-0">
                    <p className="text-sm text-[#1F2329] truncate font-medium">{session.title || '无标题'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {session.project_name && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-[#E8F0FF] text-[#3370FF]">{session.project_name}</span>
                      )}
                      <span className="text-xs text-[#8F959E] flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />{timeAgo(session.time_updated || session.time_created)}
                      </span>
                      <span className="text-xs text-[#8F959E]">{session.message_count || 0} msgs</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Right: Preview */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {selectedSession && sessionObj ? (
              <>
                <div className="p-4 border-b border-[#DEE0E3] bg-white flex items-center justify-between flex-shrink-0">
                  <div className="min-w-0 flex-1">
                    <button onClick={() => setSelectedSession(null)}
                      className="text-xs text-[#3370FF] hover:underline flex items-center gap-1 mb-1">
                      <ArrowLeft className="w-3 h-3" /> 返回列表
                    </button>
                    <h2 className="text-base font-semibold text-[#1F2329] truncate">{sessionObj.title || '无标题'}</h2>
                    <p className="text-xs text-[#8F959E] mt-0.5">
                      {sessionObj.project_name} · {sessionObj.message_count || 0} messages
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copySessionMarkdown(selectedSession)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-[#DEE0E3] text-sm rounded-lg text-[#646A73] hover:bg-[#F0F1F2] transition-colors">
                      {copiedId === selectedSession ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      复制
                    </button>
                    <ExportButton label="导出" onExport={() => exportMarkdown([selectedSession])} />
                  </div>
                </div>
                <div className="flex-1 overflow-auto">
                  <MessageThread messages={messages} loading={messagesLoading} />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#8F959E]">
                <FileText className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">选择一个会话查看内容</p>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

function timeAgo(ts: number): string {
  if (!ts) return '';
  const diff = Date.now() - ts;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
