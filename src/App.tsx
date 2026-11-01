/**
 * Pasture Sprint: 2D Endless Runner
 * Dodges obstacles by jumping, distinct hit audio for 3 obstacle types,
 * background scenery strictly populated by cows and water buffaloes with parallax,
 * and complete character texture + sound effects customization studio.
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Palette, Music, Play, Sparkles, Shield, Trophy } from 'lucide-react';
import { GameCanvas } from './components/game/GameCanvas';
import { GameHUD } from './components/ui/GameHUD';
import { GameOverModal } from './components/ui/GameOverModal';
import { SoundStudioModal } from './components/modals/SoundStudioModal';
import { CharacterCustomizerModal } from './components/modals/CharacterCustomizerModal';
import { CharacterSkin, GameState, GameStats } from './types/game';
import { DEFAULT_SKINS } from './data/defaultSkins';
import { soundEngine } from './audio/soundEngine';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Modals state
  const [isSoundStudioOpen, setIsSoundStudioOpen] = useState(false);
  const [isCharacterStudioOpen, setIsCharacterStudioOpen] = useState(false);

  // Active character skin (Defaults to Desi Runner from Godot screenshot)
  const [activeSkin, setActiveSkin] = useState<CharacterSkin>(() => {
    try {
      const saved = localStorage.getItem('pasture_runner_skin_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_SKINS[0];
  });

  // Game stats
  const [stats, setStats] = useState<GameStats>(() => {
    let highScore = 0;
    try {
      const savedHigh = localStorage.getItem('pasture_runner_highscore_v1');
      if (savedHigh) highScore = parseInt(savedHigh, 10) || 0;
    } catch {
      // ignore
    }
    return {
      score: 0,
      distanceMeters: 0,
      cloversCollected: 0,
      obstaclesDodged: 0,
      highScore,
      causeOfDeath: null,
    };
  });

  // Save skin on change
  const handleSelectSkin = (skin: CharacterSkin) => {
    setActiveSkin(skin);
    try {
      localStorage.setItem('pasture_runner_skin_v2', JSON.stringify(skin));
    } catch {
      // ignore
    }
  };

  // Sound mute toggle
  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    soundEngine.updateSettings({
      masterVolume: newMuted ? 0 : 0.8,
    });
  };

  // Pause toggle
  const handleTogglePause = () => {
    if (gameState === 'PLAYING') {
      setGameState('PAUSED');
      setIsPaused(true);
    } else if (gameState === 'PAUSED') {
      setGameState('PLAYING');
      setIsPaused(false);
    }
  };

  const handleRestart = () => {
    soundEngine.stopCrashMusic();
    setStats((prev) => ({
      ...prev,
      score: 0,
      distanceMeters: 0,
      cloversCollected: 0,
      obstaclesDodged: 0,
      causeOfDeath: null,
    }));
    setGameState('PLAYING');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* --- TOP BAR (Mandatory 3-Zone Top Bar Contract) --- */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
        {/* Zone 1: Brand title wordmark */}
        <a href="/" className="text-lg font-black tracking-tight text-slate-100 font-display whitespace-nowrap shrink-0 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Pasture Sprint</span>
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-400">
          <button 
            type="button"
            onClick={() => setIsCharacterStudioOpen(true)}
            className="hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0"
          >
            Character Skins
          </button>
          <button 
            type="button"
            onClick={() => setIsSoundStudioOpen(true)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            Sound Studio
          </button>
          <a href="#obstacles-section" className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0">
            Obstacles & Audio
          </a>
          <a href="#pasture-section" className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0">
            Pasture Wildlife
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (gameState !== 'PLAYING') {
                handleRestart();
              }
            }}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
          >
            {gameState === 'PLAYING' ? 'Running...' : 'Play Game'}
          </button>
        </div>
      </header>

      {/* --- MAIN GAME ARENA --- */}
      <main className="flex-1 flex flex-col items-center justify-start p-3 sm:p-6 w-full max-w-7xl mx-auto">
        
        {/* Game Container Card with Canvas & HUD */}
        <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
          {/* Heads-up display */}
          <GameHUD
            stats={stats}
            isPlaying={gameState === 'PLAYING'}
            isPaused={isPaused}
            onTogglePause={handleTogglePause}
            onOpenSoundStudio={() => setIsSoundStudioOpen(true)}
            onOpenCharacterStudio={() => setIsCharacterStudioOpen(true)}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />

          {/* Interactive Game Canvas Engine */}
          <GameCanvas
            gameState={gameState}
            setGameState={setGameState}
            activeSkin={activeSkin}
            stats={stats}
            setStats={setStats}
            onOpenSoundStudio={() => setIsSoundStudioOpen(true)}
            onOpenCharacterStudio={() => setIsCharacterStudioOpen(true)}
          />

          {/* Game Over Modal */}
          <GameOverModal
            isOpen={gameState === 'GAME_OVER'}
            stats={stats}
            onRestart={handleRestart}
            onOpenCharacterStudio={() => setIsCharacterStudioOpen(true)}
            onOpenSoundStudio={() => setIsSoundStudioOpen(true)}
          />
        </div>

        {/* --- DETAIL SECTIONS (Pasture Ecology, Obstacle Sound Profiles & Studio) --- */}
        <div className="w-full mt-10 space-y-12">
          
          {/* Section: Obstacles & Audio Physics */}
          <section id="obstacles-section" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-100 font-display">Obstacles & Sound Mechanics</h2>
                <p className="text-xs text-slate-400">
                  Each obstacle is forged with distinct material audio synthesized through the Web Audio API.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSoundStudioOpen(true)}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 self-start sm:self-auto"
              >
                <Music className="w-3.5 h-3.5" />
                <span>Open Audio Studio</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Obstacle 1: Campfire */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 transition-colors space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">
                    🔥 1
                  </div>
                  <span className="text-[11px] font-mono text-amber-400">Ground Fire Hazard</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">Blazing Campfire</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Crisscrossed timber logs with glowing coal bed and multi-tier animated flames with rising spark embers. Clear with a steady jump.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Audio Profile:</span>
                  <button
                    type="button"
                    onClick={() => soundEngine.playHitFire()}
                    className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
                  >
                    <Play className="w-3 h-3" />
                    <span>Flame Sizzle & Crackle</span>
                  </button>
                </div>
              </div>

              {/* Obstacle 2: Fireball */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/50 transition-colors space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold text-xs">
                    ☄️ 2
                  </div>
                  <span className="text-[11px] font-mono text-rose-400">Fiery Projectile</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">Roaring Fireball</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    A spinning molten fireball with flaming trailing tails, glowing heat corona, and white-hot center. Requires sharp jump timing.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Audio Profile:</span>
                  <button
                    type="button"
                    onClick={() => soundEngine.playHitFire()}
                    className="flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300"
                  >
                    <Play className="w-3 h-3" />
                    <span>Fiery Burst Whoosh</span>
                  </button>
                </div>
              </div>

              {/* Custom Audio Feature */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition-colors space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    🎵 3
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">Custom Audio Studio</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">Upload Custom Sounds</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Upload your own custom MP3, WAV, or OGG audio files for Jump, Hit, and Game Over sounds, or synthesize customized tones.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Custom Studio:</span>
                  <button
                    type="button"
                    onClick={() => setIsSoundStudioOpen(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Upload Audio</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Pasture Wildlife (Cows & Buffaloes Only) */}
          <section id="pasture-section" className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-xl font-bold text-slate-100 font-display">Pasture Wildlife (Background Only)</h2>
              <p className="text-xs text-slate-400">
                In accordance with game guidelines, the pastoral backdrop is populated strictly and exclusively with cows and water buffaloes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-200 text-sm">Holstein Dairy Cow</h3>
                  <span className="text-[11px] text-emerald-400">Black & White</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Classic spotted dairy cow with pink muzzle, floppy ears, golden bell collar, and gentle tail swishing.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-200 text-sm">Jersey Fawn Cow</h3>
                  <span className="text-[11px] text-amber-400">Caramel Fawn</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Warm caramel brown pasture cow with sweet expressive eyes, cream underbelly, and peaceful grazing behavior.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-200 text-sm">Asian Water Buffalo</h3>
                  <span className="text-[11px] text-sky-400">Charcoal Slate</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Majestic dark buffalo with broad muscular shoulders, sweeping curved horns, and calm posture in the rolling hills.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="w-full border-t border-slate-800/80 py-6 px-6 mt-12 bg-slate-950 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Pasture Sprint</span>
            <span aria-hidden="true">·</span>
            <span>2D Endless Runner</span>
            <span aria-hidden="true">·</span>
            <span>Synthesized Web Audio</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => setIsCharacterStudioOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Character Customizer
            </button>
            <button
              type="button"
              onClick={() => setIsSoundStudioOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Sound Effects Studio
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SoundStudioModal
        isOpen={isSoundStudioOpen}
        onClose={() => setIsSoundStudioOpen(false)}
      />

      <CharacterCustomizerModal
        isOpen={isCharacterStudioOpen}
        onClose={() => setIsCharacterStudioOpen(false)}
        activeSkin={activeSkin}
        onSelectSkin={handleSelectSkin}
      />
    </div>
  );
}
