import React, { useState } from 'react';
import { X, Copy, Check, FileText, Sparkles, Hash, Tag, Lightbulb, Download } from 'lucide-react';
import { ShortClip } from '../types';
import { VideoRenderer } from '../utils/videoRenderer';

interface YouTubeMetadataModalProps {
  clip: ShortClip | null;
  onClose: () => void;
}

export const YouTubeMetadataModal: React.FC<YouTubeMetadataModalProps> = ({
  clip,
  onClose,
}) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  if (!clip) return null;

  const pack = clip.youtubePack;

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(identifier);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const copyAll = () => {
    const fullText = `📌 НАЗВА:
${pack.titleOptions[0]}

📝 ОПИС:
${pack.description}

🏷️ ХЕШТЕГИ:
${pack.hashtags.join(' ')}

🔑 КЛЮЧОВІ СЛОВА:
${pack.keywords.join(', ')}

🖼️ ТЕКСТ НА ОБКЛАДИНКУ:
${pack.coverText}

💡 РЕКОМЕНДАЦІЯ ДЛЯ 1-Ї СЕКУНДИ:
${pack.firstSecondTip}`;

    copyToClipboard(fullText, 'all');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#151922] border border-[#2b3548] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#232a39] flex items-center justify-between sticky top-0 bg-[#151922] z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                YouTube Shorts & Reels Content Pack
              </h3>
              <p className="text-[11px] text-gray-400">
                Згенеровані вірусні заголовки, опис, хештеги та рекомендації українською
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

        {/* Modal Body */}
        <div className="p-5 space-y-5 flex-1">
          {/* 1. 3 Title Options */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>3 Варіанти заголовка (Клікабельні з високим CTR)</span>
              </label>
            </div>

            <div className="space-y-2">
              {pack.titleOptions.map((title, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#1a202c] border border-[#2a3344] hover:border-amber-500/50 transition group"
                >
                  <span className="text-xs font-bold text-white flex-1 mr-2">
                    {title}
                  </span>
                  <button
                    onClick={() => copyToClipboard(title, `title-${idx}`)}
                    className="p-1.5 rounded bg-[#242c3d] hover:bg-amber-500 hover:text-black text-gray-300 text-xs transition flex items-center gap-1"
                  >
                    {copiedItem === `title-${idx}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px]">Скопійовано</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Копіювати</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                Опис відео
              </label>
              <button
                onClick={() => copyToClipboard(pack.description, 'desc')}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                {copiedItem === 'desc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Копіювати опис</span>
              </button>
            </div>
            <div className="p-3 rounded-xl bg-[#1a202c] border border-[#2a3344] text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
              {pack.description}
            </div>
          </div>

          {/* 3. Hashtags & Keywords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1">
                  <Hash className="w-3 h-3 text-blue-400" />
                  <span>Хештеги ({pack.hashtags.length})</span>
                </label>
                <button
                  onClick={() => copyToClipboard(pack.hashtags.join(' '), 'hashtags')}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  {copiedItem === 'hashtags' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Всі</span>
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-[#1a202c] border border-[#2a3344] flex flex-wrap gap-1">
                {pack.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/25 text-[11px] font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3 h-3 text-purple-400" />
                  <span>Ключові слова (Tags)</span>
                </label>
                <button
                  onClick={() => copyToClipboard(pack.keywords.join(', '), 'keywords')}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  {copiedItem === 'keywords' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Всі</span>
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-[#1a202c] border border-[#2a3344] flex flex-wrap gap-1">
                {pack.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/25 text-[11px]"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Cover text & First second tip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#232a39]">
            <div className="p-3 rounded-xl bg-[#11151e] border border-[#262f40]">
              <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                🖼️ Текст для обкладинки
              </span>
              <p className="text-xs font-extrabold text-amber-400 font-['Montserrat']">
                «{pack.coverText}»
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#11151e] border border-[#262f40]">
              <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1 mb-1">
                <Lightbulb className="w-3 h-3" />
                Утримання на 1-й секунді
              </span>
              <p className="text-xs text-gray-300 leading-snug">
                {pack.firstSecondTip}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#232a39] bg-[#12151c] flex items-center justify-between">
          <button
            onClick={() => VideoRenderer.downloadMetadataFile(clip)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#212736] hover:bg-[#2c3447] text-gray-300 hover:text-white text-xs font-bold transition"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Завантажити у файл (.txt)</span>
          </button>

          <button
            onClick={copyAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-black font-extrabold text-xs shadow-md transition"
          >
            {copiedItem === 'all' ? (
              <>
                <Check className="w-4 h-4 text-black" />
                <span>Все скопійовано!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-black" />
                <span>Копіювати ВСЕ одним кліком</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
