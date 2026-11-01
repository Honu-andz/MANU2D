/**
 * Game Over Modal
 * Displays score summary, collision analysis with specific obstacle hit sound details,
 * and quick restart or customization options.
 */

import React, { useState, useEffect } from 'react';
import { RotateCcw, Award, Flame, Palette, Music, Timer } from 'lucide-react';
import { GameStats, ObstacleType } from '../../types/game';

interface GameOverModalProps {
  isOpen: boolean;
  stats: GameStats;
  onRestart: () => void;
  onOpenCharacterStudio: () => void;
  onOpenSoundStudio: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  stats,
  onRestart,
  onOpenCharacterStudio,
  onOpenSoundStudio,
}) => {
  // Allow immediate restart via keyboard when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyR') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onRestart]);

  if (!isOpen) return null;

  const isNewRecord = stats.score > 0 && stats.score >= stats.highScore;

  const getObstacleDetails = (type?: ObstacleType | null) => {
    switch (type) {
      case 'camp_fire':
        return {
          title: 'Campfire Collision',
          desc: 'Hit a blazing campfire! Played the flame crackle and sizzle sound.',
          color: 'text-amber-400',
          border: 'border-amber-500/40',
          bg: 'bg-amber-500/10',
          icon: Flame,
        };
      case 'fire_ball':
        return {
          title: 'Fireball Collision',
          desc: 'Struck by a roaring fireball! Played the blazing whoosh & explosion sound.',
          color: 'text-rose-400',
          border: 'border-rose-500/40',
          bg: 'bg-rose-500/10',
          icon: Flame,
        };
      case 'wood_crate':
        return {
          title: 'Wooden Crate Collision',
          desc: 'Hit a stacked timber crate! Played the splintering wood crash sound.',
          color: 'text-amber-400',
          border: 'border-amber-500/30',
          bg: 'bg-amber-500/10',
          icon: Flame,
        };
      case 'granite_rock':
        return {
          title: 'Granite Boulder Collision',
          desc: 'Crashed into ancient solid rock! Played the heavy stone smash audio.',
          color: 'text-slate-300',
          border: 'border-slate-500/30',
          bg: 'bg-slate-500/10',
          icon: Flame,
        };
      case 'spiked_bush':
        return {
          title: 'Spiked Barrier Collision',
          desc: 'Caught on iron thorny bramble! Played the sharp metallic clang.',
          color: 'text-rose-400',
          border: 'border-rose-500/30',
          bg: 'bg-rose-500/10',
          icon: Flame,
        };
      default:
        return {
          title: 'Obstacle Impact',
          desc: 'Stumbled along the pasture trail.',
          color: 'text-amber-400',
          border: 'border-amber-500/30',
          bg: 'bg-amber-500/10',
          icon: Flame,
        };
    }
  };

  const collisionInfo = getObstacleDetails(stats.causeOfDeath);
  const CollisionIcon = collisionInfo.icon;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-center p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Badge & Title */}
        <div className="space-y-1">
          {isNewRecord ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold mb-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>NEW HIGH SCORE!</span>
            </div>
          ) : (
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block">
              Round Complete
            </span>
          )}
          <h2 className="text-3xl font-black text-slate-100 font-display">Sprint Ended</h2>
        </div>

        {/* Big Score Box */}
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Final Score</span>
          <div className="text-4xl sm:text-5xl font-black font-display text-amber-400 tabular-nums">
            {stats.score.toLocaleString()}
          </div>
        </div>

        {/* Collision Cause & Sound Card */}
        <div className={`p-3.5 rounded-xl border text-left flex items-start gap-3 ${collisionInfo.bg} ${collisionInfo.border}`}>
          <div className="p-2 rounded-lg bg-black/30 shrink-0">
            <CollisionIcon className={`w-4 h-4 ${collisionInfo.color}`} />
          </div>
          <div className="flex-1 text-xs">
            <span className={`font-bold block ${collisionInfo.color}`}>{collisionInfo.title}</span>
            <span className="text-slate-300 mt-0.5 block leading-relaxed">{collisionInfo.desc}</span>
          </div>
        </div>

        {/* Ready to Sprint Notice */}
        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-center gap-1.5 font-medium">
          <span>✨ 5-second impact freeze finished · Ready to sprint!</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-center">
          <div>
            <span className="text-[10px] uppercase text-slate-400 block font-semibold">Distance</span>
            <span className="text-sm font-bold text-emerald-400 font-mono tabular-nums">{stats.distanceMeters} m</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 block font-semibold">Dodged</span>
            <span className="text-sm font-bold text-sky-400 font-mono tabular-nums">{stats.obstaclesDodged}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 block font-semibold">Coins</span>
            <span className="text-sm font-bold text-amber-300 font-mono tabular-nums">🪙 {stats.cloversCollected}</span>
          </div>
        </div>

        {/* Primary CTA: Start Again Button (Immediately Ready!) */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={onRestart}
            className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-base shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 animate-bounce-short"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Start Again (Space / Tap)</span>
          </button>

          {/* Quick Customization Row */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenCharacterStudio}
              className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              <span>Change Skin</span>
            </button>

            <button
              type="button"
              onClick={onOpenSoundStudio}
              className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Music className="w-3.5 h-3.5 text-amber-400" />
              <span>Custom Audio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
