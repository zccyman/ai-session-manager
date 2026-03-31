import { useState, useCallback, useEffect, useRef } from 'react';
import { SearchBar } from '../Search/SearchBar';
import { TabContentList } from './TabContentList';
import { TabContentDetail } from './TabContentDetail';
import { api } from '../../services/api';
import type { TabContent } from '../../types';
import { Globe, Plus, RefreshCw, Download, Loader2 } from 'lucide-react';

const DEFAULT_EXPORT_DIR = 'G:\\knowledge\\source\\browser-export';

export function TabContents() {
  const [contents, setContents] = useState<TabContent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<TabContent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ status: string; total: number; exported: number; failed: number; output_dir: string | null; errors: string[] } | null>(null);
  const [showExportConfig, setShowExportConfig] = useState(false);
  const [exportDir, setExportDir] = useState(DEFAULT_EXPORT_DIR);
  const exportPollRef = useRef<number | null>(null);

  const loadContents = useCallback(async () => {
    setLoading(true);
    try {
      const data = searchQuery
        ? await api.searchTabContents(searchQuery)
        : await api.getTabContents();
      setContents(data);
    } catch (error) {
      console.error('Failed to load tab contents:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadContents();
  }, [loadContents]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadContents();
    }, 10000);
    return () => clearInterval(interval);
  }, [loadContents]);

  useEffect(() => {
    if (selectedId) {
      api.getTabContent(selectedId).then(setSelectedContent).catch(console.error);
    } else {
      setSelectedContent(null);
    }
  }, [selectedId]);

  const handleCopy = useCallback(async (content: TabContent) => {
    try {
      await navigator.clipboard.writeText(content.markdown);
      setCopiedId(content.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }, []);

  const handleDownload = useCallback((content: TabContent) => {
    const blob = new Blob([content.markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(content.title || 'untitled').replace(/[<>:"/\\|?*]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('确定删除此内容？')) return;
    try {
      await api.deleteTabContent(id);
      setContents((prev) => prev.filter((c) => c.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setSelectedContent(null);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }, [selectedId]);

  const handleExport = useCallback(async () => {
    if (!exportDir.trim()) return;
    setExporting(true);
    setExportProgress(null);
    try {
      const { task_id } = await api.exportTabContentsToDirectory(exportDir.trim());
      setShowExportConfig(false);

      const poll = async () => {
        try {
          const progress = await api.getTabExportProgress(task_id);
          setExportProgress(progress);
          if (progress.status === 'completed' || progress.status === 'failed') {
            setExporting(false);
            if (exportPollRef.current) {
              clearInterval(exportPollRef.current);
              exportPollRef.current = null;
            }
          }
        } catch (e) {
          console.error('Poll error:', e);
        }
      };

      exportPollRef.current = window.setInterval(poll, 500);
      poll();
    } catch (error) {
      console.error('Export failed:', error);
      setExporting(false);
    }
  }, [exportDir]);

  useEffect(() => {
    return () => {
      if (exportPollRef.current) {
        clearInterval(exportPollRef.current);
      }
    };
  }, []);

  const handleAdd = useCallback(async () => {
    const markdown = prompt('粘贴 Markdown 内容：');
    if (!markdown) return;
    const title = prompt('标题：') || '导入的内容';
    try {
      const newContent = await api.createTabContent({ title, markdown });
      setContents((prev) => [newContent, ...prev]);
      setSelectedId(newContent.id);
    } catch (error) {
      console.error('Create failed:', error);
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-[#F5F6F7]">
      {/* Header */}
      <div className="p-4 border-b border-[#DEE0E3] bg-white flex items-center gap-4">
        <h2 className="text-base font-semibold text-[#1F2329] flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#3370FF]" />
          标签页内容
        </h2>
        <div className="flex-1 max-w-md">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#3370FF] text-white text-sm rounded-lg hover:bg-[#2860E1]"
        >
          <Plus className="w-4 h-4" />
          手动添加
        </button>
        <button
          onClick={() => setShowExportConfig(!showExportConfig)}
          disabled={exporting}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#34C759] text-white text-sm rounded-lg hover:bg-[#2DB14D] disabled:opacity-50"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          批量导出
        </button>
        <button
          onClick={() => loadContents()}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 border border-[#DEE0E3] text-sm rounded-lg text-[#646A73] hover:bg-[#F0F1F2] disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>

      {/* Export config panel */}
      {showExportConfig && (
        <div className="p-3 border-b border-[#DEE0E3] bg-[#F8F9FA] flex items-center gap-3">
          <label className="text-sm text-[#646A73] whitespace-nowrap">导出目录：</label>
          <input
            type="text"
            value={exportDir}
            onChange={(e) => setExportDir(e.target.value)}
            className="flex-1 px-3 py-1.5 border border-[#DEE0E3] rounded-lg text-sm focus:outline-none focus:border-[#3370FF]"
            placeholder="G:\knowledge\source\browser-export"
          />
          <button
            onClick={handleExport}
            disabled={exporting || !exportDir.trim()}
            className="flex items-center gap-1 px-4 py-1.5 bg-[#34C759] text-white text-sm rounded-lg hover:bg-[#2DB14D] disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            开始导出
          </button>
          <button
            onClick={() => setShowExportConfig(false)}
            className="text-sm text-[#8F959E] hover:text-[#646A73]"
          >
            取消
          </button>
        </div>
      )}

      {/* Export progress */}
      {exportProgress && (
        <div className={`p-3 border-b border-[#DEE0E3] text-sm ${exportProgress.status === 'completed' ? 'bg-[#E8F5E9] text-[#2E7D32]' : exportProgress.status === 'failed' ? 'bg-[#FFEBEE] text-[#C62828]' : 'bg-[#E8F0FF] text-[#3370FF]'}`}>
          {exportProgress.status === 'completed' ? (
            <div className="flex items-center justify-between">
              <span>导出完成：{exportProgress.exported}/{exportProgress.total} 个文件已保存到 {exportProgress.output_dir}</span>
              {exportProgress.failed > 0 && <span className="text-[#FF9800]">（{exportProgress.failed} 个失败）</span>}
              <button onClick={() => setExportProgress(null)} className="text-xs text-[#8F959E] hover:text-[#646A73]">关闭</button>
            </div>
          ) : exportProgress.status === 'failed' ? (
            <div className="flex items-center justify-between">
              <span>导出失败：{exportProgress.errors.join(', ')}</span>
              <button onClick={() => setExportProgress(null)} className="text-xs text-[#8F959E] hover:text-[#646A73]">关闭</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>正在导出...</span>
            </div>
          )}
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: List */}
        <div className="w-80 bg-white border-r border-[#DEE0E3] flex-shrink-0 overflow-auto">
          <TabContentList
            contents={contents}
            loading={loading}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onDelete={handleDelete}
            copiedId={copiedId}
            onCopy={handleCopy}
          />
        </div>

        {/* Right: Detail */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TabContentDetail
            content={selectedContent}
            onBack={() => setSelectedId(null)}
            onCopy={handleCopy}
            onDownload={handleDownload}
            copied={copiedId === selectedId}
          />
        </div>
      </div>
    </div>
  );
}
