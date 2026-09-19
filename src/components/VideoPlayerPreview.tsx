import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Eye, Download, Sparkles, Maximize2 } from 'lucide-react';
import { ShortClip, VideoSource } from '../types';

interface VideoPlayerPreviewProps {
  currentVideo: VideoSource | null;
  activeClip: ShortClip | null;
  videoElementRef: React.RefObject<HTMLVideoElement | null>;
  onExportClip: (clip: ShortClip) => void;
  isRendering: boolean;
  renderProgress: number;
  renderStatusText: string;
}

export const VideoPlayerPreview: React.FC<VideoPlayerPreviewProps> = ({
  currentVideo,
  activeClip,
  videoElementRef,
  onExportClip,
  isRendering,
  renderProgress,
  renderStatusText,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showSafeArea, setShowSafeArea] = useState(true);

  const duration = activeClip ? Math.max(1, activeClip.endTime - activeClip.startTime) : 30;

  // Handle video playback loop inside clip boundaries
  useEffect(() => {
    const video = videoElementRef.current;
    if (!video || !activeClip) return;

    video.currentTime = activeClip.startTime;
    setCurrentTime(0);

    const onTimeUpdate = () => {
      if (!activeClip) return;
      const relTime = video.currentTime - activeClip.startTime;
      setCurrentTime(Math.max(0, relTime));

      if (video.currentTime >= activeClip.endTime) {
        video.currentTime = activeClip.startTime;
        video.play().catch(() => {});
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [activeClip, videoElementRef]);

  // Real-time canvas drawing loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const video = videoElementRef.current;
      const canvas = canvasRef.current;
      if (canvas && video && activeClip) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          const currentRelTime = Math.max(0, video.currentTime - activeClip.startTime);

          // Clear
          ctx.fillStyle = '#0a0c10';
          ctx.fillRect(0, 0, w, h);

          const vW = video.videoWidth || 1920;
          const vH = video.videoHeight || 1080;
          const mode = activeClip.settings?.smartCropMode || activeClip.smartCropMode || 'blurred-background';

          if (video.readyState >= 2) {
            // LAYER 1: Background & Framing with Dynamic Retention Zoom
            const isZoomEnabled = activeClip.settings?.dynamicZoom !== false;
            let zoomScale = 1;
            if (isZoomEnabled && currentRelTime <= 2.2) {
              zoomScale = 1 + 0.12 * Math.max(0, 1 - currentRelTime / 2.2);
            }

            ctx.save();
            if (zoomScale > 1) {
              ctx.translate(w / 2, h / 2);
              ctx.scale(zoomScale, zoomScale);
              ctx.translate(-w / 2, -h / 2);
            }

            if (mode === 'blurred-background') {
              ctx.save();
              ctx.filter = 'blur(24px) brightness(0.6)';
              const bgScale = Math.max(w / vW, h / vH) * 1.25;
              const bgW = vW * bgScale;
              const bgH = vH * bgScale;
              ctx.drawImage(video, (w - bgW) / 2, (h - bgH) / 2, bgW, bgH);
              ctx.restore();

              // Sharp centered video
              const fgScale = w / vW;
              const fgH = vH * fgScale;
              const fgY = (h - fgH) / 2;
              ctx.drawImage(video, 0, fgY, w, fgH);
            } else if (mode === 'split-screen') {
              const topH = h * 0.38;
              const botH = h * 0.62;
              ctx.drawImage(video, vW * 0.35, 0, vW * 0.3, vH * 0.5, 0, 0, w, topH);
              ctx.fillStyle = '#f59e0b';
              ctx.fillRect(0, topH - 2, w, 4);
              const botScale = w / vW;
              const gH = vH * botScale;
              ctx.drawImage(video, 0, 0, vW, vH, 0, topH + (botH - gH) / 2, w, gH);
            } else {
              // Center crop
              const targetAspect = 9 / 16;
              const cropW = vH * targetAspect;
              const cropX = Math.max(0, (vW - cropW) / 2);
              ctx.drawImage(video, cropX, 0, cropW, vH, 0, 0, w, h);
            }
            ctx.restore();

            // LAYER 2: Color grading
            const filter = activeClip.settings?.colorFilter || 'vibrant';
            if (filter === 'vibrant') {
              ctx.fillStyle = 'rgba(255, 180, 50, 0.04)';
              ctx.fillRect(0, 0, w, h);
            } else if (filter === 'cinematic') {
              ctx.fillStyle = 'rgba(20, 40, 80, 0.07)';
              ctx.fillRect(0, 0, w, h);
            } else if (filter === 'cyber') {
              ctx.fillStyle = 'rgba(0, 240, 255, 0.05)';
              ctx.fillRect(0, 0, w, h);
            }

            // LAYER 3: Hook Banner (First 3 seconds)
            if (currentRelTime <= 3 && activeClip.hookText && activeClip.settings?.showHookBadge !== false) {
              const hookOpacity = Math.min(1, (3 - currentRelTime) * 2);
              ctx.save();
              ctx.globalAlpha = hookOpacity;

              const badgeY = 90;
              ctx.fillStyle = '#ef4444';
              ctx.font = '900 13px "Montserrat", sans-serif';
              ctx.textAlign = 'center';

              const badgeText = '⚡ ВІРУСНИЙ МОМЕНТ ⚡';
              const badgeW = ctx.measureText(badgeText).width + 24;
              ctx.beginPath();
              ctx.roundRect((w - badgeW) / 2, badgeY, badgeW, 26, 13);
              ctx.fill();

              ctx.fillStyle = '#ffffff';
              ctx.fillText(badgeText, w / 2, badgeY + 18);

              ctx.font = '900 20px "Plus Jakarta Sans", sans-serif';
              ctx.fillStyle = '#ffffff';
              ctx.strokeStyle = '#000000';
              ctx.lineWidth = 5;

              const hookWords = activeClip.hookText.split(' ');
              const half = Math.ceil(hookWords.length / 2);
              const line1 = hookWords.slice(0, half).join(' ');
              const line2 = hookWords.slice(half).join(' ');

              ctx.strokeText(line1, w / 2, badgeY + 60);
              ctx.fillText(line1, w / 2, badgeY + 60);
              if (line2) {
                ctx.fillStyle = '#fbbf24';
                ctx.strokeText(line2, w / 2, badgeY + 88);
                ctx.fillText(line2, w / 2, badgeY + 88);
              }

              ctx.restore();
            }

            // LAYER 4: Animated Subtitles
            const currentSub = activeClip.subtitles.find(
              (s) => currentRelTime >= s.start && currentRelTime <= s.end
            );

            if (currentSub) {
              ctx.save();
              const subPos = activeClip.settings?.subtitlePosition || 'bottom';
              const subY = subPos === 'top' ? 160 : subPos === 'middle' ? h / 2 : h - 170;
              const anim = activeClip.settings?.subtitleAnimation || 'Karaoke';
              const style = activeClip.settings?.subtitleStyle || 'mrbeast';

              const subRel = currentRelTime - currentSub.start;
              let scale = 1;
              if (anim === 'Pop-up' || anim === 'Bounce') {
                scale = subRel < 0.15 ? 1 + (0.15 - subRel) * 1.5 : 1;
              } else if (anim === 'Zoom') {
                scale = 1 + Math.sin(subRel * 4) * 0.05;
              }

              ctx.translate(w / 2, subY);
              ctx.scale(scale, scale);

              const fontSize = (activeClip.settings?.subtitleFontSize || 42) * 0.55;
              ctx.font = `900 ${fontSize}px "Montserrat", "Bebas Neue", sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';

              const words = currentSub.text.split(' ');
              const totalWords = words.length;
              const subDur = Math.max(0.2, currentSub.end - currentSub.start);
              const activeWordIndex = Math.min(totalWords - 1, Math.floor((subRel / subDur) * totalWords));

              const fullText = currentSub.text.toUpperCase();
              const textWidth = ctx.measureText(fullText).width;

              ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
              ctx.beginPath();
              ctx.roundRect(-Math.min(w - 30, textWidth + 24) / 2, -22, Math.min(w - 30, textWidth + 24), 44, 10);
              ctx.fill();

              let curX = -textWidth / 2;
              words.forEach((word, idx) => {
                const uWord = word.toUpperCase();
                const wordW = ctx.measureText(uWord + ' ').width;
                const isHighlight =
                  (currentSub.highlightWords &&
                    currentSub.highlightWords.some((hw) => uWord.includes(hw.toUpperCase()))) ||
                  (anim === 'Karaoke' && idx === activeWordIndex);

                ctx.lineWidth = 5;
                ctx.strokeStyle = '#000000';
                ctx.strokeText(uWord, curX + wordW / 2, 0);

                if (isHighlight) {
                  ctx.fillStyle = style === 'mrbeast' ? '#fbbf24' : '#22c55e';
                } else {
                  ctx.fillStyle = '#ffffff';
                }
                ctx.fillText(uWord, curX + wordW / 2, 0);

                curX += wordW;
              });

              ctx.restore();
            }

            // LAYER 5: Safe area overlay (if active)
            if (showSafeArea) {
              ctx.save();
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
              ctx.setLineDash([4, 4]);
              ctx.strokeRect(20, 60, w - 40, h - 140);

              // Right side action buttons safe zone indicator
              ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
              ctx.fillRect(w - 55, h - 300, 45, 200);

              ctx.font = '10px sans-serif';
              ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
              ctx.fillText('Safe Zone', 30, 75);
              ctx.restore();
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeClip, showSafeArea, videoElementRef]);

  const togglePlay = () => {
    const video = videoElementRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    const video = videoElementRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoElementRef.current;
    if (!video || !activeClip) return;
    const rel = Number(e.target.value);
    video.currentTime = activeClip.startTime + rel;
    setCurrentTime(rel);
  };

  const formatTime = (secs: number) => {
    const s = Math.floor(secs % 60);
    const m = Math.floor(secs / 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-[#151922] border border-[#232a39] rounded-xl p-4 flex flex-col items-center shadow-xl">
      {/* Viewport Header */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-[#232a39]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Попередній перегляд (9:16)
          </span>
          {activeClip && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {activeClip.emotionalTone}
            </span>
          )}
        </div>

        <button
          onClick={() => setShowSafeArea(!showSafeArea)}
          className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded border transition ${
            showSafeArea
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold'
              : 'bg-[#1b212d] text-gray-400 border-[#2b3548] hover:text-white'
          }`}
          title="Показати/приховати безпечну зону YouTube Shorts"
        >
          <Eye className="w-3 h-3" />
          <span>Безпечна зона</span>
        </button>
      </div>

      {/* 9:16 Canvas Mockup */}
      <div className="relative w-[280px] sm:w-[320px] h-[498px] sm:h-[568px] rounded-2xl overflow-hidden bg-black border-4 border-[#232a38] shadow-2xl shadow-black/80 flex items-center justify-center">
        {activeClip ? (
          <canvas
            ref={canvasRef}
            width={432}
            height={768}
            className="w-full h-full object-cover cursor-pointer"
            onClick={togglePlay}
          />
        ) : (
          <div className="p-6 text-center text-gray-500 text-xs">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            Виберіть відео та створіть Shorts для попереднього перегляду
          </div>
        )}

        {/* Render Progress Overlay */}
        {isRendering && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-20 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mb-3" />
            <h4 className="font-bold text-white text-sm">Створення MP4...</h4>
            <p className="text-xs text-amber-400 mt-1">{renderStatusText}</p>
            <div className="w-full bg-gray-700 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-red-500 h-full transition-all duration-150"
                style={{ width: `${renderProgress}%` }}
              />
            </div>
            <span className="text-[11px] text-gray-400 mt-1">{renderProgress}%</span>
          </div>
        )}
      </div>

      {/* Playback Controls Bar */}
      {activeClip && (
        <div className="w-full max-w-sm mt-4 space-y-2">
          {/* Progress / Seek bar */}
          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 accent-amber-500 h-1.5 bg-[#232a39] rounded-lg cursor-pointer"
            />
            <span>{formatTime(duration)}</span>
          </div>

          {/* Buttons row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const v = videoElementRef.current;
                  if (v && activeClip) {
                    v.currentTime = activeClip.startTime;
                    setCurrentTime(0);
                  }
                }}
                className="p-1.5 rounded-md hover:bg-[#232a39] text-gray-300 hover:text-white transition"
                title="На початок кліпу"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center transition shadow-md"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
              </button>

              <button
                onClick={toggleMute}
                className="p-1.5 rounded-md hover:bg-[#232a39] text-gray-300 hover:text-white transition"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Export MP4 Button */}
            <button
              onClick={() => onExportClip(activeClip)}
              disabled={isRendering}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs shadow-md transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Експорт цього MP4</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
