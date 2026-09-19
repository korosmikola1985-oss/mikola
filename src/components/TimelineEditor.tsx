import React, { useRef } from 'react';
import { Scissors, ZoomIn, ZoomOut, Play, Pause, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { ShortClip } from '../types';

interface TimelineEditorProps {
  clip: ShortClip;
  onUpdateClip: (updated: ShortClip) => void;
  videoDuration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  clip,
  onUpdateClip,
  videoDuration,
  currentTime,
  onSeek,
  isPlaying,
  onTogglePlay,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);

  const totalDur = Math.max(videoDuration || 180, clip.endTime + 10);
  const leftPercent = (clip.startTime / totalDur) * 100;
  const widthPercent = ((clip.endTime - clip.startTime) / totalDur) * 100;
  const playheadPercent = ((clip.startTime + currentTime) / totalDur) * 100;

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = pct * totalDur;

    if (targetTime >= clip.startTime && targetTime <= clip.endTime) {
      onSeek(targetTime - clip.startTime);
    }
  };

  const handleAdjustStart = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val < clip.endTime - 5) {
      onUpdateClip({
        ...clip,
        startTime: val,
        duration: clip.endTime - val,
      });
    }
  };

  const handleAdjustEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val > clip.startTime + 5) {
      onUpdateClip({
        ...clip,
        endTime: val,
        duration: val - clip.startTime,
      });
    }
  };

  return (
    <div className="bg-[#12151c] border border-[#232936] rounded-xl p-4">
      {/* Timeline Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-[#232936]">
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="w-7 h-7 rounded-md bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center transition"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black ml-0.5" />}
          </button>
          <div className="text-xs font-mono text-gray-300">
            <span className="text-amber-400 font-bold">{currentTime.toFixed(1)}s</span> / {clip.duration.toFixed(1)}s
          </div>
        </div>

        {/* Trim controls inputs */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 font-medium">Старт:</span>
            <input
              type="number"
              min={0}
              max={clip.endTime - 5}
              value={clip.startTime}
              onChange={handleAdjustStart}
              className="w-16 bg-[#1a202c] border border-[#2e3748] rounded px-1.5 py-0.5 text-center text-white font-mono"
            />
            <span className="text-gray-400">сек</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 font-medium">Кінець:</span>
            <input
              type="number"
              min={clip.startTime + 5}
              max={totalDur}
              value={clip.endTime}
              onChange={handleAdjustEnd}
              className="w-16 bg-[#1a202c] border border-[#2e3748] rounded px-1.5 py-0.5 text-center text-white font-mono"
            />
            <span className="text-gray-400">сек</span>
          </div>
        </div>
      </div>

      {/* Multi-Track Timeline Visual Area */}
      <div
        ref={timelineRef}
        onClick={handleTimelineClick}
        className="relative h-28 bg-[#090b0f] border border-[#1f2533] rounded-lg overflow-hidden select-none cursor-pointer"
      >
        {/* Playhead Vertical Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-30 pointer-events-none shadow-[0_0_8px_rgba(245,158,11,0.8)]"
          style={{ left: `${playheadPercent}%` }}
        >
          <div className="w-2.5 h-2.5 bg-amber-400 transform -translate-x-[4px] rotate-45" />
        </div>

        {/* TRACK 1: Video Segment Block */}
        <div className="absolute top-2 left-0 right-0 h-9 flex items-center px-1">
          <div className="text-[10px] font-bold text-gray-500 w-14 shrink-0 pl-1">ВІДЕО 9:16</div>
          <div className="relative flex-1 h-full bg-[#151922] rounded overflow-hidden">
            {/* Active Highlighted Segment */}
            <div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-amber-500/30 border-2 border-amber-500 rounded flex items-center justify-between px-2 text-xs font-bold text-amber-300"
              style={{
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
              }}
            >
              <span className="truncate">{clip.title}</span>
              <span className="text-[10px] bg-black/60 px-1 rounded">{clip.duration.toFixed(0)}с</span>
            </div>
          </div>
        </div>

        {/* TRACK 2: Subtitle markers */}
        <div className="absolute top-12 left-0 right-0 h-6 flex items-center px-1">
          <div className="text-[10px] font-bold text-gray-500 w-14 shrink-0 pl-1">СУБТИТРИ</div>
          <div className="relative flex-1 h-full bg-[#151922] rounded overflow-hidden">
            {clip.subtitles.map((sub, i) => {
              const subStart = clip.startTime + sub.start;
              const subDur = sub.end - sub.start;
              const sLeft = (subStart / totalDur) * 100;
              const sW = (subDur / totalDur) * 100;

              return (
                <div
                  key={i}
                  className="absolute top-0.5 bottom-0.5 bg-emerald-500/40 border border-emerald-400 rounded px-1 text-[9px] text-emerald-200 font-bold truncate flex items-center"
                  style={{
                    left: `${sLeft}%`,
                    width: `${Math.max(1.5, sW)}%`,
                  }}
                  title={sub.text}
                >
                  {sub.text}
                </div>
              );
            })}
          </div>
        </div>

        {/* TRACK 3: Audio waveform & ducking */}
        <div className="absolute top-19 left-0 right-0 h-7 flex items-center px-1">
          <div className="text-[10px] font-bold text-gray-500 w-14 shrink-0 pl-1">АУДІО</div>
          <div className="relative flex-1 h-full bg-[#151922] rounded overflow-hidden flex items-center px-1">
            <div className="w-full flex items-center gap-0.5 opacity-60">
              {Array.from({ length: 70 }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-1 bg-amber-500/70 rounded-full"
                  style={{
                    height: `${15 + Math.sin(idx * 0.4) * 10 + (idx % 3 === 0 ? 8 : 0)}px`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
