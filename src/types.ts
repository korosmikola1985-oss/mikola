export type SubtitleLanguage = 'uk' | 'en' | 'ru';

export type SmartCropMode = 'blurred-background' | 'face-tracking' | 'split-screen' | 'center-action';

export type SubtitleAnimation = 'Pop-up' | 'Bounce' | 'Zoom' | 'Typewriter' | 'Karaoke' | 'Word-by-word';

export type SubtitleStylePreset = 'hormozi' | 'mrbeast' | 'minimal' | 'cyberpunk' | 'comic';

export type ColorFilterPreset = 'none' | 'vibrant' | 'cinematic' | 'cyber' | 'punch' | 'warm';

export interface SubtitleItem {
  id?: string;
  start: number; // in seconds relative to clip start
  end: number;
  text: string;
  highlightWords?: string[];
}

export interface YouTubePack {
  titleOptions: string[];
  description: string;
  hashtags: string[];
  keywords: string[];
  coverText: string;
  firstSecondTip: string;
}

export interface ShortClipSettings {
  subtitleStyle: SubtitleStylePreset;
  subtitleAnimation: SubtitleAnimation;
  subtitleFontSize: number;
  subtitleColor: string;
  subtitleHighlightColor: string;
  subtitlePosition: 'bottom' | 'middle' | 'top';
  musicTrack: string;
  musicVolume: number; // 0..1
  sfxVolume: number;
  sfxEnabled: boolean;
  colorFilter: ColorFilterPreset;
  speedFactor: number;
  removeSilences: boolean;
  showHookBadge: boolean;
  smartCropMode: SmartCropMode;
  subtitleLanguage?: SubtitleLanguage;
  dynamicZoom?: boolean;
}

export interface ShortClip {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  duration: number;
  viralScore: number;
  hookText: string;
  emotionalTone: string;
  summary: string;
  smartCropMode: SmartCropMode;
  subtitles: SubtitleItem[];
  youtubePack: YouTubePack;
  settings: ShortClipSettings;
  exportedBlobUrl?: string;
  exportedMime?: string;
}

export interface VideoSource {
  id: string;
  name: string;
  size: number;
  duration: number;
  url: string;
  width?: number;
  height?: number;
  file?: File;
  serverPath?: string;
  isSample?: boolean;
}

export interface EditingStyle {
  id: string;
  name: string;
  genre: string;
  description: string;
  badge: string;
  defaultCrop: SmartCropMode;
  subtitleStyle: SubtitleStylePreset;
  animation: SubtitleAnimation;
  musicTrack: string;
  iconName: string;
}

export interface BatchQueueItem {
  id: string;
  fileName: string;
  file?: File;
  sampleUrl?: string;
  duration?: number;
  status: 'pending' | 'analyzing' | 'ready' | 'exporting' | 'completed' | 'error';
  progress: number;
  clips: ShortClip[];
  error?: string;
}
