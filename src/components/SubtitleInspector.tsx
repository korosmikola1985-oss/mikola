import React, { useState } from 'react';
import { Type, Sparkles, Plus, Trash2, Sliders, Palette, Wand2 } from 'lucide-react';
import { ShortClip, SubtitleAnimation, SubtitleStylePreset } from '../types';

interface SubtitleInspectorProps {
  clip: ShortClip;
  onUpdateClip: (updated: ShortClip) => void;
}

export const SubtitleInspector: React.FC<SubtitleInspectorProps> = ({
  clip,
  onUpdateClip,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'style'>('style');

  const updateSettings = (key: string, value: any) => {
    onUpdateClip({
      ...clip,
      settings: {
        ...clip.settings,
        [key]: value,
      },
    });
  };

  const handleSubChange = (index: number, field: string, val: any) => {
    const updated = [...clip.subtitles];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    onUpdateClip({
      ...clip,
      subtitles: updated,
    });
  };

  const addSubtitleLine = () => {
    const lastSub = clip.subtitles[clip.subtitles.length - 1];
    const newStart = lastSub ? lastSub.end : 0;
    const newEnd = Math.min(clip.duration, newStart + 2.5);

    onUpdateClip({
      ...clip,
      subtitles: [
        ...clip.subtitles,
        {
          start: newStart,
          end: newEnd,
          text: 'Нова фраза субтитрів',
          highlightWords: ['Нова'],
        },
      ],
    });
  };

  const deleteSubtitleLine = (index: number) => {
    const updated = clip.subtitles.filter((_, i) => i !== index);
    onUpdateClip({
      ...clip,
      subtitles: updated,
    });
  };

  const animations: { id: SubtitleAnimation; label: string }[] = [
    { id: 'Karaoke', label: 'Караоке (Тренди 2026)' },
    { id: 'Pop-up', label: 'Pop-up (Підскок)' },
    { id: 'Bounce', label: 'Bounce (Пружність)' },
    { id: 'Zoom', label: 'Zoom (Енергійний зум)' },
    { id: 'Typewriter', label: 'Друкарська машинка' },
    { id: 'Word-by-word', label: 'По одному слову' },
  ];

  const presets: { id: SubtitleStylePreset; label: string; desc: string }[] = [
    { id: 'mrbeast', label: 'MrBeast Bold', desc: 'Жовто-білий шрифт, чорний контур, червоні акценти' },
    { id: 'hormozi', label: 'Alex Hormozi', desc: 'Зелено-жовта підсвітка слів, максимальний контраст' },
    { id: 'cyberpunk', label: 'Cyberpunk Neon', desc: 'Неоновий бірюзовий та рожевий акцент' },
    { id: 'minimal', label: 'Minimal Clean', desc: 'Елегантний білий текст із м’яким бекграундом' },
    { id: 'comic', label: 'Comic Pop', desc: 'Грайливий динамічний стиль для гумору та мемів' },
  ];

  return (
    <div className="bg-[#151922] border border-[#232a39] rounded-xl p-4 shadow-xl">
      {/* Header with tabs */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#232a39]">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-amber-400" />
          <span className="font-extrabold text-sm text-white uppercase tracking-wider">
            Субтитри та Анімації
          </span>
        </div>

        <div className="flex items-center bg-[#10131a] rounded-lg p-0.5 border border-[#232a39]">
          <button
            onClick={() => setActiveTab('style')}
            className={`px-3 py-1 rounded text-xs font-bold transition ${
              activeTab === 'style'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Стиль & Ефекти
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1 rounded text-xs font-bold transition ${
              activeTab === 'text'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Текст ({clip.subtitles.length})
          </button>
        </div>
      </div>

      {/* TAB 1: STYLE & ANIMATIONS */}
      {activeTab === 'style' && (
        <div className="space-y-4">
          {/* Hook text editor */}
          <div>
            <label className="text-xs font-bold text-gray-300 flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Головний текстовий гачок (0-3 сек)</span>
              </span>
              <label className="text-[11px] text-gray-400 flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={clip.settings.showHookBadge}
                  onChange={(e) => updateSettings('showHookBadge', e.target.checked)}
                  className="rounded accent-amber-500"
                />
                <span>Показувати</span>
              </label>
            </label>
            <input
              type="text"
              value={clip.hookText}
              onChange={(e) => onUpdateClip({ ...clip, hookText: e.target.value })}
              className="w-full bg-[#1b212d] border border-[#2e3748] rounded-lg px-3 py-2 text-xs text-white font-bold focus:border-amber-500 outline-none"
              placeholder="Введіть гачок для утримання уваги..."
            />
          </div>

          {/* Subtitle Preset Picker */}
          <div>
            <label className="text-xs font-bold text-gray-300 mb-2 block">
              Стиль субтитрів
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => updateSettings('subtitleStyle', preset.id)}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    clip.settings.subtitleStyle === preset.id
                      ? 'bg-amber-500/15 border-amber-500 text-white'
                      : 'bg-[#1b212d] border-[#2b3548] text-gray-400 hover:border-gray-500 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs text-white">{preset.label}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Animation Effects */}
          <div>
            <label className="text-xs font-bold text-gray-300 mb-2 block">
              Ефект появи слів (Анімація)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {animations.map((anim) => (
                <button
                  key={anim.id}
                  onClick={() => updateSettings('subtitleAnimation', anim.id)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition text-center ${
                    clip.settings.subtitleAnimation === anim.id
                      ? 'bg-amber-500 text-black border-amber-400 font-bold'
                      : 'bg-[#1b212d] text-gray-300 border-[#2b3548] hover:bg-[#262f40] hover:text-white'
                  }`}
                >
                  {anim.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language and Position & Font Size */}
          <div className="pt-2 border-t border-[#232a39] space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-300 mb-1.5 block">
                Мова озвучення та субтитрів кліпу
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'uk', label: '🇺🇦 Українська' },
                  { id: 'en', label: '🇬🇧 English' },
                  { id: 'ru', label: '🌐 Російська' },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => updateSettings('subtitleLanguage', l.id)}
                    className={`py-1 rounded text-xs font-bold border transition ${
                      (clip.settings.subtitleLanguage || 'uk') === l.id
                        ? 'bg-amber-500 text-black border-amber-400 font-extrabold'
                        : 'bg-[#1b212d] text-gray-400 border-[#2b3548] hover:text-white'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 mb-1 block">
                  Розташування субтитрів
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['bottom', 'middle', 'top'] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => updateSettings('subtitlePosition', pos)}
                      className={`py-1 rounded text-xs font-bold border transition ${
                        clip.settings.subtitlePosition === pos
                          ? 'bg-amber-500 text-black border-amber-400'
                          : 'bg-[#1b212d] text-gray-400 border-[#2b3548] hover:text-white'
                      }`}
                    >
                      {pos === 'bottom' ? 'Знизу' : pos === 'middle' ? 'Центр' : 'Зверху'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-300">
                    Розмір шрифту
                  </label>
                  <span className="text-xs text-amber-400 font-mono">
                    {clip.settings.subtitleFontSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min={28}
                  max={58}
                  value={clip.settings.subtitleFontSize}
                  onChange={(e) => updateSettings('subtitleFontSize', Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-[#232a39] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EDIT TEXT & TIMESTAMPS */}
      {activeTab === 'text' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Натисніть на текст для редагування або змініть таймінг
            </span>
            <button
              onClick={addSubtitleLine}
              className="px-2.5 py-1 rounded bg-[#222a3a] hover:bg-[#2e394f] text-amber-400 text-xs font-bold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Додати рядок</span>
            </button>
          </div>

          <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {clip.subtitles.map((sub, idx) => (
              <div
                key={idx}
                className="bg-[#1b212d] border border-[#2b3548] rounded-lg p-2.5 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span className="font-bold text-amber-400">#{idx + 1}</span>
                  <div className="flex items-center gap-1 font-mono">
                    <input
                      type="number"
                      step={0.1}
                      min={0}
                      value={sub.start}
                      onChange={(e) => handleSubChange(idx, 'start', Number(e.target.value))}
                      className="w-14 bg-[#12161f] border border-[#2e3748] rounded px-1 py-0.5 text-center text-white"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      step={0.1}
                      min={sub.start}
                      value={sub.end}
                      onChange={(e) => handleSubChange(idx, 'end', Number(e.target.value))}
                      className="w-14 bg-[#12161f] border border-[#2e3748] rounded px-1 py-0.5 text-center text-white"
                    />
                    <span>с</span>
                  </div>

                  <button
                    onClick={() => deleteSubtitleLine(idx)}
                    className="p-1 text-gray-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  type="text"
                  value={sub.text}
                  onChange={(e) => handleSubChange(idx, 'text', e.target.value)}
                  className="w-full bg-[#12161f] border border-[#2e3748] rounded px-2.5 py-1.5 text-xs text-white font-medium focus:border-amber-500 outline-none"
                />

                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <span>Підсвітка слів:</span>
                  <input
                    type="text"
                    value={(sub.highlightWords || []).join(', ')}
                    onChange={(e) =>
                      handleSubChange(
                        idx,
                        'highlightWords',
                        e.target.value.split(',').map((w) => w.trim()).filter(Boolean)
                      )
                    }
                    placeholder="слова через кому"
                    className="flex-1 bg-transparent border-b border-[#2e3748] text-amber-300 px-1 py-0.5 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
