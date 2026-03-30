import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { TrendingUp, BarChart3, Folder } from 'lucide-react';
import { StatsOverview, StatsTrend, ProjectStats } from '../types';

interface StatsPanelProps {
  overview: StatsOverview | null;
  trends: StatsTrend[];
  projectStats: ProjectStats[];
  loading: boolean;
}

const COLORS = ['#6366f1', '#8b5cf6', '#22d3ee', '#f59e0b', '#10b981', '#ef4444'];

export function StatsPanel({ overview, trends, projectStats, loading }: StatsPanelProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Total Sessions</span>
            </div>
            <p className="text-2xl font-bold text-slate-100">{overview.total_sessions}</p>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">Total Messages</span>
            </div>
            <p className="text-2xl font-bold text-slate-100">{overview.total_messages}</p>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Folder className="w-4 h-4" />
              <span className="text-sm">Total Projects</span>
            </div>
            <p className="text-2xl font-bold text-slate-100">{overview.total_projects}</p>
          </div>
        </div>
      )}

      {/* Session Trends Chart */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <h3 className="text-sm font-medium text-slate-200 mb-4">Session Trends (Last 30 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#f8fafc' }}
              />
              <Line type="monotone" dataKey="sessions" stroke="#6366f1" strokeWidth={2} dot={false} name="Sessions" />
              <Line type="monotone" dataKey="messages" stroke="#22d3ee" strokeWidth={2} dot={false} name="Messages" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project Distribution */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h3 className="text-sm font-medium text-slate-200 mb-4">Sessions by Project</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStats}
                  dataKey="session_count"
                  nameKey="project_name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {projectStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {projectStats.slice(0, 4).map((stat, index) => (
              <div key={stat.project_name} className="flex items-center gap-1 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-slate-400 truncate max-w-[100px]">{stat.project_name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h3 className="text-sm font-medium text-slate-200 mb-4">Messages by Project</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectStats.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="project_name" 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  interval={0}
                />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Bar dataKey="message_count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}