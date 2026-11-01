/**
 * Core 2D Endless Runner Game Canvas Engine
 * High-performance 60fps requestAnimationFrame loop,
 * Parallax scenery strictly populated with cows and water buffaloes,
 * Obstacle dodging with jumping/ducking, and distinct hit audio.
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { soundEngine } from '../../audio/soundEngine';
import {
  CharacterSkin,
  Collectible,
  GameState,
  GameStats,
  Obstacle,
  ObstacleType,
} from '../../types/game';
import { drawCharacter } from './CharacterRenderer';
import { drawCollectible, drawObstacle } from './ObstacleRenderer';
import { ParallaxScenery } from './ParallaxScenery';
import { ParticleSystem } from './ParticleSystem';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  activeSkin: CharacterSkin;
  stats: GameStats;
  setStats: React.Dispatch<React.SetStateAction<GameStats>>;
  onOpenSoundStudio: () => void;
  onOpenCharacterStudio: () => void;
}

// Zoomed camera coordinates (680x340 zooms camera closer on character, obstacles, and pasture animals)
const V_WIDTH = 680;
const V_HEIGHT = 340;
const GROUND_Y = 270;

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  setGameState,
  activeSkin,
  stats,
  setStats,
  onOpenSoundStudio,
  onOpenCharacterStudio,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Crash freeze timestamp (screen pauses for 5 seconds on hit before restart is allowed)
  const hitPauseUntilRef = useRef<number>(0);
  // Track continuous running time for 2-second initial obstacle grace period
  const runTimeRef = useRef<number>(0);
  // Tracks if the initial post-grace obstacle has spawned
  const firstObstacleSpawnedRef = useRef<boolean>(false);

  // Game internal state held in refs to prevent closure stales inside requestAnimationFrame
  const playerRef = useRef({
    x: 110,
    y: GROUND_Y - 58,
    width: 44,
    height: 58,
    vy: 0,
    isGrounded: true,
    isDucking: false,
    jumpCount: 0,
    maxJumps: 2, // Allows double jump for extra fun maneuvering!
    runCycle: 0,
    rotation: 0,
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);
  const nextObstacleDistanceRef = useRef(0);
  const scrollDistanceRef = useRef(0);
  const baseSpeedRef = useRef(6.2);
  const currentSpeedRef = useRef(6.2);

  const particlesRef = useRef(new ParticleSystem());
  const sceneryRef = useRef(new ParallaxScenery(V_WIDTH, V_HEIGHT, GROUND_Y));

  // Audio Ambience
  useEffect(() => {
    if (gameState === 'PLAYING') {
      soundEngine.startAmbience();
    } else {
      soundEngine.stopAmbience();
    }
    return () => soundEngine.stopAmbience();
  }, [gameState]);

  // Jump action
  const handleJump = useCallback(() => {
    if (gameState === 'TITLE') {
      setGameState('PLAYING');
      return;
    }
    if (gameState !== 'PLAYING') return;

    const p = playerRef.current;
    if (p.jumpCount < p.maxJumps) {
      p.vy = p.jumpCount === 0 ? -12.6 : -10.5;
      p.isGrounded = false;
      p.jumpCount++;
      soundEngine.playJump();
      particlesRef.current.addJumpPuff(p.x + p.width / 2, p.y + p.height);
    }
  }, [gameState, setGameState]);

  // Duck action
  const setDucking = useCallback((ducking: boolean) => {
    if (gameState !== 'PLAYING') return;
    const p = playerRef.current;
    p.isDucking = ducking;
    if (ducking && !p.isGrounded) {
      // Fast drop when in air
      p.vy += 5;
    }
  }, [gameState]);

  // Reset Game - Enforces 5-second collision pause!
  const resetGame = useCallback(() => {
    if (gameState === 'HIT_FREEZE' || Date.now() < hitPauseUntilRef.current) {
      // Collision pause active - restart blocked for at least 5 seconds
      return;
    }
    soundEngine.stopCrashMusic();
    runTimeRef.current = 0;
    firstObstacleSpawnedRef.current = false;

    playerRef.current = {
      x: 110,
      y: GROUND_Y - 58,
      width: 44,
      height: 58,
      vy: 0,
      isGrounded: true,
      isDucking: false,
      jumpCount: 0,
      maxJumps: 2,
      runCycle: 0,
      rotation: 0,
    };
    obstaclesRef.current = [];
    collectiblesRef.current = [];
    nextObstacleDistanceRef.current = 0;
    scrollDistanceRef.current = 0;
    baseSpeedRef.current = 6.2;
    currentSpeedRef.current = 6.2;
    particlesRef.current.clear();

    setStats((prev) => ({
      ...prev,
      score: 0,
      distanceMeters: 0,
      cloversCollected: 0,
      obstaclesDodged: 0,
      causeOfDeath: null,
    }));
    setGameState('PLAYING');
  }, [gameState, setGameState, setStats]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (gameState === 'TITLE' || gameState === 'GAME_OVER') {
          resetGame();
        } else if (gameState === 'PLAYING') {
          handleJump();
        }
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        setDucking(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        setDucking(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, handleJump, setDucking, resetGame]);

  // Spawn obstacles: Campfire & Fireball
  const spawnObstacle = (distance: number) => {
    const types: ObstacleType[] = ['camp_fire', 'fire_ball'];
    const chosenType = types[Math.floor(Math.random() * types.length)];

    let width = 46;
    let height = 42;

    if (chosenType === 'camp_fire') {
      width = 46;
      height = 42;
    } else {
      // Rolling fiery fireball
      width = 44;
      height = 42;
    }

    const obs: Obstacle = {
      id: Date.now() + Math.random(),
      x: V_WIDTH + 24, // Spawns just past right edge so it glides smoothly onto the screen
      y: GROUND_Y - height,
      width,
      height,
      type: chosenType,
      hit: false,
    };
    obstaclesRef.current.push(obs);

    // Spawning collectibles (Gold Coins & Lucky Clovers)
    if (Math.random() > 0.35) {
      const isCoin = Math.random() > 0.4;
      const collectY = GROUND_Y - (height + 24 + Math.random() * 34);
      collectiblesRef.current.push({
        id: Date.now() + Math.random(),
        x: V_WIDTH + 24 + width / 2,
        y: collectY,
        radius: 13,
        collected: false,
        type: isCoin ? 'gold_coin' : 'clover',
      });
    }

    // Dynamic distance to next obstacle
    const minGap = Math.max(260, 390 - (distance / 110));
    const randomGap = Math.random() * 180;
    nextObstacleDistanceRef.current = minGap + randomGap;
  };

  // Main Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // --- UPDATE LOGIC (When PLAYING) ---
          if (gameState === 'PLAYING') {
            // Track running time for 2-second grace period
            runTimeRef.current += dt;

            const speed = currentSpeedRef.current;
            scrollDistanceRef.current += speed;

            // Speed progression
            currentSpeedRef.current = baseSpeedRef.current + Math.min(scrollDistanceRef.current / 2800, 4.5);

            // Update stats
            const currentDist = Math.floor(scrollDistanceRef.current / 16);
            setStats((prev) => {
              const newScore = prev.score + Math.round(speed * 0.4);
              const newHigh = Math.max(prev.highScore, newScore);
              if (newHigh > prev.highScore) {
                try {
                  localStorage.setItem('pasture_runner_highscore_v1', newHigh.toString());
                } catch {
                  // ignore
                }
              }
              return {
                ...prev,
                score: newScore,
                distanceMeters: currentDist,
                highScore: newHigh,
              };
            });

            // Player physics
            const p = playerRef.current;
            const gravity = 0.65;
            p.vy += gravity;
            p.y += p.vy;

            // Ground collision
            const targetGroundY = GROUND_Y - p.height;
            if (p.y >= targetGroundY) {
              p.y = targetGroundY;
              p.vy = 0;
              p.isGrounded = true;
              p.jumpCount = 0;
            } else {
              p.isGrounded = false;
            }

            // Running cycle & footstep dust
            if (p.isGrounded) {
              p.runCycle = (p.runCycle + dt * speed * 1.5) % 1;
              particlesRef.current.addRunningDust(p.x, GROUND_Y);
            }

            // 2-second initial grace period: NO OBSTACLES in the first 2 seconds!
            if (runTimeRef.current >= 2.0) {
              if (!firstObstacleSpawnedRef.current) {
                firstObstacleSpawnedRef.current = true;
                spawnObstacle(scrollDistanceRef.current);
              } else {
                nextObstacleDistanceRef.current -= speed;
                if (nextObstacleDistanceRef.current <= 0) {
                  spawnObstacle(scrollDistanceRef.current);
                }
              }
            } else {
              obstaclesRef.current = [];
            }

            // Move obstacles & collision check
            const playerBox = {
              x: p.x + 8,
              y: p.isDucking ? p.y + 24 : p.y + 6,
              w: p.width - 16,
              h: p.isDucking ? p.height - 24 : p.height - 10,
            };

            for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
              const obs = obstaclesRef.current[i];
              obs.x -= speed;

              // Check if dodged safely
              if (!obs.scoreAwarded && obs.x + obs.width < p.x) {
                obs.scoreAwarded = true;
                setStats((prev) => ({
                  ...prev,
                  score: prev.score + 50,
                  obstaclesDodged: prev.obstaclesDodged + 1,
                }));
              }

              // Collision detection (AABB)
              const obsBox = {
                x: obs.x + 4,
                y: obs.y + 4,
                w: obs.width - 8,
                h: obs.height - 4,
              };

              const isColliding =
                playerBox.x < obsBox.x + obsBox.w &&
                playerBox.x + playerBox.w > obsBox.x &&
                playerBox.y < obsBox.y + obsBox.h &&
                playerBox.y + playerBox.h > obsBox.y;

              if (isColliding && !obs.hit) {
                obs.hit = true;

                // Lock restart for at least 5 seconds!
                hitPauseUntilRef.current = Date.now() + 5000;

                // 1. Play distinct sound effect for this obstacle type!
                soundEngine.playObstacleHit(obs.type);

                // 2. Play 5-second crash freeze music in the meantime!
                soundEngine.playCrashMusic();

                // 3. Spawn distinct physical particle burst!
                const centerX = obs.x + obs.width / 2;
                const centerY = obs.y + obs.height / 2;
                particlesRef.current.addFireDebris(centerX, centerY);

                // 4. Freeze screen on impact for 5 seconds
                setStats((prev) => ({
                  ...prev,
                  causeOfDeath: obs.type,
                }));
                setGameState('HIT_FREEZE');
                break;
              }

              // Remove out of screen
              if (obs.x < -100) {
                obstaclesRef.current.splice(i, 1);
              }
            }

            // Move collectibles & pickup check
            for (let i = collectiblesRef.current.length - 1; i >= 0; i--) {
              const item = collectiblesRef.current[i];
              item.x -= speed;

              // Distance to player center
              const pCenter = { x: p.x + p.width / 2, y: p.y + p.height / 2 };
              const dx = pCenter.x - item.x;
              const dy = pCenter.y - item.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 32 && !item.collected) {
                item.collected = true;
                soundEngine.playCloverPickup();
                particlesRef.current.addCloverSparkles(item.x, item.y);
                setStats((prev) => ({
                  ...prev,
                  score: prev.score + 100,
                  cloversCollected: prev.cloversCollected + 1,
                }));
                collectiblesRef.current.splice(i, 1);
              } else if (item.x < -60) {
                collectiblesRef.current.splice(i, 1);
              }
            }

            // Update scenery and particles
            sceneryRef.current.update(speed, dt);
            particlesRef.current.update(dt);
          }

          // Check if 5-second impact freeze has completed
          if (gameState === 'HIT_FREEZE') {
            if (Date.now() >= hitPauseUntilRef.current) {
              setGameState('GAME_OVER');
            }
          }

          // --- RENDERING ---
          ctx.save();
          ctx.setTransform(canvas.width / V_WIDTH, 0, 0, canvas.height / V_HEIGHT, 0, 0);
          ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

          // 1. Scenery (multi-layer parallax strictly with cows & buffaloes)
          sceneryRef.current.render(ctx, scrollDistanceRef.current);

          // 2. Obstacles (animated flames & fireball spinning)
          obstaclesRef.current.forEach((obs) => {
            drawObstacle(ctx, obs, time / 1000);
          });

          // 3. Collectibles
          collectiblesRef.current.forEach((item) => {
            drawCollectible(ctx, item, time / 1000);
          });

          // 4. Particles
          particlesRef.current.render(ctx);

          // 5. Character
          const p = playerRef.current;
          drawCharacter({
            ctx,
            x: p.x,
            y: p.y,
            width: p.width,
            height: p.height,
            skin: activeSkin,
            isGrounded: p.isGrounded,
            isDucking: p.isDucking,
            runCycle: p.runCycle,
            vy: p.vy,
            isDead: gameState === 'HIT_FREEZE' || gameState === 'GAME_OVER',
          });

          // 6. Grace period indicator for first 2 seconds (No Obstacles)
          if (gameState === 'PLAYING' && runTimeRef.current < 2.0) {
            const remGrace = Math.max(0, 2.0 - runTimeRef.current);
            ctx.save();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.beginPath();
            ctx.roundRect(V_WIDTH / 2 - 145, 14, 290, 30, 15);
            ctx.fill();
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = '#34d399';
            ctx.font = 'bold 12px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`✨ 2s HEAD START — CLEAR TRACK (${remGrace.toFixed(1)}s)`, V_WIDTH / 2, 29);
            ctx.restore();
          }

          // 7. Collision Impact Freeze Screen (5-second freeze with music playing)
          if (gameState === 'HIT_FREEZE') {
            const elapsedMs = Math.max(0, 5000 - (hitPauseUntilRef.current - Date.now()));
            const remSec = Math.max(0, (hitPauseUntilRef.current - Date.now()) / 1000);
            const progressRatio = Math.min(1, Math.max(0, elapsedMs / 5000));

            ctx.save();
            // Cinematic radial vignette
            const grad = ctx.createRadialGradient(V_WIDTH / 2, V_HEIGHT / 2, 60, V_WIDTH / 2, V_HEIGHT / 2, V_WIDTH / 1.4);
            grad.addColorStop(0, 'rgba(239, 68, 68, 0.15)');
            grad.addColorStop(0.7, 'rgba(15, 23, 42, 0.65)');
            grad.addColorStop(1, 'rgba(15, 23, 42, 0.90)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

            // Freeze Frame Center Panel
            const bannerW = 320;
            const bannerH = 74;
            const bannerX = V_WIDTH / 2 - bannerW / 2;
            const bannerY = 18;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
            ctx.beginPath();
            ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 16);
            ctx.fill();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Impact title
            ctx.fillStyle = '#fef08a';
            ctx.font = 'bold 14px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(`💥 SCREEN FROZEN: ${remSec.toFixed(1)}s`, V_WIDTH / 2, bannerY + 11);

            // Music note and subtitle
            ctx.fillStyle = '#94a3b8';
            ctx.font = '11px system-ui, sans-serif';
            ctx.fillText(`🎵 Music Playing · Restart unlocks in ${Math.ceil(remSec)}s`, V_WIDTH / 2, bannerY + 31);

            // 5-second progress bar
            const barW = bannerW - 40;
            const barH = 6;
            const barX = bannerX + 20;
            const barY = bannerY + 52;

            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.roundRect(barX, barY, barW, barH, 3);
            ctx.fill();

            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.roundRect(barX, barY, barW * progressRatio, barH, 3);
            ctx.fill();

            ctx.restore();
          }

          // 8. Title Screen Overlay (when in TITLE state)
          if (gameState === 'TITLE') {
            drawTitleOverlay(ctx, V_WIDTH, V_HEIGHT);
          }

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, activeSkin, setGameState, setStats]);

  // Handle Canvas Scaling for Crisp Hi-DPI
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden bg-slate-950">
      {/* Canvas Viewport */}
      <div 
        className="relative w-full max-w-[1280px] aspect-[2/1] max-h-[85vh] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl cursor-pointer"
        onClick={() => {
          if (gameState === 'TITLE' || gameState === 'GAME_OVER') {
            resetGame();
          } else if (gameState === 'PLAYING') {
            handleJump();
          }
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          if (gameState === 'TITLE' || gameState === 'GAME_OVER') {
            resetGame();
          } else if (gameState === 'PLAYING') {
            handleJump();
          }
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Title Play Button CTA */}
        {gameState === 'TITLE' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] p-6 text-center z-10">
            <div className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                  Pastoral 2D Endless Runner
                </span>
                <h1 className="text-4xl sm:text-5xl font-black text-white font-display drop-shadow-md">
                  Pasture Sprint
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Leap over blazing campfires and rolling fireballs through lush meadows populated with grazing cows and water buffaloes!
                </p>
              </div>

              {/* Campfire & Fireball Obstacles Preview Card */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-900/80 rounded-xl border border-slate-700/70 text-left text-[11px]">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <span className="font-bold text-amber-300 block">1. Blazing Campfire</span>
                  <span className="text-slate-400 text-[10px]">Flame sizzle & burning coals</span>
                </div>
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <span className="font-bold text-rose-300 block">2. Roaring Fireball</span>
                  <span className="text-slate-400 text-[10px]">Fiery whoosh & flame burst</span>
                </div>
              </div>

              {/* Start Button & Shortcuts */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetGame();
                  }}
                  className="w-full sm:w-auto px-7 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-105 active:scale-95"
                >
                  Start Running (Space / Click)
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCharacterStudio();
                    }}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Character Skin
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenSoundStudio();
                    }}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Audio Studio
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile / Touch Action Controls */}
        {gameState === 'PLAYING' && (
          <div className="absolute bottom-4 right-4 flex items-center gap-3 z-20 pointer-events-auto">
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                setDucking(true);
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                setDucking(false);
              }}
              className="w-14 h-14 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 backdrop-blur-md shadow-lg flex items-center justify-center font-bold text-xs active:scale-90"
            >
              DUCK
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleJump();
              }}
              className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-2 border-emerald-300 backdrop-blur-md shadow-xl flex items-center justify-center font-black text-sm active:scale-90"
            >
              JUMP
            </button>
          </div>
        )}
      </div>

      {/* Helpful keyboard hints footer below canvas */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono text-[11px]">Space</kbd>
          <span>/</span>
          <kbd className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono text-[11px]">↑</kbd>
          <span>Jump (Double Jump allowed!)</span>
        </div>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono text-[11px]">↓</kbd>
          <span>Duck / Fast Drop</span>
        </div>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span>Tap anywhere to jump</span>
      </div>
    </div>
  );
};

function drawTitleOverlay(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Title glow effect
}
