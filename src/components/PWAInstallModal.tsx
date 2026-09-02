import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  Laptop, 
  Share2, 
  PlusSquare, 
  MoreVertical, 
  CheckCircle2, 
  Sparkles, 
  X, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeDeviceTab, setActiveDeviceTab] = useState<'ios' | 'android' | 'desktop'>(
    isIOS ? 'ios' : isAndroid ? 'android' : 'desktop'
  );
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0E14]/85 backdrop-blur-md animate-fade-in text-right">
      <div 
        id="pwa-install-dialog"
        className="relative w-full max-w-lg rounded-3xl border border-[#30363D] bg-[#161B22] p-6 sm:p-7 shadow-2xl shadow-black/80"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#30363D]">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-lg shadow-indigo-500/10">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>تثبيت التطبيق على جهازك</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PWA
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                استخدم متتبع العادات كتطبيق أصلي سريع يعمل بدون متصفح
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-[#21262D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Switcher Tabs */}
        <div className="flex items-center justify-between gap-1.5 p-1 bg-[#0D1117] rounded-2xl border border-[#30363D] mt-5">
          <button
            onClick={() => setActiveDeviceTab('ios')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeDeviceTab === 'ios'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#21262D]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>آيفون / آيباد (iOS)</span>
          </button>

          <button
            onClick={() => setActiveDeviceTab('android')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeDeviceTab === 'android'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#21262D]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>أندرويد (Android)</span>
          </button>

          <button
            onClick={() => setActiveDeviceTab('desktop')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeDeviceTab === 'desktop'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#21262D]'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>الكمبيوتر (PC / Mac)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-5 space-y-4 text-xs text-slate-300">
          {/* Quick 1-Click Install Button if supported by Browser */}
          {isInstallable && (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">متصفحك يدعم التثبيت المباشر بنقرة واحدة!</div>
                  <div className="text-[11px] text-indigo-200">انقر للتثبيت الفوري كأيقونة على الشاشة الرئيسية</div>
                </div>
              </div>
              <button
                onClick={handleNativeInstall}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 whitespace-nowrap active:scale-95 transition-all"
              >
                تثبيت الآن 📲
              </button>
            </div>
          )}

          {installSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>تم تثبيت التطبيق بنجاح على جهازك!</span>
            </div>
          )}

          {/* Guide for iOS */}
          {activeDeviceTab === 'ios' && (
            <div className="space-y-3 bg-[#0D1117] p-4 rounded-2xl border border-[#30363D]">
              <div className="font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs">1</span>
                <span>خطوات إضافة التطبيق على iPhone أو iPad:</span>
              </div>
              
              <div className="space-y-2.5 pr-2">
                <div className="flex items-start gap-2.5 text-slate-300 leading-relaxed">
                  <div className="p-1.5 rounded-lg bg-[#21262D] text-indigo-400 mt-0.5 shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white">الخطوة الأولى:</span> افتح الرابط في متصفح <strong className="text-indigo-300">Safari</strong>، ثم اضغط على زر <strong className="text-white">المشاركة (Share ⎋)</strong> في أسفل الشاشة.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-slate-300 leading-relaxed">
                  <div className="p-1.5 rounded-lg bg-[#21262D] text-indigo-400 mt-0.5 shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white">الخطوة الثانية:</span> مرر للأسفل واضغط على <strong className="text-white">"إضافة إلى الشاشة الرئيسية" (Add to Home Screen ➕)</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-slate-300 leading-relaxed">
                  <div className="p-1.5 rounded-lg bg-[#21262D] text-emerald-400 mt-0.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white">الخطوة الثالثة:</span> اضغط على <strong className="text-emerald-300">"إضافة" (Add)</strong> في أعلى الزاوية. سيظهر التطبيق كأيقونة على شاشتك الرئيسية فوراً.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guide for Android */}
          {activeDeviceTab === 'android' && (
            <div className="space-y-3 bg-[#0D1117] p-4 rounded-2xl border border-[#30363D]">
              <div className="font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs">2</span>
                <span>خطوات إضافة التطبيق على أجهزة Android (Chrome / Samsung):</span>
              </div>
              
              <div className="space-y-2.5 pr-2">
                <div className="flex items-start gap-2.5 text-slate-300 leading-relaxed">
                  <div className="p-1.5 rounded-lg bg-[#21262D] text-indigo-400 mt-0.5 shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white">الخطوة الأولى:</span> اضغط على قائمة <strong className="text-white">الخيارات (الثلاث نقاط ⋮)</strong> في أعلى يمين أو أسفل المتصفح.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-slate-300 leading-relaxed">
                  <div className="p-1.5 rounded-lg bg-[#21262D] text-indigo-400 mt-0.5 shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white">الخطوة الثانية:</span> اختر <strong className="text-white">"تثبيت التطبيق" (Install app)</strong> أو <strong className="text-white">"الإضافة إلى الشاشة الرئيسية"</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-slate-300 leading-relaxed">
                  <div className="p-1.5 rounded-lg bg-[#21262D] text-emerald-400 mt-0.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white">الخطوة الثالثة:</span> أكّد التثبيت، وستتم إضافة التطبيق إلى قائمة تطبيقات هاتفك فوراً ويعمل في وضع ملء الشاشة.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guide for Desktop */}
          {activeDeviceTab === 'desktop' && (
            <div className="space-y-3 bg-[#0D1117] p-4 rounded-2xl border border-[#30363D]">
              <div className="font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs">3</span>
                <span>خطوات التثبيت على الكمبيوتر (Windows / Mac / Linux):</span>
              </div>
              
              <div className="space-y-2.5 pr-2">
                <div className="flex items-start gap-2.5 text-slate-300 leading-relaxed">
                  <div className="p-1.5 rounded-lg bg-[#21262D] text-indigo-400 mt-0.5 shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white">متصفح Chrome / Edge:</span> ستجد أيقونة <strong className="text-indigo-300">تثبيت ⨁</strong> داخل شريط العناوين في الأعلى، اضغط عليها ثم اضغط "تثبيت".
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-slate-300 leading-relaxed">
                  <div className="p-1.5 rounded-lg bg-[#21262D] text-indigo-400 mt-0.5 shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white">أو من القائمة:</span> افتح قائمة المتصفح (⋮) واختر <strong className="text-white">"حفظ ومشاركة" &gt; "تثبيت متتبع العادات اليومية"</strong>.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advantages of PWA */}
          <div className="p-3.5 rounded-2xl bg-[#0D1117] border border-[#30363D] flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-[11px] text-slate-400">
              <span className="text-slate-200 font-bold">مزايا التثبيت:</span> سرعة تشغيل فائقة، حفظ البيانات محلياً، العمل بدون شريط المتصفح، وسهولة الوصول اليومي من سطح المكتب أو الشاشة الرئيسية.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 border-t border-[#30363D]">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#21262D] hover:bg-[#30363D] text-slate-300 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
