/**
 * In-Game Arcade Heads-Up Display (HUD)
 * Unboxed metadata, high legibility, accessible touch/click controls.
 */

import React from 'react';
import { Pause, Play, Volume2, VolumeX, Palette, Music, Trophy } from 'lucide-react';
import { GameStats } from '../../types/game';

interface GameHUDProps {
  stats: GameStats;
  isPlaying: boolean;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenSoundStudio: () => void;
  onOpenCharacterStudio: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  isPlaying,
  isPaused,
  onTogglePause,
  onOpenSoundStudio,
  onOpenCharacterStudio,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 md:p-6 pointer-events-none flex items-start justify-between z-20">
      {/* Left: Score & Distance Card */}
      <div className="pointer-events-auto flex items-center gap-4 bg-slate-950/70 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/60 shadow-lg text-slate-100">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Score</span>
          <span className="text-xl md:text-2xl font-black font-display text-amber-400 tabular-nums">
            {stats.score.toLocaleString()}
          </span>
        </div>

        <div className="h-8 w-px bg-slate-700/60" />

        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Distance</span>
          <span className="text-sm md:text-base font-bold font-mono text-emerald-400 tabular-nums">
            {stats.distanceMeters} m
          </span>
        </div>

        <div className="h-8 w-px bg-slate-700/60" />

        <div className="hidden sm:block">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Coins</span>
          <span className="text-sm md:text-base font-bold font-mono text-amber-300 tabular-nums flex items-center gap-1">
            <span>🪙</span> {stats.cloversCollected}
          </span>
        </div>

        {stats.highScore > 0 && (
          <>
            <div className="h-8 w-px bg-slate-700/60 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-300 font-medium">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono tabular-nums">{stats.highScore}</span>
            </div>
          </>
        )}
      </div>

      {/* Right: Quick Action Controls */}
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenCharacterStudio}
          title="Customize Character Texture & Colors"
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/70 rounded-xl backdrop-blur-md shadow-md text-xs font-semibold transition-all hover:scale-105 active:scale-95"
        >
          <Palette className="w-4 h-4 text-emerald-400" />
          <span className="hidden md:inline">Character</span>
        </button>

        <button
          type="button"
          onClick={onOpenSoundStudio}
          title="Customize Obstacle Hit Sounds & Jump"
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/70 rounded-xl backdrop-blur-md shadow-md text-xs font-semibold transition-all hover:scale-105 active:scale-95"
        >
          <Music className="w-4 h-4 text-amber-400" />
          <span className="hidden md:inline">Sounds</span>
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/70 rounded-xl backdrop-blur-md shadow-md transition-all hover:scale-105 active:scale-95"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {isPlaying && (
          <button
            type="button"
            onClick={onTogglePause}
            title={isPaused ? 'Resume Game' : 'Pause Game'}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/70 rounded-xl backdrop-blur-md shadow-md transition-all hover:scale-105 active:scale-95"
          >
            {isPaused ? <Play className="w-4 h-4 text-amber-400 fill-amber-400" /> : <Pause className="w-4 h-4 text-slate-200" />}
          </button>
        )}
      </div>
    </div>
  );
};
