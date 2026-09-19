import { ShortClip } from '../types';

export interface RenderProgressCallback {
  (progress: number, statusText: string): void;
}

export class VideoRenderer {
  /**
   * Renders a short vertical clip (9:16) with all visual transformations,
   * animated captions, hook overlay, color grading, and audio to a real downloadable Blob.
   */
  static async renderClip(
    sourceVideo: HTMLVideoElement,
    clip: ShortClip,
    onProgress?: RenderProgressCallback
  ): Promise<{ blob: Blob; url: string; filename: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        const width = 720;
        const height = 1280; // Standard 9:16 vertical resolution for fast high-fps web export
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: false });

        if (!ctx) {
          throw new Error('Не вдалося ініціалізувати 2D Canvas');
        }

        // Set up audio stream from video element
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        // Create stream from canvas
        const canvasStream = canvas.captureStream(30);

        // Try getting video audio
        let finalStream: MediaStream;
        try {
          // Use captureStream from video if supported, or audio routing
          const videoAny = sourceVideo as any;
          const videoStream = videoAny.captureStream ? videoAny.captureStream() : videoAny.mozCaptureStream ? videoAny.mozCaptureStream() : null;
          if (videoStream && videoStream.getAudioTracks().length > 0) {
            const audioTrack = videoStream.getAudioTracks()[0];
            canvasStream.addTrack(audioTrack);
            finalStream = canvasStream;
          } else {
            finalStream = canvasStream;
          }
        } catch {
          finalStream = canvasStream;
        }

        // Choose supported mimeType
        const mimeTypes = [
          'video/mp4;codecs=avc1,mp4a.40.2',
          'video/mp4',
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm',
        ];
        let chosenMime = 'video/webm';
        for (const mime of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mime)) {
            chosenMime = mime;
            break;
          }
        }

        const recorder = new MediaRecorder(finalStream, {
          mimeType: chosenMime,
          videoBitsPerSecond: 4_000_000,
        });

        const recordedChunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunks.push(e.data);
          }
        };

        const duration = Math.max(1, clip.endTime - clip.startTime);
        let animationFrameId: number;

        recorder.onstop = () => {
          cancelAnimationFrame(animationFrameId);
          sourceVideo.pause();
          const extension = chosenMime.includes('mp4') ? 'mp4' : 'webm';
          const blob = new Blob(recordedChunks, { type: chosenMime });
          const url = URL.createObjectURL(blob);
          const cleanTitle = clip.title.replace(/[^a-zA-Z0-9а-яА-ЯіІїЇєЄґҐ_ -]/g, '').trim() || 'Shorts';
          const filename = `${cleanTitle}.${extension}`;

          onProgress?.(100, 'Рендеринг завершено!');
          resolve({ blob, url, filename });
        };

        onProgress?.(5, 'Підготовка таймлайну та аудіодоріжки...');

        // Seek video to clip start
        sourceVideo.currentTime = clip.startTime;
        await new Promise<void>((r) => {
          const handler = () => {
            sourceVideo.removeEventListener('seeked', handler);
            r();
          };
          sourceVideo.addEventListener('seeked', handler);
          setTimeout(r, 800); // safety fallback
        });

        recorder.start(100);
        await sourceVideo.play();

        const startTimeMs = performance.now();

        const drawFrame = () => {
          const currentRelTime = sourceVideo.currentTime - clip.startTime;
          const progressPct = Math.min(99, Math.round((currentRelTime / duration) * 100));

          onProgress?.(Math.max(5, progressPct), `Рендеринг: ${Math.round(currentRelTime)}s / ${Math.round(duration)}s (${progressPct}%)`);

          if (sourceVideo.currentTime >= clip.endTime || sourceVideo.ended) {
            recorder.stop();
            return;
          }

          // 1. CLEAR
          ctx.fillStyle = '#0a0c10';
          ctx.fillRect(0, 0, width, height);

          // 2. BACKGROUND & FRAMING
          const mode = clip.settings?.smartCropMode || clip.smartCropMode || 'blurred-background';
          const vWidth = sourceVideo.videoWidth || 1920;
          const vHeight = sourceVideo.videoHeight || 1080;

          if (mode === 'blurred-background') {
            // Blurred background layer
            ctx.save();
            ctx.filter = 'blur(28px) brightness(0.65)';
            const bgScale = Math.max(width / vWidth, height / vHeight) * 1.3;
            const bgW = vWidth * bgScale;
            const bgH = vHeight * bgScale;
            ctx.drawImage(sourceVideo, (width - bgW) / 2, (height - bgH) / 2, bgW, bgH);
            ctx.restore();

            // Sharp centered video
            const fgScale = width / vWidth;
            const fgW = width;
            const fgH = vHeight * fgScale;
            const fgY = (height - fgH) / 2;

            // Subtle border shadow around central video
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 24;
            ctx.drawImage(sourceVideo, 0, fgY, fgW, fgH);
            ctx.shadowBlur = 0;
          } else if (mode === 'split-screen') {
            // Gaming split layout: Facecam top 38%, Gameplay bottom 62%
            const topH = height * 0.38;
            const botH = height * 0.62;

            // Top zoomed section
            ctx.drawImage(sourceVideo, vWidth * 0.35, 0, vWidth * 0.3, vHeight * 0.5, 0, 0, width, topH);
            // Divider
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(0, topH - 2, width, 4);
            // Bottom full gameplay
            const botScale = width / vWidth;
            const gH = vHeight * botScale;
            ctx.drawImage(sourceVideo, 0, 0, vWidth, vHeight, 0, topH + (botH - gH) / 2, width, gH);
          } else {
            // Center action / Face tracking crop
            const targetAspect = 9 / 16;
            const cropWidth = vHeight * targetAspect;
            const cropX = Math.max(0, (vWidth - cropWidth) / 2);
            ctx.drawImage(sourceVideo, cropX, 0, cropWidth, vHeight, 0, 0, width, height);
          }

          // 3. COLOR GRADING
          const filterPreset = clip.settings?.colorFilter || 'vibrant';
          if (filterPreset === 'vibrant') {
            ctx.fillStyle = 'rgba(255, 180, 50, 0.04)';
            ctx.fillRect(0, 0, width, height);
          } else if (filterPreset === 'cinematic') {
            ctx.fillStyle = 'rgba(20, 40, 80, 0.07)';
            ctx.fillRect(0, 0, width, height);
          } else if (filterPreset === 'cyber') {
            ctx.fillStyle = 'rgba(0, 240, 255, 0.05)';
            ctx.fillRect(0, 0, width, height);
          }

          // Subtle vignette
          const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.4, width / 2, height / 2, height * 0.75);
          grad.addColorStop(0, 'rgba(0,0,0,0)');
          grad.addColorStop(1, 'rgba(0,0,0,0.45)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // 4. HOOK CARD OVERLAY (First 3 seconds)
          if (currentRelTime <= 3 && clip.hookText && clip.settings?.showHookBadge !== false) {
            const hookOpacity = Math.min(1, (3 - currentRelTime) * 2);
            ctx.save();
            ctx.globalAlpha = hookOpacity;

            const badgeY = 160;
            ctx.fillStyle = '#ef4444';
            ctx.font = '900 22px "Montserrat", sans-serif';
            ctx.textAlign = 'center';

            // Badge pill
            const badgeText = '⚡ ВІРУСНИЙ МОМЕНТ ⚡';
            const badgeW = ctx.measureText(badgeText).width + 36;
            ctx.beginPath();
            ctx.roundRect((width - badgeW) / 2, badgeY, badgeW, 40, 20);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.fillText(badgeText, width / 2, badgeY + 27);

            // Hook Title Text
            ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 7;

            const hookWords = clip.hookText.split(' ');
            let line1 = '';
            let line2 = '';
            const half = Math.ceil(hookWords.length / 2);
            line1 = hookWords.slice(0, half).join(' ');
            line2 = hookWords.slice(half).join(' ');

            ctx.strokeText(line1, width / 2, badgeY + 95);
            ctx.fillText(line1, width / 2, badgeY + 95);
            if (line2) {
              ctx.fillStyle = '#fbbf24';
              ctx.strokeText(line2, width / 2, badgeY + 145);
              ctx.fillText(line2, width / 2, badgeY + 145);
            }

            ctx.restore();
          }

          // 5. ANIMATED SUBTITLES
          const currentSub = clip.subtitles.find(
            (s) => currentRelTime >= s.start && currentRelTime <= s.end
          );

          if (currentSub) {
            ctx.save();
            const subPos = clip.settings?.subtitlePosition || 'bottom';
            const subY = subPos === 'top' ? 280 : subPos === 'middle' ? height / 2 : height - 320;
            const anim = clip.settings?.subtitleAnimation || 'Karaoke';
            const style = clip.settings?.subtitleStyle || 'mrbeast';

            // Animation scale
            const subRel = currentRelTime - currentSub.start;
            let scale = 1;
            if (anim === 'Pop-up' || anim === 'Bounce') {
              scale = subRel < 0.15 ? 1 + (0.15 - subRel) * 1.5 : 1;
            } else if (anim === 'Zoom') {
              scale = 1 + Math.sin(subRel * 4) * 0.05;
            }

            ctx.translate(width / 2, subY);
            ctx.scale(scale, scale);

            const fontSize = clip.settings?.subtitleFontSize || 42;
            ctx.font = `900 ${fontSize}px "Montserrat", "Bebas Neue", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const words = currentSub.text.split(' ');
            const totalWords = words.length;
            const subDur = Math.max(0.2, currentSub.end - currentSub.start);
            const activeWordIndex = Math.min(totalWords - 1, Math.floor((subRel / subDur) * totalWords));

            // Measure line layout
            const fullText = currentSub.text.toUpperCase();
            const textWidth = ctx.measureText(fullText).width;

            // Background pill for subtitle legibility
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.beginPath();
            ctx.roundRect(-Math.min(width - 60, textWidth + 40) / 2, -38, Math.min(width - 60, textWidth + 40), 76, 16);
            ctx.fill();

            // Word by word rendering with highlight
            let curX = -textWidth / 2;
            words.forEach((word, idx) => {
              const uWord = word.toUpperCase();
              const wordW = ctx.measureText(uWord + ' ').width;
              const isHighlight =
                (currentSub.highlightWords &&
                  currentSub.highlightWords.some((hw) => uWord.includes(hw.toUpperCase()))) ||
                (anim === 'Karaoke' && idx === activeWordIndex);

              ctx.lineWidth = 8;
              ctx.strokeStyle = '#000000';
              ctx.strokeText(uWord, curX + wordW / 2, 0);

              if (isHighlight) {
                ctx.fillStyle = style === 'mrbeast' ? '#fbbf24' : '#22c55e'; // Bright yellow or neon green
              } else {
                ctx.fillStyle = '#ffffff';
              }
              ctx.fillText(uWord, curX + wordW / 2, 0);

              curX += wordW;
            });

            ctx.restore();
          }

          animationFrameId = requestAnimationFrame(drawFrame);
        };

        drawFrame();
      } catch (err) {
        console.error('Render error:', err);
        reject(err);
      }
    });
  }

  /**
   * Helper to download text metadata file (title, description, tags)
   */
  static downloadMetadataFile(clip: ShortClip) {
    const pack = clip.youtubePack;
    const content = `=====================================================
AI SHORTS STUDIO PRO - YOUTUBE SHORTS PACK
=====================================================

📌 ВАРІАНТИ ЗАГОЛОВКІВ:
1. ${pack.titleOptions[0] || clip.title}
2. ${pack.titleOptions[1] || ''}
3. ${pack.titleOptions[2] || ''}

📝 ОПИС:
${pack.description}

🏷️ ХЕШТЕГИ:
${pack.hashtags.join(' ')}

🔑 КЛЮЧОВІ СЛОВА (TAGS):
${pack.keywords.join(', ')}

🖼️ ТЕКСТ ДЛЯ ОБКЛАДИНКИ:
${pack.coverText}

💡 ПОРАДА ДЛЯ ПЕРШОЇ СЕКУНДИ (RETENTION):
${pack.firstSecondTip}

⏱️ ТАЙМІНГИ У ВИХІДНОМУ ВІДЕО:
Початок: ${clip.startTime}s | Кінець: ${clip.endTime}s | Тривалість: ${clip.duration}s
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clip.title.slice(0, 30)}_metadata.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
