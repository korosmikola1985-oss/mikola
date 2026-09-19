import React from 'react';
import { Play, Sliders, Download, FileText, Sparkles, Check, Clock, Flame } from 'lucide-react';
import { ShortClip } from '../types';

interface ClipsListProps {
  clips: ShortClip[];
  activeClip: ShortClip | null;
  onSelectClip: (clip: ShortClip) => void;
  onEditClip: (clip: ShortClip) => void;
  onOpenYouTubePack: (clip: ShortClip) => void;
  onExportClip: (clip: ShortClip) => void;
  onDownloadMetadata: (clip: ShortClip) => void;
  isRenderingClipId?: string | null;
}

export const ClipsList: React.FC<ClipsListProps> = ({
  clips,
  activeClip,
  onSelectClip,
  onEditClip,
  onOpenYouTubePack,
  onExportClip,
  onDownloadMetadata,
  isRenderingClipId,
}) => {
  if (clips.length === 0) {
    return (
      <div className="bg-[#151922] border border-[#232a39] rounded-xl p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#1d2331] flex items-center justify-center mx-auto mb-3 text-gray-500">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-white text-base">Шортси ще не створені</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
          Завантажте відео вище та натисніть «СТВОРИТИ SHORTS АВТОМАТИЧНО».
          AI знайде найцікавіші фрагменти, змонтує їх у 9:16 та згенерує субтитри.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#151922] border border-[#232a39] rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#232a39]">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm text-white uppercase tracking-wider">
            Знайдені вірусні моменти ({clips.length})
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Готові до експорту
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
        {clips.map((clip, index) => {
          const isSelected = activeClip?.id === clip.id;
          const isRenderingThis = isRenderingClipId === clip.id;

          return (
            <div
              key={clip.id}
              className={`rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#1c2230] border-amber-500 shadow-md shadow-amber-500/10'
                  : 'bg-[#161b26] border-[#252d3d] hover:border-[#38435b] hover:bg-[#1a2130]'
              }`}
            >
              <div>
                {/* Header: Badge & Viral Score */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-black text-[11px] flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-gray-300">
                      {clip.emotionalTone}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-orange-500/30 text-orange-400 text-[11px] font-extrabold">
                    <Flame className="w-3.5 h-3.5 fill-orange-400" />
                    <span>{clip.viralScore}/100</span>
                  </div>
                </div>

                {/* Title */}
                <h4 className="font-bold text-white text-sm line-clamp-1">
                  {clip.title}
                </h4>

                {/* Hook preview */}
                <div className="mt-1.5 p-2 rounded bg-[#0f1218] border border-[#212735] text-[11px] text-amber-300 font-medium">
                  <span className="text-gray-400 font-bold mr-1">Гачок:</span>
                  «{clip.hookText}»
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{Math.round(clip.duration)} сек</span>
                  </span>
                  <span>Таймінг: {clip.startTime}s - {clip.endTime}s</span>
                  <span>Субтитрів: {clip.subtitles.length}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-3 pt-2.5 border-t border-[#232a39] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSelectClip(clip)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${
                      isSelected
                        ? 'bg-amber-500 text-black'
                        : 'bg-[#212736] text-gray-300 hover:bg-[#2c3447] hover:text-white'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isSelected ? 'Обрано' : 'Перегляд'}</span>
                  </button>

                  <button
                    onClick={() => onEditClip(clip)}
                    className="px-2 py-1 rounded bg-[#212736] hover:bg-[#2c3447] text-gray-300 hover:text-white text-xs font-medium transition flex items-center gap-1"
                    title="Відкрити в детальному ручному редакторі"
                  >
                    <Sliders className="w-3 h-3 text-amber-400" />
                    <span>Редагувати</span>
                  </button>

                  <button
                    onClick={() => onOpenYouTubePack(clip)}
                    className="px-2 py-1 rounded bg-[#212736] hover:bg-[#2c3447] text-gray-300 hover:text-white text-xs font-medium transition flex items-center gap-1"
                    title="Переглянути згенеровані заголовки, опис та хештеги для YouTube Shorts"
                  >
                    <FileText className="w-3 h-3 text-red-400" />
                    <span>YouTube Пакет</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDownloadMetadata(clip)}
                    className="p-1.5 rounded hover:bg-[#252d3d] text-gray-400 hover:text-amber-400 transition"
                    title="Завантажити метадані (.txt)"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onExportClip(clip)}
                    disabled={isRenderingThis}
                    className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition flex items-center gap-1 shadow-sm disabled:opacity-50"
                  >
                    <Download className="w-3 h-3" />
                    <span>{isRenderingThis ? 'Експорт...' : 'MP4'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
