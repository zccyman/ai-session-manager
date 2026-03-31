import { BarChart3, TrendingUp, Folder } from 'lucide-react';

interface StatsPanelProps {
  overview: any;
  trends: any[];
  projectStats: any[];
  loading: boolean;
}

export function StatsPanel({ overview, projectStats, loading }: StatsPanelProps) {
  if (loading) return <div className="text-center py-8 text-[#8F959E]">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-[#DEE0E3]">
          <div className="flex items-center gap-2 text-[#8F959E] text-xs mb-2"><TrendingUp className="w-3.5 h-3.5" />总消息数</div>
          <p className="text-2xl font-bold text-[#1F2329]">{overview?.total_messages?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#DEE0E3]">
          <div className="flex items-center gap-2 text-[#8F959E] text-xs mb-2"><BarChart3 className="w-3.5 h-3.5" />总会话数</div>
          <p className="text-2xl font-bold text-[#1F2329]">{overview?.total_sessions || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#DEE0E3]">
          <div className="flex items-center gap-2 text-[#8F959E] text-xs mb-2"><Folder className="w-3.5 h-3.5" />项目数</div>
          <p className="text-2xl font-bold text-[#1F2329]">{overview?.total_projects || 0}</p>
        </div>
      </div>

      {projectStats && projectStats.length > 0 && (
        <div className="bg-white rounded-xl border border-[#DEE0E3] p-4">
          <h3 className="text-sm font-semibold text-[#1F2329] mb-3">项目分布</h3>
          <div className="space-y-2">
            {projectStats.slice(0, 10).map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-[#646A73] w-32 truncate">{p.name || p.project_id}</span>
                <div className="flex-1 bg-[#F0F1F2] rounded-full h-2">
                  <div className="bg-[#3370FF] rounded-full h-2" style={{ width: `${Math.min((p.session_count / (projectStats[0]?.session_count || 1)) * 100, 100)}%` }} />
                </div>
                <span className="text-xs text-[#8F959E] w-12 text-right">{p.session_count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
