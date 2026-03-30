import { Download, Loader2 } from 'lucide-react';

interface ExportButtonProps {
  onExport: () => void;
  loading?: boolean;
  label?: string;
}

export function ExportButton({ onExport, loading, label = 'Export Markdown' }: ExportButtonProps) {
  return (
    <button
      onClick={onExport}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg transition-colors"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {label}
    </button>
  );
}