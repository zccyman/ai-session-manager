import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = '搜索会话标题、项目名...' }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F959E]" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-8 py-2 bg-white border border-[#DEE0E3] rounded-lg text-sm text-[#1F2329] placeholder-[#8F959E] focus:outline-none focus:border-[#3370FF] focus:ring-2 focus:ring-[#3370FF]/10 transition-all"
      />
      {value && (
        <button onClick={() => { onChange(''); inputRef.current?.focus(); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#8F959E] hover:text-[#646A73]">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
