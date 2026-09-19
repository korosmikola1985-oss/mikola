import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { VideoUploader } from './components/VideoUploader';
import { VideoPlayerPreview } from './components/VideoPlayerPreview';
import { ClipsList } from './components/ClipsList';
import { TimelineEditor } from './components/TimelineEditor';
import { SubtitleInspector } from './components/SubtitleInspector';
import { EffectsAndCropPanel } from './components/EffectsAndCropPanel';
import { YouTubeMetadataModal } from './components/YouTubeMetadataModal';
import { BatchQueueDrawer } from './components/BatchQueueDrawer';
import { DesktopPackageModal } from './components/DesktopPackageModal';
import { VideoSource, ShortClip, BatchQueueItem, SubtitleLanguage } from './types';
import { EDITING_STYLES, SAMPLE_VIDEOS } from './data/presets';
import { VideoRenderer } from './utils/videoRenderer';
import { audioEngine } from './utils/audioEngine';

export default function App() {
  // Application State
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [currentVideo, setCurrentVideo] = useState<VideoSource | null>(null);
  const [targetDuration, setTargetDuration] = useState<number>(45);
  const [desiredClipCount, setDesiredClipCount] = useState<number>(5);
  const [selectedStyle, setSelectedStyle] = useState(EDITING_STYLES[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<SubtitleLanguage>('uk');
  const [clips, setClips] = useState<ShortClip[]>([]);
  const [activeClip, setActiveClip] = useState<ShortClip | null>(null);

  // Analysis & Rendering Status
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgressText, setAnalysisProgressText] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStatusText, setRenderStatusText] = useState('');
  const [renderingClipId, setRenderingClipId] = useState<string | null>(null);
  const [isExportingAll, setIsExportingAll] = useState(false);

  // Batch Queue & Modals
  const [batchQueue, setBatchQueue] = useState<BatchQueueItem[]>([]);
  const [isBatchDrawerOpen, setIsBatchDrawerOpen] = useState(false);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);
  const [activeYouTubePackClip, setActiveYouTubePackClip] = useState<ShortClip | null>(null);

  // Hidden/Shared Video element for frame processing & rendering
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Load video metadata on video selection
  useEffect(() => {
    const video = videoElementRef.current;
    if (!video || !currentVideo) return;

    video.src = currentVideo.url;
    video.load();

    const handleLoadedMetadata = () => {
      setCurrentVideo((prev) =>
        prev
          ? {
              ...prev,
              duration: video.duration || prev.duration,
              width: video.videoWidth || 1920,
              height: video.videoHeight || 1080,
            }
          : null
      );
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [currentVideo?.url]);

  // Handle Video Selection (uploaded or sample)
  const handleSelectVideo = (source: VideoSource) => {
    setCurrentVideo(source);
    setClips([]);
    setActiveClip(null);
  };

  // 1. Automatic AI Analysis & Shorts Generation
  const handleAnalyzeAndGenerate = async () => {
    if (!currentVideo) return;

    setIsAnalyzing(true);
    setAnalysisProgressText('1/4 Підготовка та перевірка файлу для серверного FFmpeg...');
    audioEngine.playSfx('whoosh', 0.4);

    try {
      let serverDiskPath = currentVideo.serverPath;

      // If user uploaded a local file and serverPath isn't known yet, upload directly to server
      if (!serverDiskPath && currentVideo.file) {
        setAnalysisProgressText('1/4 Завантаження відео у двигун FFmpeg на сервері...');
        try {
          const formData = new FormData();
          formData.append('video', currentVideo.file);
          const upRes = await fetch('/api/upload-video', {
            method: 'POST',
            body: formData,
          });
          if (upRes.ok) {
            const upData = await upRes.json();
            serverDiskPath = upData.path;
            if (upData.url) {
              setCurrentVideo((prev) =>
                prev ? { ...prev, url: upData.url, serverPath: upData.path } : null
              );
            }
          }
        } catch (e) {
          console.warn('Pre-upload error:', e);
        }
      }

      setAnalysisProgressText('2/4 FFprobe та FFmpeg сканують аудіо, ключові кадри та сцени...');
      await new Promise((r) => setTimeout(r, 600));

      setAnalysisProgressText(`3/4 Gemini 3.8 Flash шукає ${desiredClipCount} вірусних кульмінацій...`);

      // Step 2: Query backend Gemini API / highlight engine with selected language & real disk path
      const response = await fetch('/api/gemini/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: currentVideo.url,
          videoPath: serverDiskPath,
          title: currentVideo.name,
          duration: currentVideo.duration || 180,
          targetDuration,
          style: selectedStyle.name,
          genre: selectedStyle.genre,
          language: selectedLanguage,
          count: desiredClipCount,
        }),
      });

      setAnalysisProgressText('4/4 Формування 9:16 субтитрів, гачків та YouTube Shorts Pack...');
      const data = await response.json();
      const rawClips = data.clips || [];

      // Enrich clips with default audio/visual settings based on selected style
      const enrichedClips: ShortClip[] = rawClips.map((c: any) => ({
        ...c,
        settings: {
          subtitleStyle: selectedStyle.subtitleStyle,
          subtitleAnimation: selectedStyle.animation,
          subtitleFontSize: 42,
          subtitleColor: '#ffffff',
          subtitleHighlightColor: '#fbbf24',
          subtitlePosition: 'bottom',
          subtitleLanguage: selectedLanguage,
          musicTrack: selectedStyle.musicTrack,
          musicVolume: 0.25,
          sfxVolume: 0.5,
          sfxEnabled: true,
          colorFilter: 'vibrant',
          dynamicZoom: true,
          speedFactor: 1,
          removeSilences: true,
          showHookBadge: true,
          smartCropMode: c.smartCropMode || selectedStyle.defaultCrop,
        },
      }));

      setClips(enrichedClips);
      if (enrichedClips.length > 0) {
        setActiveClip(enrichedClips[0]);
      }

      audioEngine.playSfx('ding', 0.6);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgressText('');
    }
  };

  // 2. Real Video Render & Export to MP4 (FFmpeg server-accelerated + Canvas client fallback)
  const handleExportClip = async (clip: ShortClip) => {
    const video = videoElementRef.current;
    if (!video) return;

    setIsRendering(true);
    setRenderingClipId(clip.id);
    setRenderProgress(0);
    setRenderStatusText('Підготовка експорту MP4...');
    audioEngine.playSfx('whoosh', 0.4);

    let exportSuccess = false;

    // First: Attempt fast Native FFmpeg export via backend API (lossless 9:16 x264 MP4 with burned ASS subtitles)
    try {
      setRenderProgress(25);
      setRenderStatusText('FFmpeg монтує вертикальне 9:16 відео, кадрує, накладає субтитри та рендерить MP4...');

      const ffmpegRes = await fetch('/api/render-ffmpeg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: currentVideo?.url,
          videoPath: currentVideo?.serverPath,
          clip,
        }),
      });

      if (ffmpegRes.ok) {
        const ffmpegData = await ffmpegRes.json();
        if (ffmpegData.url) {
          setRenderProgress(100);
          setRenderStatusText('FFmpeg MP4 змонтовано успішно!');

          const a = document.createElement('a');
          a.href = ffmpegData.url;
          a.download = ffmpegData.filename || `${clip.title}_9x16.mp4`;
          a.click();

          VideoRenderer.downloadMetadataFile(clip);
          audioEngine.playSfx('ding', 0.7);

          setClips((prev) =>
            prev.map((c) => (c.id === clip.id ? { ...c, exportedBlobUrl: ffmpegData.url } : c))
          );
          exportSuccess = true;
        }
      }
    } catch (ffmpegErr) {
      console.warn('Native FFmpeg endpoint note, switching to browser Canvas recorder:', ffmpegErr);
    }

    // Second: Fallback to high-precision in-browser Canvas/MediaRecorder engine if needed
    if (!exportSuccess) {
      try {
        setRenderProgress(10);
        setRenderStatusText('Запуск резервного рендерера Canvas 2D / WebM-MP4...');
        const result = await VideoRenderer.renderClip(video, clip, (prog, text) => {
          setRenderProgress(prog);
          setRenderStatusText(text);
        });

        const a = document.createElement('a');
        a.href = result.url;
        a.download = result.filename;
        a.click();

        VideoRenderer.downloadMetadataFile(clip);
        audioEngine.playSfx('ding', 0.7);

        setClips((prev) =>
          prev.map((c) => (c.id === clip.id ? { ...c, exportedBlobUrl: result.url } : c))
        );
      } catch (err) {
        console.error('Render failed:', err);
      }
    }

    setIsRendering(false);
    setRenderingClipId(null);
    setRenderProgress(0);
    setRenderStatusText('');
  };

  // 3. Batch Export All Shorts
  const handleExportAllClips = async () => {
    if (clips.length === 0 || isExportingAll) return;
    setIsExportingAll(true);

    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      setActiveClip(clip);
      await handleExportClip(clip);
    }

    setIsExportingAll(false);
  };

  // Batch Queue Handlers
  const handleAddBatchFiles = (files: FileList) => {
    const newItems: BatchQueueItem[] = Array.from(files).map((f) => ({
      id: `batch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fileName: f.name,
      file: f,
      status: 'pending',
      progress: 0,
      clips: [],
    }));
    setBatchQueue((prev) => [...prev, ...newItems]);
  };

  const handleRemoveBatchItem = (id: string) => {
    setBatchQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleProcessBatch = async () => {
    setIsBatchDrawerOpen(false);
    for (let i = 0; i < batchQueue.length; i++) {
      const item = batchQueue[i];
      if (item.file) {
        const url = URL.createObjectURL(item.file);
        handleSelectVideo({
          id: item.id,
          name: item.fileName,
          size: item.file.size,
          duration: 180,
          url,
          file: item.file,
        });
        await new Promise((r) => setTimeout(r, 1000));
        await handleAnalyzeAndGenerate();
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0d1017] text-[#f1f3f7] font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden">
      {/* Hidden global video element for frame extraction and rendering */}
      <video
        ref={videoElementRef}
        crossOrigin="anonymous"
        playsInline
        preload="auto"
        className="hidden"
      />

      {/* Top Navigation Bar */}
      <Header
        mode={mode}
        setMode={setMode}
        batchCount={batchQueue.length}
        openBatchDrawer={() => setIsBatchDrawerOpen(true)}
        openDesktopModal={() => setIsDesktopModalOpen(true)}
        onExportAll={handleExportAllClips}
        clipsCount={clips.length}
        isExportingAll={isExportingAll}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-thin">
        {mode === 'auto' ? (
          /* =========================================================================
             MODE 1: AUTO (ONE-CLICK SHORTS STUDIO)
             ========================================================================= */
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column (Upload & Clips List) */}
            <div className="lg:col-span-7 space-y-4">
              <VideoUploader
                currentVideo={currentVideo}
                onSelectVideo={handleSelectVideo}
                targetDuration={targetDuration}
                setTargetDuration={setTargetDuration}
                selectedStyle={selectedStyle}
                setSelectedStyle={setSelectedStyle}
                selectedLanguage={selectedLanguage}
                setSelectedLanguage={setSelectedLanguage}
                desiredClipCount={desiredClipCount}
                setDesiredClipCount={setDesiredClipCount}
                onAnalyzeAndGenerate={handleAnalyzeAndGenerate}
                isAnalyzing={isAnalyzing}
                analysisProgressText={analysisProgressText}
              />

              <ClipsList
                clips={clips}
                activeClip={activeClip}
                onSelectClip={(c) => setActiveClip(c)}
                onEditClip={(c) => {
                  setActiveClip(c);
                  setMode('manual');
                }}
                onOpenYouTubePack={(c) => setActiveYouTubePackClip(c)}
                onExportClip={handleExportClip}
                onDownloadMetadata={(c) => VideoRenderer.downloadMetadataFile(c)}
                isRenderingClipId={renderingClipId}
              />
            </div>

            {/* Right Column (9:16 Vertical Preview & Controls) */}
            <div className="lg:col-span-5 sticky top-0">
              <VideoPlayerPreview
                currentVideo={currentVideo}
                activeClip={activeClip}
                videoElementRef={videoElementRef}
                onExportClip={handleExportClip}
                isRendering={isRendering}
                renderProgress={renderProgress}
                renderStatusText={renderStatusText}
              />
            </div>
          </div>
        ) : (
          /* =========================================================================
             MODE 2: MANUAL PRO EDITOR (CAPCUT-STYLE WORKSPACE)
             ========================================================================= */
          <div className="max-w-7xl mx-auto space-y-4 pb-6">
            {activeClip ? (
              <>
                {/* Top Section: Preview + Inspector Tabs */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Left: 9:16 Video Preview */}
                  <div className="lg:col-span-5">
                    <VideoPlayerPreview
                      currentVideo={currentVideo}
                      activeClip={activeClip}
                      videoElementRef={videoElementRef}
                      onExportClip={handleExportClip}
                      isRendering={isRendering}
                      renderProgress={renderProgress}
                      renderStatusText={renderStatusText}
                    />
                  </div>

                  {/* Right: Subtitle & Effects Panels */}
                  <div className="lg:col-span-7 space-y-4">
                    <SubtitleInspector
                      clip={activeClip}
                      onUpdateClip={(updated) => {
                        setActiveClip(updated);
                        setClips((prev) =>
                          prev.map((c) => (c.id === updated.id ? updated : c))
                        );
                      }}
                    />

                    <EffectsAndCropPanel
                      clip={activeClip}
                      onUpdateClip={(updated) => {
                        setActiveClip(updated);
                        setClips((prev) =>
                          prev.map((c) => (c.id === updated.id ? updated : c))
                        );
                      }}
                    />
                  </div>
                </div>

                {/* Bottom Section: Multi-Track Timeline */}
                <TimelineEditor
                  clip={activeClip}
                  onUpdateClip={(updated) => {
                    setActiveClip(updated);
                    setClips((prev) =>
                      prev.map((c) => (c.id === updated.id ? updated : c))
                    );
                  }}
                  videoDuration={currentVideo?.duration || 180}
                  currentTime={
                    videoElementRef.current
                      ? Math.max(0, videoElementRef.current.currentTime - activeClip.startTime)
                      : 0
                  }
                  onSeek={(relTime) => {
                    if (videoElementRef.current) {
                      videoElementRef.current.currentTime = activeClip.startTime + relTime;
                    }
                  }}
                  isPlaying={videoElementRef.current ? !videoElementRef.current.paused : false}
                  onTogglePlay={() => {
                    const v = videoElementRef.current;
                    if (!v) return;
                    if (v.paused) v.play().catch(() => {});
                    else v.pause();
                  }}
                />
              </>
            ) : (
              <div className="bg-[#151922] border border-[#232a39] rounded-2xl p-12 text-center max-w-xl mx-auto">
                <h3 className="font-bold text-white text-lg mb-2">Не обрано жодного Shorts</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Спершу згенеруйте Shorts у режимі АВТО або завантажте нове відео.
                </p>
                <button
                  onClick={() => setMode('auto')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition"
                >
                  Перейти до АВТО-РЕЖИМУ
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      <YouTubeMetadataModal
        clip={activeYouTubePackClip}
        onClose={() => setActiveYouTubePackClip(null)}
      />

      <BatchQueueDrawer
        isOpen={isBatchDrawerOpen}
        onClose={() => setIsBatchDrawerOpen(false)}
        queue={batchQueue}
        onAddFiles={handleAddBatchFiles}
        onRemoveItem={handleRemoveBatchItem}
        onProcessBatch={handleProcessBatch}
        isProcessing={isAnalyzing}
      />

      <DesktopPackageModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
      />
    </div>
  );
}
