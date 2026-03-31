import { Copy, Check, Download, ArrowLeft, ExternalLink } from 'lucide-react';
import type { TabContent } from '../../types';

interface TabContentDetailProps {
  content: TabContent | null;
  onBack: () => void;
  onCopy: (content: TabContent) => void;
  onDownload: (content: TabContent) => void;
  copied: boolean;
}

export function TabContentDetail({
  content,
  onBack,
  onCopy,
  onDownload,
  copied,
}: TabContentDetailProps) {
  if (!content) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[#8F959E]">
        <p className="text-sm">选择一个标签页内容查看详情</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#DEE0E3] bg-white flex-shrink-0">
        <button
          onClick={onBack}
          className="text-xs text-[#3370FF] hover:underline flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3 h-3" /> 返回列表
        </button>
        <h2 className="text-base font-semibold text-[#1F2329] truncate">
          {content.title || '无标题'}
        </h2>
        {content.url && (
          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#8F959E] hover:text-[#3370FF] flex items-center gap-1 mt-1"
          >
            <ExternalLink className="w-3 h-3" />
            {content.url}
          </a>
        )}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs px-2 py-0.5 rounded bg-[#E8F0FF] text-[#3370FF]">
            {content.source}
          </span>
          <span className="text-xs text-[#8F959E]">
            {content.message_count || 0} 条消息 · {content.char_count || 0} 字符
          </span>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onCopy(content)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#DEE0E3] text-sm rounded-lg text-[#646A73] hover:bg-[#F0F1F2]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            复制
          </button>
          <button
            onClick={() => onDownload(content)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#DEE0E3] text-sm rounded-lg text-[#646A73] hover:bg-[#F0F1F2]"
          >
            <Download className="w-3.5 h-3.5" />
            下载
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 bg-white">
        <pre className="whitespace-pre-wrap font-mono text-sm text-[#1F2329] leading-relaxed">
          {content.markdown}
        </pre>
      </div>
    </div>
  );
}
