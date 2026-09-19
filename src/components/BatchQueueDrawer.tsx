import React, { useRef } from 'react';
import { X, Layers, Plus, Play, Pause, CheckCircle2, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { BatchQueueItem, ShortClip } from '../types';

interface BatchQueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  queue: BatchQueueItem[];
  onAddFiles: (files: FileList) => void;
  onRemoveItem: (id: string) => void;
  onProcessBatch: () => void;
  isProcessing: boolean;
}

export const BatchQueueDrawer: React.FC<BatchQueueDrawerProps> = ({
  isOpen,
  onClose,
  queue,
  onAddFiles,
  onRemoveItem,
  onProcessBatch,
  isProcessing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end">
      <div className="bg-[#151922] border-l border-[#2b3548] w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#232a39] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-extrabold text-white text-base">
                Черга пакетної обробки
              </h3>
              <p className="text-[11px] text-gray-400">
                Завантаження декількох довгих відео та автоматичний рендер
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#222a3a] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload more into batch */}
        <div className="p-4 border-b border-[#232a39] bg-[#11141c]">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="video/mp4,video/quicktime,video/x-matroska,video/webm"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) onAddFiles(e.target.files);
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 rounded-xl border border-dashed border-[#344057] hover:border-blue-400 bg-[#171c26] text-xs font-bold text-gray-300 hover:text-white flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>Додати ще відео у чергу</span>
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {queue.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs">
              <Layers className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              Черга порожня. Додайте кілька відео для пакетної нарізки.
            </div>
          ) : (
            queue.map((item, idx) => (
              <div
                key={item.id}
                className="bg-[#1b212d] border border-[#2b3548] rounded-xl p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-[#252e40] text-gray-300 font-bold text-[11px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white line-clamp-1">
                      {item.fileName}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-gray-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span
                    className={`font-semibold ${
                      item.status === 'completed'
                        ? 'text-emerald-400'
                        : item.status === 'exporting' || item.status === 'analyzing'
                        ? 'text-amber-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {item.status === 'pending' && 'Очікує в черзі'}
                    {item.status === 'analyzing' && 'AI Аналіз відео...'}
                    {item.status === 'exporting' && 'Рендеринг Shorts...'}
                    {item.status === 'completed' && `Готово (${item.clips.length} Shorts)`}
                  </span>
                  <span className="font-mono text-gray-400">{item.progress}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#11141b] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-200"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {queue.length > 0 && (
          <div className="p-4 border-t border-[#232a39] bg-[#11141c]">
            <button
              onClick={onProcessBatch}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-extrabold text-xs tracking-wide shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Обробка черги...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Запустити пакетний експорт ({queue.length})</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
