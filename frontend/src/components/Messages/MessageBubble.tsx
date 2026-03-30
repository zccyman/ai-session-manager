import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import { format } from 'date-fns';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);

interface MessageData {
  role: 'user' | 'assistant' | 'system';
  content: string;
  parts?: Array<{ type: string; content: string; language?: string }>;
}

interface MessageBubbleProps {
  data: MessageData;
  createdAt: string;
}

function highlightCode(code: string, language?: string): string {
  if (language && hljs.getLanguage(language)) {
    return hljs.highlight(code, { language }).value;
  }
  return hljs.highlightAuto(code).value;
}

function parseContent(content: string): Array<{ type: string; content: string; language?: string }> {
  const parts: Array<{ type: string; content: string; language?: string }> = [];
  
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'code', content: match[2], language: match[1] || 'text' });
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }
  
  if (parts.length === 0) {
    parts.push({ type: 'text', content });
  }
  
  return parts;
}

export function MessageBubble({ data, createdAt }: MessageBubbleProps) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  
  const roleColors = {
    user: 'bg-indigo-500/20 border-indigo-500/30',
    assistant: 'bg-slate-800 border-slate-700',
    system: 'bg-slate-800/50 border-slate-700/50',
  };
  
  const roleLabels = {
    user: 'You',
    assistant: 'Assistant',
    system: 'System',
  };
  
  const date = new Date(createdAt);
  const parts = data.parts || parseContent(data.content);
  
  const copyContent = () => {
    navigator.clipboard.writeText(data.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const isLongContent = data.content.length > 500;
  const displayContent = expanded ? data.content : data.content.slice(0, 500) + (data.content.length > 500 ? '...' : '');
  
  return (
    <div className={`rounded-lg border ${roleColors[data.role as keyof typeof roleColors] || roleColors.assistant}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
            data.role === 'user' ? 'bg-indigo-500/30 text-indigo-300' : 
            data.role === 'system' ? 'bg-slate-600/50 text-slate-400' : 'bg-violet-500/30 text-violet-300'
          }`}>
            {roleLabels[data.role as keyof typeof roleLabels] || 'Assistant'}
          </span>
          <span className="text-xs text-slate-500">{format(date, 'HH:mm')}</span>
        </div>
        <div className="flex items-center gap-1">
          {isLongContent && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={copyContent}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      <div className="p-4 text-sm text-slate-200 whitespace-pre-wrap">
        {parts.map((part, i) => (
          <div key={i} className={part.type === 'code' ? 'my-3' : ''}>
            {part.type === 'code' ? (
              <pre className="bg-slate-900 rounded-lg p-3 overflow-x-auto text-xs">
                <code 
                  className={`language-${part.language}`}
                  dangerouslySetInnerHTML={{ __html: highlightCode(part.content, part.language) }}
                />
              </pre>
            ) : (
              <span>{expanded ? part.content : part.content.slice(0, 500) + (part.content.length > 500 ? '...' : '')}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}