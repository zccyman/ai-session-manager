import { Download } from 'lucide-react';

interface ExportButtonProps {
  onExport: () => void;
  label?: string;
  disabled?: boolean;
  count?: number;
}

export function ExportButton({ onExport, label = 'Export', disabled, count }: ExportButtonProps) {
  return (
    <button
      onClick={onExport}
      disabled={disabled}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3370FF] text-white text-sm rounded-lg hover:bg-[#2860E1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      <Download className="w-3.5 h-3.5" />
      {count ? `${label} (${count})` : label}
    </button>
  );
}
