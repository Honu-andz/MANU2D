/**
 * Sound Effects Studio & Audio Customizer Modal
 * Allows players to customize hit sounds for each obstacle type,
 * jump sound, background pasture ambience, and test everything in real-time.
 */

import React, { useState } from 'react';
import { Volume2, VolumeX, RotateCcw, X, Play, Music, Sparkles } from 'lucide-react';
import { soundEngine } from '../../audio/soundEngine';
import { AudioSettings } from '../../types/game';

interface SoundStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundStudioModal: React.FC<SoundStudioModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AudioSettings>(() => soundEngine.getSettings());
  const [activeTest, setActiveTest] = useState<string | null>(null);

  if (!isOpen) return null;

  const updateSetting = <K extends keyof AudioSettings>(key: K, value: AudioSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    soundEngine.updateSettings({ [key]: value });
  };

  const handleTestSound = (type: string, fn: () => void) => {
    setActiveTest(type);
    fn();
    setTimeout(() => setActiveTest(null), 300);
  };

  const handleReset = () => {
    soundEngine.resetSettings();
    setSettings(soundEngine.getSettings());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-display">Sound Studio</h2>
              <p className="text-xs text-slate-400">Tune and customize hit sounds for each obstacle and jump</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          
          {/* Master & Ambience Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Master Volume</label>
                <span className="text-xs font-mono text-slate-400">{Math.round(settings.masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={(e) => updateSetting('masterVolume', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Sound Effects Volume</label>
                <span className="text-xs font-mono text-slate-400">{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => updateSetting('sfxVolume', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="md:col-span-2 pt-2 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateSetting('ambienceEnabled', !settings.ambienceEnabled)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    settings.ambienceEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {settings.ambienceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>{settings.ambienceEnabled ? 'Pasture Herd Ambience ON' : 'Pasture Herd Ambience OFF'}</span>
                </button>
                <span className="text-xs text-slate-400">Gentle distant cows & buffaloes calling in the background</span>
              </div>
              <button
                type="button"
                onClick={() => handleTestSound('moo', () => soundEngine.playMooSound(1.0))}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <Play className="w-3 h-3 text-amber-400" />
                <span>Test Moo</span>
              </button>
            </div>
          </div>

          {/* User Custom Audio Uploads Section */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 rounded-xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-slate-100 text-sm">Upload Your Custom Sound Effects</h3>
              </div>
              <span className="text-[11px] text-amber-300 font-medium">MP3, WAV, OGG, M4A</span>
            </div>
            <p className="text-xs text-slate-300">
              Provide your own custom audio recordings or sounds for jumping, hitting fire obstacles, and game over:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Custom Jump Sound */}
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-700 space-y-2">
                <span className="text-xs font-semibold text-slate-200 block">Custom Jump Audio</span>
                {settings.customJumpAudio ? (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-emerald-400 font-mono block">✓ Custom Audio Loaded</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTestSound('custom_jump', () => soundEngine.playJump())}
                        className="flex-1 py-1 px-2 text-[11px] bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 rounded flex items-center justify-center gap-1 font-medium"
                      >
                        <Play className="w-2.5 h-2.5" />
                        <span>Play</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSetting('customJumpAudio', undefined)}
                        className="py-1 px-2 text-[11px] text-rose-400 hover:text-rose-300 font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-xs font-medium cursor-pointer transition-colors">
                    <Music className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload Jump Audio</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => updateSetting('customJumpAudio', ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Custom Obstacle Hit Sound */}
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-700 space-y-2">
                <span className="text-xs font-semibold text-slate-200 block">Custom Obstacle Hit</span>
                {settings.customHitAudio ? (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-emerald-400 font-mono block">✓ Custom Audio Loaded</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTestSound('custom_hit', () => soundEngine.playObstacleHit('camp_fire'))}
                        className="flex-1 py-1 px-2 text-[11px] bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 rounded flex items-center justify-center gap-1 font-medium"
                      >
                        <Play className="w-2.5 h-2.5" />
                        <span>Play</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSetting('customHitAudio', undefined)}
                        className="py-1 px-2 text-[11px] text-rose-400 hover:text-rose-300 font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-xs font-medium cursor-pointer transition-colors">
                    <Music className="w-3.5 h-3.5 text-orange-400" />
                    <span>Upload Hit Audio</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => updateSetting('customHitAudio', ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Custom Game Over Audio */}
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-700 space-y-2">
                <span className="text-xs font-semibold text-slate-200 block">Custom Game Over</span>
                {settings.customGameOverAudio ? (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-emerald-400 font-mono block">✓ Custom Audio Loaded</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTestSound('custom_gameover', () => soundEngine.playGameOver())}
                        className="flex-1 py-1 px-2 text-[11px] bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 rounded flex items-center justify-center gap-1 font-medium"
                      >
                        <Play className="w-2.5 h-2.5" />
                        <span>Play</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSetting('customGameOverAudio', undefined)}
                        className="py-1 px-2 text-[11px] text-rose-400 hover:text-rose-300 font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-xs font-medium cursor-pointer transition-colors">
                    <Music className="w-3.5 h-3.5 text-rose-400" />
                    <span>Upload Game Over</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => updateSetting('customGameOverAudio', ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Section: Obstacle Hit Sound (Campfire & Fireball) */}
          <div className="p-4 bg-slate-800/30 rounded-xl border border-orange-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 bg-orange-500 rounded-sm" />
                <span className="font-semibold text-slate-200 text-sm">Obstacle: Campfire & Fireball Hit Audio</span>
              </div>
              <button
                type="button"
                onClick={() => handleTestSound('fire', () => soundEngine.playHitFire())}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  activeTest === 'fire'
                    ? 'bg-orange-500 text-slate-950 scale-95'
                    : 'bg-orange-600/20 text-orange-300 hover:bg-orange-600/30 border border-orange-500/30'
                }`}
              >
                <Play className="w-3 h-3" />
                <span>Test Hit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Sound Profile</label>
                <select
                  value={settings.hitFireSound || 'flame_whoosh'}
                  onChange={(e) => updateSetting('hitFireSound', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
                >
                  <option value="flame_whoosh">Flame Whoosh & Roar (Default)</option>
                  <option value="sizzle_burn">Hot Sizzling Burn</option>
                  <option value="fire_burst">Deep Explosive Fireball</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-400">Pitch Tuning</label>
                  <span className="text-xs font-mono text-slate-400">{(settings.hitFirePitch || 1.0).toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.05"
                  value={settings.hitFirePitch || 1.0}
                  onChange={(e) => updateSetting('hitFirePitch', parseFloat(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Obstacle 2 (Granite Boulder / Stone) */}
          <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 bg-slate-400 rounded-sm" />
                <span className="font-semibold text-slate-200 text-sm">Obstacle 2: Granite Rock Hit Sound</span>
              </div>
              <button
                type="button"
                onClick={() => handleTestSound('stone', () => soundEngine.playHitStone())}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  activeTest === 'stone'
                    ? 'bg-slate-300 text-slate-950 scale-95'
                    : 'bg-slate-700/50 text-slate-200 hover:bg-slate-700 border border-slate-600'
                }`}
              >
                <Play className="w-3 h-3" />
                <span>Test Hit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Sound Profile</label>
                <select
                  value={settings.hitStoneSound}
                  onChange={(e) => updateSetting('hitStoneSound', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-400"
                >
                  <option value="granite">Heavy Granite Smash (Default)</option>
                  <option value="seismic">Deep Seismic Bass Thud</option>
                  <option value="shatter">Sharp Stone Shatter</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-400">Pitch Tuning</label>
                  <span className="text-xs font-mono text-slate-400">{settings.hitStonePitch.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.05"
                  value={settings.hitStonePitch}
                  onChange={(e) => updateSetting('hitStonePitch', parseFloat(e.target.value))}
                  className="w-full accent-slate-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Obstacle 3 (Spiked Bramble / Iron Barrier) */}
          <div className="p-4 bg-slate-800/30 rounded-xl border border-rose-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 bg-rose-500 rounded-sm" />
                <span className="font-semibold text-slate-200 text-sm">Obstacle 3: Spiked Barrier Hit Sound</span>
              </div>
              <button
                type="button"
                onClick={() => handleTestSound('spike', () => soundEngine.playHitSpike())}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  activeTest === 'spike'
                    ? 'bg-rose-500 text-slate-950 scale-95'
                    : 'bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30'
                }`}
              >
                <Play className="w-3 h-3" />
                <span>Test Hit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Sound Profile</label>
                <select
                  value={settings.hitSpikeSound}
                  onChange={(e) => updateSetting('hitSpikeSound', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="clang">Sharp Metallic Clang (Default)</option>
                  <option value="razor_twang">Barbed Wire Twang</option>
                  <option value="anvil">Iron Anvil Strike</option>
                  <option value="electric">Electric Fence Buzz</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-400">Pitch Tuning</label>
                  <span className="text-xs font-mono text-slate-400">{settings.hitSpikePitch.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.05"
                  value={settings.hitSpikePitch}
                  onChange={(e) => updateSetting('hitSpikePitch', parseFloat(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Jump Sound */}
          <div className="p-4 bg-slate-800/30 rounded-xl border border-sky-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 bg-sky-400 rounded-sm" />
                <span className="font-semibold text-slate-200 text-sm">Character Jump Sound</span>
              </div>
              <button
                type="button"
                onClick={() => handleTestSound('jump', () => soundEngine.playJump())}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  activeTest === 'jump'
                    ? 'bg-sky-400 text-slate-950 scale-95'
                    : 'bg-sky-600/20 text-sky-300 hover:bg-sky-600/30 border border-sky-500/30'
                }`}
              >
                <Play className="w-3 h-3" />
                <span>Test Jump</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Sound Profile</label>
                <select
                  value={settings.jumpSound}
                  onChange={(e) => updateSetting('jumpSound', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                >
                  <option value="boing">Elastic Boing (Default)</option>
                  <option value="pip8bit">Retro 8-Bit Pip</option>
                  <option value="swoop">Wind Swoosh</option>
                  <option value="spring">Wobbly Spring</option>
                  <option value="laser">Laser Hop</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-400">Pitch Tuning</label>
                  <span className="text-xs font-mono text-slate-400">{settings.jumpPitch.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.05"
                  value={settings.jumpPitch}
                  onChange={(e) => updateSetting('jumpPitch', parseFloat(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sound Defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
