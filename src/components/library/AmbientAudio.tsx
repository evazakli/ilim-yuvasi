import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, CloudRain, Flame, Book, Music } from 'lucide-react';

type AmbientTrack = 'rain' | 'fireplace' | 'library' | 'off';

export const AmbientAudio: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<AmbientTrack>('off');
  const [volume, setVolume] = useState<number>(0.35);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);

  // Initialize or resume AudioContext
  const getAudioContext = (): AudioContext => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const stopCurrentAudio = () => {
    if (sourceNodeRef.current) {
      try {
        (sourceNodeRef.current as any).stop?.();
        sourceNodeRef.current.disconnect();
      } catch {
        // ignore
      }
      sourceNodeRef.current = null;
    }
  };

  const playRainNoise = () => {
    const ctx = getAudioContext();
    stopCurrentAudio();

    // Create 5 seconds pink noise buffer looped
    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate rain outside glass
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gainNodeRef.current = gain;

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();
    sourceNodeRef.current = whiteNoise;
  };

  const playFireplaceNoise = () => {
    const ctx = getAudioContext();
    stopCurrentAudio();

    // Gentle low rumble with occasional crackles
    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const white = (Math.random() * 2 - 1) * 0.03;
      // Random crackle pops
      const crackle = Math.random() > 0.9992 ? (Math.random() * 2 - 1) * 0.4 : 0;
      output[i] = white + crackle;
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 1.2, ctx.currentTime);
    gainNodeRef.current = gain;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start();
    sourceNodeRef.current = source;
  };

  const playLibraryMurmur = () => {
    const ctx = getAudioContext();
    stopCurrentAudio();

    // Soft warm low brown noise
    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 0.35;
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.Q.setValueAtTime(1.2, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 1.5, ctx.currentTime);
    gainNodeRef.current = gain;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start();
    sourceNodeRef.current = source;
  };

  const handleTrackSelect = (track: AmbientTrack) => {
    if (track === currentTrack) {
      // Toggle off
      stopCurrentAudio();
      setCurrentTrack('off');
    } else {
      setCurrentTrack(track);
      if (track === 'rain') playRainNoise();
      else if (track === 'fireplace') playFireplaceNoise();
      else if (track === 'library') playLibraryMurmur();
    }
  };

  // Adjust volume live
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCurrentAudio();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
          currentTrack !== 'off'
            ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300 shadow-sm shadow-emerald-500/20'
            : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600'
        }`}
        title="Ortam Sesleri"
      >
        {currentTrack !== 'off' ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
        <span className="hidden sm:inline">
          {currentTrack === 'rain' && 'Yağmur Sesi'}
          {currentTrack === 'fireplace' && 'Şömine'}
          {currentTrack === 'library' && 'Kütüphane'}
          {currentTrack === 'off' && 'Ortam Sesi'}
        </span>
      </button>

      {/* Popover Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-64 p-3 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="text-xs font-bold text-slate-200">İlim Yuvası Ortam Sesleri</span>
            {currentTrack !== 'off' && (
              <button
                onClick={() => handleTrackSelect('off')}
                className="text-[10px] text-rose-400 hover:underline"
              >
                Kapat
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => handleTrackSelect('rain')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition ${
                currentTrack === 'rain'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-sky-400" />
                <span>Cama Vuran Yağmur</span>
              </div>
              {currentTrack === 'rain' && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
            </button>

            <button
              onClick={() => handleTrackSelect('fireplace')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition ${
                currentTrack === 'fireplace'
                  ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Şömine Çatırtısı</span>
              </div>
              {currentTrack === 'fireplace' && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
            </button>

            <button
              onClick={() => handleTrackSelect('library')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition ${
                currentTrack === 'library'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Book className="w-4 h-4 text-emerald-400" />
                <span>Sessiz Salon Uğultusu</span>
              </div>
              {currentTrack === 'library' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            </button>
          </div>

          {/* Volume Slider */}
          {currentTrack !== 'off' && (
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 w-6 text-right font-mono">
                {Math.round(volume * 100)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
