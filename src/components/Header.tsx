import React from 'react';
import { Sparkles, Sliders, Layers, Monitor, Download, HardDrive } from 'lucide-react';

interface HeaderProps {
  mode: 'auto' | 'manual';
  setMode: (mode: 'auto' | 'manual') => void;
  batchCount: number;
  openBatchDrawer: () => void;
  openDesktopModal: () => void;
  onExportAll: () => void;
  clipsCount: number;
  isExportingAll?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  setMode,
  batchCount,
  openBatchDrawer,
  openDesktopModal,
  onExportAll,
  clipsCount,
  isExportingAll = false,
}) => {
  return (
    <header className="h-14 bg-[#12151c] border-b border-[#232936] px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-red-500 to-purple-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-white font-['Space_Grotesk'] text-base">
              AI SHORTS STUDIO
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-amber-500 text-black">
              PRO v2.5
            </span>
          </div>
          <p className="text-[11px] text-gray-400 -mt-0.5 hidden sm:block">
            Автоматичний AI-відеоредактор (YouTube Shorts, TikTok, Reels)
          </p>
        </div>
      </div>

      {/* Center: Mode Switch (Auto vs Manual) */}
      <div className="bg-[#1a1f2c] p-1 rounded-lg border border-[#2b3344] flex items-center gap-1">
        <button
          onClick={() => setMode('auto')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
            mode === 'auto'
              ? 'bg-amber-500 text-black shadow-sm'
              : 'text-gray-300 hover:text-white hover:bg-[#252c3d]'
          }`}
          title="Режим АВТО: 1 клік — аналіз, нарізка та монтаж"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>АВТО (1 Клік)</span>
        </button>

        <button
          onClick={() => setMode('manual')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
            mode === 'manual'
              ? 'bg-amber-500 text-black shadow-sm'
              : 'text-gray-300 hover:text-white hover:bg-[#252c3d]'
          }`}
          title="Режим РУЧНИЙ: Таймлайн, редагування субтитрів та ефектів"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>РУЧНИЙ ЕДІТОР</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Desktop & FFmpeg Guide */}
        <button
          onClick={openDesktopModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#1a1f2c] hover:bg-[#242c3d] text-gray-300 hover:text-amber-400 border border-[#2e3748] text-xs font-medium transition"
          title="Локальний запуск на Windows 10 через Electron / FFmpeg"
        >
          <HardDrive className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Windows 10 / FFmpeg</span>
        </button>

        {/* Batch Queue Drawer */}
        <button
          onClick={openBatchDrawer}
          className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#1a1f2c] hover:bg-[#242c3d] text-gray-300 hover:text-white border border-[#2e3748] text-xs font-medium transition"
          title="Черга пакетної обробки"
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Пакетна черга</span>
          {batchCount > 0 && (
            <span className="px-1.5 py-0.2 bg-blue-500 text-white rounded-full text-[10px] font-bold">
              {batchCount}
            </span>
          )}
        </button>

        {/* Export All Shorts CTA */}
        {clipsCount > 0 && (
          <button
            onClick={onExportAll}
            disabled={isExportingAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-black font-bold text-xs shadow-md transition disabled:opacity-50"
            title="Завантажити всі готові Shorts окремими файлами"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>{isExportingAll ? 'Рендеринг...' : `Експорт всіх (${clipsCount})`}</span>
          </button>
        )}
      </div>
    </header>
  );
};
