import React, { useRef } from 'react';
import { UploadCloud, Film, Play, Sparkles, Clock, CheckCircle2, FileVideo, Globe } from 'lucide-react';
import { VideoSource, EditingStyle, SubtitleLanguage } from '../types';
import { EDITING_STYLES, SAMPLE_VIDEOS } from '../data/presets';

interface VideoUploaderProps {
  currentVideo: VideoSource | null;
  onSelectVideo: (source: VideoSource) => void;
  targetDuration: number;
  setTargetDuration: (dur: number) => void;
  selectedStyle: EditingStyle;
  setSelectedStyle: (style: EditingStyle) => void;
  selectedLanguage: SubtitleLanguage;
  setSelectedLanguage: (lang: SubtitleLanguage) => void;
  desiredClipCount: number;
  setDesiredClipCount: (count: number) => void;
  onAnalyzeAndGenerate: () => void;
  isAnalyzing: boolean;
  analysisProgressText: string;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  currentVideo,
  onSelectVideo,
  targetDuration,
  setTargetDuration,
  selectedStyle,
  setSelectedStyle,
  selectedLanguage,
  setSelectedLanguage,
  desiredClipCount,
  setDesiredClipCount,
  onAnalyzeAndGenerate,
  isAnalyzing,
  analysisProgressText,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingToServer, setIsUploadingToServer] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    const videoSource: VideoSource = {
      id: `local-${Date.now()}`,
      name: file.name,
      size: file.size,
      duration: 180, // will be updated once video metadata loads
      url: localUrl,
      file,
    };
    onSelectVideo(videoSource);

    // Concurrently upload to server disk so FFmpeg native CLI can access file directly
    setIsUploadingToServer(true);
    setUploadStatus('Підготовка та завантаження на сервер для FFmpeg...');
    try {
      const formData = new FormData();
      formData.append('video', file);
      const res = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          onSelectVideo({
            ...videoSource,
            url: data.url, // updates to server uploaded URL
            serverPath: data.path, // store absolute server path for FFmpeg
          });
          setUploadStatus('Відео збережено на сервері та готове до FFmpeg!');
        }
      }
    } catch (uploadErr) {
      console.warn('Background server video upload note:', uploadErr);
      setUploadStatus('Локальний режим готовий');
    } finally {
      setIsUploadingToServer(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    const videoSource: VideoSource = {
      id: `local-${Date.now()}`,
      name: file.name,
      size: file.size,
      duration: 180,
      url: localUrl,
      file,
    };
    onSelectVideo(videoSource);

    setIsUploadingToServer(true);
    setUploadStatus('Завантаження на сервер для FFmpeg...');
    try {
      const formData = new FormData();
      formData.append('video', file);
      const res = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          onSelectVideo({
            ...videoSource,
            url: data.url,
            serverPath: data.path,
          });
          setUploadStatus('Відео збережено на сервері!');
        }
      }
    } catch (uploadErr) {
      console.warn('Background server video upload note:', uploadErr);
    } finally {
      setIsUploadingToServer(false);
    }
  };

  const durations = [15, 30, 45, 60, 180];
  const clipCounts = [3, 5, 8, 10];

  return (
    <div className="bg-[#151922] border border-[#232a39] rounded-xl p-5 shadow-xl">
      {/* 1. Main Upload Area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          currentVideo
            ? 'border-emerald-500/50 bg-emerald-950/10 hover:border-emerald-500'
            : 'border-[#333e54] bg-[#1a202c]/50 hover:border-amber-500/80 hover:bg-[#1f2636]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/x-matroska,video/webm"
          className="hidden"
          onChange={handleFileChange}
        />

        {currentVideo ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-left">
            <div className="w-14 h-14 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ВІДЕО ГОТОВЕ ДО АНАЛІЗУ
                </span>
                <span className="text-xs text-gray-400">
                  {(currentVideo.size / (1024 * 1024)).toFixed(1)} МБ
                </span>
              </div>
              <h3 className="font-bold text-white text-base truncate mt-1">
                {currentVideo.name}
              </h3>
              {isUploadingToServer ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mt-2">
                  <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span>{uploadStatus || 'Завантаження на сервер...'}</span>
                </div>
              ) : uploadStatus ? (
                <p className="text-xs text-emerald-400 mt-1">{uploadStatus}</p>
              ) : (
                <p className="text-xs text-gray-400 mt-0.5">
                  Натисніть для вибору іншого файлу (підтримуються MP4, MOV, MKV, WEBM)
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-bold text-base text-white">
              Перетягніть Ваше довге відео сюди або натисніть для вибору
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-md">
              Підтримка реальних відео будь-якої тривалості (MP4, MOV, MKV, WEBM).
              Швидка локальна обробка через FFmpeg.
            </p>
            {isUploadingToServer && (
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mt-3">
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>{uploadStatus}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5 pt-4 border-t border-[#232a39]">
        {/* Number of Shorts to create (3 to 10) */}
        <div>
          <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Кількість Shorts (AI)</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {clipCounts.map((count) => (
              <button
                key={count}
                onClick={() => setDesiredClipCount(count)}
                className={`py-1.5 rounded text-xs font-bold transition border ${
                  desiredClipCount === count
                    ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                    : 'bg-[#1b212d] text-gray-300 border-[#2b3548] hover:bg-[#262f40] hover:text-white'
                }`}
              >
                {count} шт
              </button>
            ))}
          </div>
        </div>

        {/* Desired Duration */}
        <div>
          <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5 mb-2">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Цільова тривалість</span>
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {durations.map((d) => (
              <button
                key={d}
                onClick={() => setTargetDuration(d)}
                className={`py-1.5 rounded text-xs font-bold transition border ${
                  targetDuration === d
                    ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                    : 'bg-[#1b212d] text-gray-300 border-[#2b3548] hover:bg-[#262f40] hover:text-white'
                }`}
              >
                {d === 180 ? 'До 3хв' : `${d}с`}
              </button>
            ))}
          </div>
        </div>

        {/* Subtitles & Audio Language */}
        <div>
          <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5 mb-2">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>Мова субтитрів</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'uk' as SubtitleLanguage, label: '🇺🇦 Укр' },
              { id: 'en' as SubtitleLanguage, label: '🇬🇧 Eng' },
              { id: 'ru' as SubtitleLanguage, label: '🌐 Рос' },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className={`py-1.5 px-1.5 rounded text-xs font-bold transition border text-center whitespace-nowrap ${
                  selectedLanguage === lang.id
                    ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                    : 'bg-[#1b212d] text-gray-300 border-[#2b3548] hover:bg-[#262f40] hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Editing Style Selector */}
        <div>
          <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Стиль монтажу</span>
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {EDITING_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style)}
                className={`px-2 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition border shrink-0 flex items-center gap-1 ${
                  selectedStyle.id === style.id
                    ? 'bg-amber-500 text-black border-amber-400'
                    : 'bg-[#1b212d] text-gray-300 border-[#2b3548] hover:bg-[#262f40] hover:text-white'
                }`}
              >
                <span>{style.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Style Description Banner & Optional Sample Video Helper */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="bg-[#11141b] rounded-lg px-3 py-2 border border-[#232a39] flex items-center gap-2 flex-1">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            {selectedStyle.badge}
          </span>
          <span className="text-gray-300">{selectedStyle.description}</span>
        </div>

        {/* Secondary Sample video fallback (optional) */}
        <details className="text-gray-500 text-xs">
          <summary className="cursor-pointer hover:text-gray-300 transition">
            Немає відео? Тестовий зразок
          </summary>
          <div className="mt-1 flex items-center gap-1.5">
            {SAMPLE_VIDEOS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => onSelectVideo(sample)}
                className="text-[11px] px-2 py-1 rounded bg-[#1b212d] hover:bg-[#273042] text-gray-300 border border-[#2c3649]"
              >
                {sample.name.split(':')[0]}
              </button>
            ))}
          </div>
        </details>
      </div>

      {/* Main Action Button */}
      <div className="mt-5">
        <button
          onClick={() => {
            if (!currentVideo) {
              fileInputRef.current?.click();
            } else {
              onAnalyzeAndGenerate();
            }
          }}
          disabled={isAnalyzing}
          className="w-full relative overflow-hidden group py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-black font-extrabold text-sm sm:text-base tracking-wide shadow-lg shadow-amber-500/20 transition-all transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>{analysisProgressText || 'AI аналізує сцени, мовлення та кульмінації...'}</span>
            </>
          ) : !currentVideo ? (
            <>
              <UploadCloud className="w-5 h-5 text-black" />
              <span>ОБРАТИ ВІДЕО ТА СТВОРИТИ SHORTS АВТОМАТИЧНО</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-black" />
              <span>СТВОРИТИ {desiredClipCount} SHORTS АВТОМАТИЧНО (1 КЛІК)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
