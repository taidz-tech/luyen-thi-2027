import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../services/audioSynth';
import { Volume2, VolumeX, Play, Pause, Upload, RotateCcw, Music, Sparkles } from 'lucide-react';

export const AudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [volume, setVolume] = useState<number>(0.35);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsubscribe = audioService.subscribe((playing, currentTitle, vol) => {
      setIsPlaying(playing);
      setTitle(currentTitle);
      setVolume(vol);
    });
    return unsubscribe;
  }, []);

  const handleToggle = () => {
    audioService.toggle();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      audioService.loadUserFile(file);
    }
  };

  const handleReset = () => {
    audioService.resetToBuiltinLofi();
  };

  return (
    <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-full px-3 py-1.5 shadow-lg shadow-black/40 text-xs sm:text-sm text-slate-200">
      {/* Equalizer animation */}
      <button
        onClick={handleToggle}
        className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shadow-amber-500/20"
        title={isPlaying ? 'Tạm dừng nhạc' : 'Bật nhạc tập trung Lofi'}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      {/* Track details & Equalizer bars */}
      <div className="flex items-center gap-2 max-w-[130px] sm:max-w-[210px] overflow-hidden">
        {isPlaying && (
          <div className="flex items-end gap-0.5 h-3 shrink-0">
            <span className="w-1 bg-amber-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
            <span className="w-1 bg-amber-300 rounded-full animate-bounce h-3" style={{ animationDelay: '150ms' }} />
            <span className="w-1 bg-amber-400 rounded-full animate-bounce h-1.5" style={{ animationDelay: '300ms' }} />
          </div>
        )}
        <div className="truncate text-xs font-medium text-slate-300 flex items-center gap-1.5">
          <Music className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{title || 'Lofi Học Tập'}</span>
        </div>
      </div>

      {/* Volume button & popover */}
      <div className="relative">
        <button
          onClick={() => setShowVolumeSlider(!showVolumeSlider)}
          className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors rounded-full hover:bg-slate-800"
          title="Điều chỉnh âm lượng"
        >
          {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {showVolumeSlider && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-lg p-2.5 shadow-xl flex flex-col items-center gap-2 z-50">
            <span className="text-[10px] text-slate-400 font-mono">{Math.round(volume * 100)}%</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => audioService.setVolume(parseFloat(e.target.value))}
              className="w-20 accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Upload user music */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-all rounded-full flex items-center gap-1"
        title="Tải tệp nhạc từ thiết bị (.mp3, .wav...)"
      >
        <Upload className="w-3.5 h-3.5" />
        <span className="hidden md:inline text-[11px] font-medium text-slate-400">Tải nhạc</span>
      </button>

      {/* Reset to Lo-fi Chill */}
      <button
        onClick={handleReset}
        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all rounded-full"
        title="Quay lại nhạc Lofi Chill mặc định"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
