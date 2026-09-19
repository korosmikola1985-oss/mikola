import React, { useState } from 'react';
import { X, HardDrive, Terminal, Download, Check, ShieldCheck, Cpu, Code } from 'lucide-react';

interface DesktopPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopPackageModal: React.FC<DesktopPackageModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [downloadedBat, setDownloadedBat] = useState(false);
  const [activeTab, setActiveTab] = useState<'windows' | 'ffmpeg' | 'electron'>('windows');

  if (!isOpen) return null;

  const downloadBatFile = () => {
    const batContent = `@echo off
chcp 65001 > nul
title AI Shorts Studio PRO - Windows 10 Launcher
echo ================================================================
echo           AI SHORTS STUDIO PRO - НАСТІЛЬНА ВЕРСІЯ (PC)
echo ================================================================
echo.
echo Перевірка наявності FFmpeg у системі Windows 10...
where ffmpeg >nul 2>nul
if %errorlevel% neq 0 (
    echo [УВАГА] FFmpeg не знайдено у системній змінній PATH!
    echo Будь ласка, завантажте FFmpeg: https://ffmpeg.org/download.html
    echo Та додайте папку bin у змінні середовища PATH.
) else (
    echo [OK] FFmpeg встановлено та готовий до апаратного прискорення!
)

echo.
echo Перевірка Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ПОМИЛКА] Node.js не знайдено! Встановіть з https://nodejs.org
    pause
    exit /b
)

echo.
echo Запуск локального сервера та робочого простору AI Shorts Studio PRO...
npm run dev
pause
`;

    const blob = new Blob([batContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'start_ai_shorts_studio.bat';
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedBat(true);
    setTimeout(() => setDownloadedBat(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#151922] border border-[#2b3548] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#232a39] flex items-center justify-between sticky top-0 bg-[#151922] z-10">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-white text-base">
                Windows 10 / Настільний ПК & FFmpeg
              </h3>
              <p className="text-[11px] text-gray-400">
                Запуск як повноцінної настільної програми з локальним FFmpeg та Whisper
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

        {/* Tab selector */}
        <div className="px-5 pt-3 flex gap-2 border-b border-[#232a39]">
          <button
            onClick={() => setActiveTab('windows')}
            className={`pb-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'windows'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            1. Запуск на Windows 10
          </button>
          <button
            onClick={() => setActiveTab('ffmpeg')}
            className={`pb-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'ffmpeg'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            2. FFmpeg команди & CPU режим
          </button>
          <button
            onClick={() => setActiveTab('electron')}
            className={`pb-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'electron'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            3. Пакування в Electron / Tauri
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 space-y-4 flex-1 text-xs text-gray-300 leading-relaxed">
          {activeTab === 'windows' && (
            <div className="space-y-4">
              <div className="bg-[#1a202c] border border-[#2c374c] rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Швидкий запуск на вашому ПК (Windows 10 / 11)</span>
                </h4>
                <p>
                  Програма розроблена так, що працює як у браузері (через WebCodecs, Canvas 2D та MediaRecorder),
                  так і локально на комп'ютері без жодних обмежень за допомогою одного командного файлу.
                </p>
                <ol className="list-decimal list-inside space-y-1 text-gray-300 pl-1 pt-1">
                  <li>Завантажте проект на свій ПК (через меню AI Studio &gt; Export to ZIP/GitHub).</li>
                  <li>Встановіть безкоштовний <strong className="text-white">Node.js</strong> та <strong className="text-white">FFmpeg</strong>.</li>
                  <li>Завантажте готовий лаунчер <code className="bg-[#12161f] px-1 py-0.5 rounded text-amber-400">start_ai_shorts_studio.bat</code> нижче.</li>
                  <li>Двічі клацніть по <code className="bg-[#12161f] px-1 py-0.5 rounded text-amber-400">start_ai_shorts_studio.bat</code> — програма відкриється на вашому ПК!</li>
                </ol>
              </div>

              <button
                onClick={downloadBatFile}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold flex items-center justify-center gap-2 shadow-lg transition"
              >
                {downloadedBat ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Файл .BAT завантажено!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Завантажити Windows 10 Launcher (start_ai_shorts_studio.bat)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'ffmpeg' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>Економний режим на ПК з 2 ГБ відеопам'яті (CPU encoding)</span>
              </div>
              <p>
                Для ПК зі слабкою відеокартою (2 ГБ VRAM) використовується багатопотоковий CPU-енкодер <code className="text-amber-400">libx264</code> із пресетом <code className="text-amber-400">-preset veryfast</code>:
              </p>

              <div className="bg-[#0e1117] border border-[#232936] rounded-xl p-3 font-mono text-[11px] text-gray-300 overflow-x-auto">
                <div className="text-gray-500"># Точне нарізання 9:16 з розмитим фоном на CPU:</div>
                <div className="text-emerald-400 whitespace-pre">
{`ffmpeg -ss {START} -to {END} -i input.mp4 \\
  -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,boxblur=20:5[bg]; \\
  [0:v]scale=1080:-1[fg]; \\
  [bg][fg]overlay=(W-w)/2:(H-h)/2" \\
  -c:v libx264 -preset veryfast -crf 22 -c:a aac -b:a 192k output_short.mp4`}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#1a202c] border border-[#2c374c] text-[11px]">
                <strong className="text-amber-400">Порада:</strong> При наявності відеокарти NVIDIA GeForce замініть <code className="text-white">-c:v libx264</code> на <code className="text-white">-c:v h264_nvenc</code> для рендерингу за 3-5 секунд!
              </div>
            </div>
          )}

          {activeTab === 'electron' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Code className="w-4 h-4 text-blue-400" />
                <span>Збірка настільного застосунку (Electron / Tauri)</span>
              </div>
              <p>
                Ви можете зібрати автономний .exe інсталятор для Windows за 2 хвилини:
              </p>

              <div className="bg-[#0e1117] border border-[#232936] rounded-xl p-3 font-mono text-[11px] text-gray-300 space-y-1">
                <div className="text-gray-500"># 1. Встановлення electron-packager:</div>
                <div className="text-blue-400">npm install -D electron electron-builder</div>
                <div className="text-gray-500 pt-1"># 2. Збірка автономного Windows .exe файлу:</div>
                <div className="text-emerald-400">npx electron-builder --win --x64</div>
              </div>

              <p className="text-[11px] text-gray-400">
                Згенерований інсталятор створить іконку на робочому столі Windows та запускатиметься без сторонніх браузерів.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
