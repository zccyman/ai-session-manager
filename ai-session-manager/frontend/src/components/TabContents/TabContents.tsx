import { useState, useCallback, useEffect } from 'react';
import { SearchBar } from '../Search/SearchBar';
import { TabContentList } from './TabContentList';
import { TabContentDetail } from './TabContentDetail';
import { api } from '../../services/api';
import type { TabContent } from '../../types';
import { Globe, Plus } from 'lucide-react';

export function TabContents() {
  const [contents, setContents] = useState<TabContent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<TabContent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      </div>

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
