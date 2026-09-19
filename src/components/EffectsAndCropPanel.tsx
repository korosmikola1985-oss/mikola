import React from 'react';
import { Crop, Volume2, Sparkles, Sliders, Music, Zap, Eye, ShieldAlert } from 'lucide-react';
import { ShortClip, SmartCropMode, ColorFilterPreset } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface EffectsAndCropPanelProps {
  clip: ShortClip;
  onUpdateClip: (updated: ShortClip) => void;
}

export const EffectsAndCropPanel: React.FC<EffectsAndCropPanelProps> = ({
  clip,
  onUpdateClip,
}) => {
  const updateSettings = (key: string, value: any) => {
    onUpdateClip({
      ...clip,
      settings: {
        ...clip.settings,
        [key]: value,
      },
      ...(key === 'smartCropMode' ? { smartCropMode: value } : {}),
    });
  };

  const cropModes: { id: SmartCropMode; label: string; desc: string; icon: string }[] = [
    {
      id: 'blurred-background',
      label: 'Розмитий фон (9:16)',
      desc: 'Оригінальне 16:9 відео в центрі з розмитим динамічним дзеркалом ззаду (без обрізки)',
      icon: '🔲',
    },
    {
      id: 'face-tracking',
      label: 'Фокус на обличчі',
      desc: 'Автоматичне центрування на спікері або головному персонажі',
      icon: '👤',
    },
    {
      id: 'split-screen',
      label: 'Gaming Dual Split',
      desc: 'Веб-камера зверху + повний геймплей з інтерфейсом та HUD знизу',
      icon: '🎮',
    },
    {
      id: 'center-action',
      label: 'Центр дії',
      desc: 'Кадрування по центру кадру для динамічного спорту та кульмінацій',
      icon: '🎯',
    },
  ];

  const colorFilters: { id: ColorFilterPreset; label: string; desc: string }[] = [
    { id: 'none', label: 'Оригінал', desc: 'Природні кольори без обробки' },
    { id: 'vibrant', label: 'Vibrant Pop', desc: 'Теплий соковитий контраст YouTube' },
    { id: 'cinematic', label: 'Кінематограф', desc: 'Глибокі тіні та віньєтка' },
    { id: 'cyber', label: 'Cyber Неон', desc: 'Посилення бірюзових та неонових тонів' },
    { id: 'punch', label: 'Action Punch', desc: 'Максимальна чіткість та різкість деталей' },
  ];

  const musicTracks = [
    { id: 'none', label: 'Без музики' },
    { id: 'lofi', label: 'Lo-Fi Chill (Подкасти & Влоги)' },
    { id: 'epic', label: 'Epic Motivation (Мотивація & Драйв)' },
    { id: 'phonk', label: 'Phonk Bass (Тренди & Екшен)' },
  ];

  const testSfx = (type: 'whoosh' | 'ding' | 'boom' | 'pop') => {
    audioEngine.playSfx(type, clip.settings.sfxVolume);
  };

  return (
    <div className="bg-[#151922] border border-[#232a39] rounded-xl p-4 shadow-xl space-y-5">
      {/* 1. Smart Cropping Modes */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Crop className="w-4 h-4 text-amber-400" />
          <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">
            Формат 9:16 та Розумне Кадрування
          </h4>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Автоматичне перетворення горизонтальних відео (16:9) у вертикальні YouTube Shorts / TikTok (9:16).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {cropModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => updateSettings('smartCropMode', mode.id)}
              className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                (clip.settings.smartCropMode || clip.smartCropMode) === mode.id
                  ? 'bg-amber-500/15 border-amber-500 text-white'
                  : 'bg-[#1b212d] border-[#2b3548] text-gray-400 hover:border-gray-500 hover:text-white'
              }`}
            >
              <span className="text-lg">{mode.icon}</span>
              <div>
                <div className="font-bold text-xs text-white">{mode.label}</div>
                <div className="text-[11px] text-gray-400 leading-snug mt-0.5">{mode.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Color Grading & Lighting */}
      <div className="pt-3 border-t border-[#232a39]">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">
            Кольорокорекція та Фільтри
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {colorFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => updateSettings('colorFilter', f.id)}
              className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition text-center ${
                clip.settings.colorFilter === f.id
                  ? 'bg-amber-500 text-black border-amber-400 font-bold'
                  : 'bg-[#1b212d] text-gray-300 border-[#2b3548] hover:bg-[#262f40] hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Audio & Auto-Ducking */}
      <div className="pt-3 border-t border-[#232a39]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-amber-400" />
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">
              Фонова Музика та Авто-Дакінг
            </h4>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Auto-Ducking активний
          </span>
        </div>
        <p className="text-[11px] text-gray-400 mb-2">
          Гучність музики автоматично знижується на 70%, коли звучить людський голос.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3">
          {musicTracks.map((tr) => (
            <button
              key={tr.id}
              onClick={() => updateSettings('musicTrack', tr.id)}
              className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition text-center truncate ${
                clip.settings.musicTrack === tr.id
                  ? 'bg-amber-500 text-black border-amber-400 font-bold'
                  : 'bg-[#1b212d] text-gray-300 border-[#2b3548] hover:bg-[#262f40] hover:text-white'
              }`}
              title={tr.label}
            >
              {tr.label.split(' ')[0]} {tr.label.split(' ')[1]}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Гучність музики</span>
              <span className="font-mono text-amber-400">
                {Math.round(clip.settings.musicVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={clip.settings.musicVolume}
              onChange={(e) => updateSettings('musicVolume', Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-[#232a39] rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. Sound Accents (SFX) & Silence Removal */}
      <div className="pt-3 border-t border-[#232a39] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-gray-300 flex items-center gap-1 mb-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Звукові акценти (Тест SFX):</span>
          </div>
          <div className="flex items-center gap-1.5">
            {(['whoosh', 'ding', 'boom', 'pop'] as const).map((s) => (
              <button
                key={s}
                onClick={() => testSfx(s)}
                className="px-2 py-1 rounded bg-[#212736] hover:bg-amber-500 hover:text-black text-gray-300 text-[11px] font-bold transition uppercase"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Dynamic Punch-in Zoom Toggle */}
          <label className="flex items-center gap-2 p-2 rounded-lg bg-[#1b212d] border border-[#2e3748] cursor-pointer">
            <input
              type="checkbox"
              checked={clip.settings.dynamicZoom !== false}
              onChange={(e) => updateSettings('dynamicZoom', e.target.checked)}
              className="rounded accent-amber-500"
            />
            <div>
              <div className="text-xs font-bold text-white">Динамічний Zoom (Punch-in)</div>
              <div className="text-[10px] text-gray-400">Наближення на перших 2.2 сек для утримання уваги</div>
            </div>
          </label>

          {/* Silence Cut Toggle */}
          <label className="flex items-center gap-2 p-2 rounded-lg bg-[#1b212d] border border-[#2e3748] cursor-pointer">
            <input
              type="checkbox"
              checked={clip.settings.removeSilences}
              onChange={(e) => updateSettings('removeSilences', e.target.checked)}
              className="rounded accent-amber-500"
            />
            <div>
              <div className="text-xs font-bold text-white">Вирізати довгі паузи</div>
              <div className="text-[10px] text-gray-400">Jump-cuts для пауз &gt; 0.4 сек</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
