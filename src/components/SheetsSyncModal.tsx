import React, { useState } from 'react';
import { GoogleSheetsService } from '../services/googleSheets';
import { MonthData } from '../types';
import { 
  FileSpreadsheet, 
  ExternalLink, 
  RefreshCw, 
  Check, 
  Sparkles, 
  AlertCircle,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface SheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthData: MonthData;
  onSheetCreated: (spreadsheetId: string, spreadsheetUrl: string) => void;
}

export const SheetsSyncModal: React.FC<SheetsSyncModalProps> = ({
  isOpen,
  onClose,
  monthData,
  onSheetCreated,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  if (!isOpen) return null;

  const handleCreateSheet = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setStatusMessage('جاري الاتصال بـ Google Sheets وإنشاء وتنسيق الجدول الاحترافي...');

    try {
      const result = await GoogleSheetsService.createHabitTrackerSheet(
        monthData,
        manualToken.trim() || undefined
      );
      setStatusMessage('تم إنشاء الجدول وتنسيق الصناديق والصيغ الرياضية بنجاح!');
      onSheetCreated(result.spreadsheetId, result.spreadsheetUrl);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'حدث خطأ أثناء الاتصال بـ Google Sheets');
      setShowManualInput(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncExisting = async () => {
    if (!monthData.connectedSheetId) return;
    setIsLoading(true);
    setErrorMessage('');
    setStatusMessage('جاري مزامنة التحديثات وصناديق الاختيار مع Google Sheets...');

    try {
      await GoogleSheetsService.syncDataToSheet(
        monthData.connectedSheetId,
        monthData,
        manualToken.trim() || undefined
      );
      setStatusMessage('تمت المزامنة بنجاح!');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'فشلت المزامنة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0E14]/80 backdrop-blur-md">
      <div 
        id="google-sheets-sync-dialog"
        className="relative w-full max-w-lg rounded-3xl border border-[#30363D] bg-[#161B22] p-6 sm:p-7 shadow-2xl text-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#30363D]">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">تصدير ومزامنة Google Sheets</h3>
              <p className="text-xs text-slate-400">جدول سحابي ذكي متطابق مع الصيغ والتنسيقات</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-[#21262D] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="py-5 space-y-4">
          <div className="p-4 rounded-2xl bg-[#0D1117] border border-[#30363D] space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-bold text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>ميزات جدول Google Sheets المُنشأ:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
              <li>مربعات اختيار تفاعلية (Checkboxes) لكل يوم.</li>
              <li>صيغ تلقائية لحساب نسب الإنجاز الفردية والإجمالية (COUNTIF, AVERAGE, SUM).</li>
              <li>ثيم داكن احترافي كحلي ورصاصي أنيق متناسق بالكامل.</li>
              <li>بطاقات KPI علوية وملخصات للأداء.</li>
            </ul>
          </div>

          {monthData.connectedSheetUrl ? (
            <div className="p-4 rounded-2xl bg-[#0D1117] border border-[#238636] text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  الجدول مرتبط وجاهز
                </span>
                <a
                  href={monthData.connectedSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-300 hover:underline font-semibold"
                >
                  <span>فتح في Google Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : null}

          {statusMessage && (
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {showManualInput && (
            <div className="space-y-2 pt-2">
              <label className="text-xs text-slate-400">
                (اختياري) رمز الوصول Google Access Token:
              </label>
              <input
                type="text"
                placeholder="ألصق الرمز إذا تم طلبه..."
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#0D1117] border border-[#30363D] text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#30363D]">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#21262D] hover:bg-[#30363D] text-slate-300 transition-colors"
          >
            إغلاق
          </button>

          {monthData.connectedSheetId ? (
            <button
              onClick={handleSyncExisting}
              disabled={isLoading}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>مزامنة التغييرات الآن</span>
            </button>
          ) : (
            <button
              id="btn-create-google-sheet-final"
              onClick={handleCreateSheet}
              disabled={isLoading}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>إنشاء جدول Google Sheets الآن</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
