import { useState } from 'react';
import { Header } from '../components/Layout/Header';
import { Sidebar } from '../components/Layout/Sidebar';
import { SessionList } from '../components/Sessions/SessionList';
import { MessageThread } from '../components/Messages/MessageThread';
import { SearchBar } from '../components/Search/SearchBar';
import { SearchResults } from '../components/Search/SearchResults';
import { StatsPanel } from '../components/Stats/StatsPanel';
import { KnowledgeCard } from '../components/Knowledge/KnowledgeCard';
import { ExportButton } from '../components/Export/ExportButton';
import { useProjects, useSessions, useSession, useMessages, useSearch, useStats, useKnowledge } from '../hooks';
import { DataSource } from '../types';
import { format } from 'date-fns';

export default function App() {
  const [dataSource, setDataSource] = useState<DataSource>('kilo');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { projects, loading: projectsLoading } = useProjects();
  const { sessions, loading: sessionsLoading, refetch: refetchSessions } = useSessions(selectedProject ?? undefined);
  const { session, loading: sessionLoading, refetch: refetchSession } = useSession(selectedSession ?? 0);
  const { messages, loading: messagesLoading } = useMessages(selectedSession ?? 0);
  const { results: searchResults, loading: searchLoading } = useSearch(searchQuery);
  const { overview, trends, projectStats, loading: statsLoading } = useStats();
  const { items: knowledgeItems, loading: knowledgeLoading, error: knowledgeError, extract: extractKnowledge } = useKnowledge(selectedSession ?? 0);
  
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (page !== 'sessions') {
      setSelectedSession(null);
    }
  };
  
  const handleSelectSession = (sessionId: number) => {
    setSelectedSession(sessionId);
    setCurrentPage('sessions');
  };
  
  const handleExportSingle = async () => {
    if (selectedSession) {
      import { api } from '../services/api';
      await api.exportMarkdown(selectedSession);
    }
  };
  
  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-100">Dashboard</h2>
            </div>
            <StatsPanel 
              overview={overview} 
              trends={trends} 
              projectStats={projectStats} 
              loading={statsLoading} 
            />
            <div className="mt-6">
              <h3 className="text-lg font-medium text-slate-200 mb-4">Recent Sessions</h3>
              <SessionList 
                sessions={sessions.slice(0, 5)} 
                loading={sessionsLoading}
                onSelectSession={handleSelectSession}
              />
            </div>
          </div>
        );
      
      case 'sessions':
        if (selectedSession) {
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  ← Back to sessions
                </button>
                <div className="flex items-center gap-3">
                  <ExportButton onExport={handleExportSingle} label="Export" />
                </div>
              </div>
              
              {session && (
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                  <h2 className="text-lg font-semibold text-slate-100">{session.title || 'Untitled Session'}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                    <span>{session.directory}</span>
                    <span>Created: {format(new Date(session.time_created), 'MMM d, yyyy HH:mm')}</span>
                    {session.project_name && <span className="text-indigo-400">{session.project_name}</span>}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <MessageThread messages={messages} loading={messagesLoading} />
                </div>
                <div>
                  <KnowledgeCard 
                    items={knowledgeItems}
                    loading={knowledgeLoading}
                    error={knowledgeError}
                    onExtract={() => extractKnowledge()}
                  />
                </div>
              </div>
            </div>
          );
        }
        
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-100">Sessions</h2>
              <ExportButton onExport={() => {
                api.batchExport(sessions.map(s => s.id));
              }} label="Batch Export" />
            </div>
            <SessionList 
              sessions={sessions} 
              loading={sessionsLoading}
              onSelectSession={handleSelectSession}
            />
          </div>
        );
      
      case 'search':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-100">Search</h2>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <SearchResults 
              results={searchResults}
              query={searchQuery}
              loading={searchLoading}
              onSelectSession={handleSelectSession}
            />
          </div>
        );
      
      case 'stats':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-100">Statistics</h2>
            <StatsPanel 
              overview={overview} 
              trends={trends} 
              projectStats={projectStats} 
              loading={statsLoading} 
            />
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <Header dataSource={dataSource} onDataSourceChange={setDataSource} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={(id) => {
            setSelectedProject(id);
            setSelectedSession(null);
          }}
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}