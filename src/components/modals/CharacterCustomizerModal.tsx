/**
 * Character Texture & Skin Customizer Modal
 * Choose from presets, adjust color palettes, or upload your own custom texture image.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Palette, Upload, Sparkles, X, Check, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { CharacterSkin } from '../../types/game';
import { DEFAULT_SKINS } from '../../data/defaultSkins';
import { drawCharacter } from '../game/CharacterRenderer';

interface CharacterCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSkin: CharacterSkin;
  onSelectSkin: (skin: CharacterSkin) => void;
}

export const CharacterCustomizerModal: React.FC<CharacterCustomizerModalProps> = ({
  isOpen,
  onClose,
  activeSkin,
  onSelectSkin,
}) => {
  const [tab, setTab] = useState<'presets' | 'palette' | 'upload'>('presets');
  const [currentSkin, setCurrentSkin] = useState<CharacterSkin>(activeSkin);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setCurrentSkin(activeSkin);
  }, [activeSkin, isOpen]);

  // Live animated preview in the modal
  useEffect(() => {
    if (!isOpen) return;

    let startTime = performance.now();
    const renderPreview = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const now = performance.now();
      const elapsed = (now - startTime) / 1000;
      const runCycle = (elapsed * 2.8) % 1;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Mini pasture background
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#7bb8f7');
      grad.addColorStop(0.65, '#c3e2fd');
      grad.addColorStop(0.66, '#4da459');
      grad.addColorStop(1, '#2c7035');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Little grass blades
      ctx.fillStyle = '#65be72';
      for (let x = 0; x < canvas.width; x += 8) {
        ctx.fillRect(x, canvas.height * 0.66 - 2, 2, 3);
      }

      // Draw character centered on ground
      const groundY = canvas.height * 0.66;
      drawCharacter({
        ctx,
        x: canvas.width / 2 - 20,
        y: groundY - 56,
        width: 40,
        height: 56,
        skin: currentSkin,
        isGrounded: true,
        isDucking: false,
        runCycle,
        vy: 0,
      });

      animFrameRef.current = requestAnimationFrame(renderPreview);
    };

    animFrameRef.current = requestAnimationFrame(renderPreview);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isOpen, currentSkin]);

  if (!isOpen) return null;

  const handlePresetSelect = (skin: CharacterSkin) => {
    setCurrentSkin(skin);
    onSelectSkin(skin);
  };

  const handleColorChange = (key: keyof CharacterSkin, value: string) => {
    const updated: CharacterSkin = {
      ...currentSkin,
      [key]: value,
      category: 'custom',
    };
    setCurrentSkin(updated);
    onSelectSkin(updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const updated: CharacterSkin = {
        ...currentSkin,
        id: 'custom_texture_' + Date.now(),
        name: 'Custom Texture Skin',
        category: 'custom',
        style: 'custom_image',
        customImageUrl: dataUrl,
      };
      setCurrentSkin(updated);
      onSelectSkin(updated);
    };
    reader.readAsDataURL(file);
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
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-display">Character Studio</h2>
              <p className="text-xs text-slate-400">Customize runner outfit, textures, and appearances</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Box & Tabs Bar */}
        <div className="p-6 pb-2 border-b border-slate-800/80 flex flex-col sm:flex-row items-center gap-6 bg-slate-950/40">
          <div className="relative rounded-xl overflow-hidden border border-slate-700/60 shadow-inner shrink-0">
            <canvas ref={canvasRef} width={180} height={120} className="block" />
            <span className="absolute bottom-1 right-2 text-[10px] font-mono text-white/80 bg-black/40 px-1.5 py-0.5 rounded">
              Live Preview
            </span>
          </div>

          <div className="flex-1 w-full space-y-2">
            <div className="flex items-baseline justify-between">
              <h3 className="font-semibold text-slate-200 text-sm">{currentSkin.name}</h3>
              <span className="text-xs text-slate-400 capitalize">{currentSkin.style.replace('_', ' ')}</span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">{currentSkin.description || 'Custom customized athlete'}</p>

            {/* Segmented Tab Controls */}
            <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-lg text-xs font-medium w-full mt-3">
              <button
                type="button"
                onClick={() => setTab('presets')}
                className={`flex-1 py-1.5 px-3 rounded-md transition-colors text-center ${
                  tab === 'presets' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Preset Skins
              </button>
              <button
                type="button"
                onClick={() => setTab('palette')}
                className={`flex-1 py-1.5 px-3 rounded-md transition-colors text-center ${
                  tab === 'palette' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Color Palette
              </button>
              <button
                type="button"
                onClick={() => setTab('upload')}
                className={`flex-1 py-1.5 px-3 rounded-md transition-colors text-center ${
                  tab === 'upload' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Custom Texture
              </button>
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-4 max-h-80 text-sm">
          {tab === 'presets' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEFAULT_SKINS.map((skin) => {
                const isSelected = currentSkin.id === skin.id;
                return (
                  <button
                    key={skin.id}
                    type="button"
                    onClick={() => handlePresetSelect(skin)}
                    className={`flex items-start gap-3 p-3 text-left rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500 text-slate-100 ring-1 ring-emerald-500/50'
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex flex-col gap-1 items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-700 shrink-0">
                      <div className="flex gap-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: skin.primaryColor }} />
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: skin.accentColor }} />
                      </div>
                      <div className="flex gap-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: skin.secondaryColor }} />
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: skin.hairColor }} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white truncate">{skin.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{skin.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {tab === 'palette' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Personalize the individual colors of your runner’s clothes, hair, skin, and flowing scarf:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Primary Outfit</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentSkin.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="w-8 h-8 rounded border border-slate-600 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-400">{currentSkin.primaryColor}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Pants / Legs</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentSkin.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="w-8 h-8 rounded border border-slate-600 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-400">{currentSkin.secondaryColor}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Hair / Cap</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentSkin.hairColor}
                      onChange={(e) => handleColorChange('hairColor', e.target.value)}
                      className="w-8 h-8 rounded border border-slate-600 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-400">{currentSkin.hairColor}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Scarf / Hat / Visor</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentSkin.accentColor}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      className="w-8 h-8 rounded border border-slate-600 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-400">{currentSkin.accentColor}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Skin Tone</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentSkin.skinTone}
                      onChange={(e) => handleColorChange('skinTone', e.target.value)}
                      className="w-8 h-8 rounded border border-slate-600 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-400">{currentSkin.skinTone}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 flex flex-col justify-center">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Outfit Style</label>
                  <select
                    value={currentSkin.style === 'custom_image' ? 'runner' : currentSkin.style}
                    onChange={(e) => handleColorChange('style', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                  >
                    <option value="runner">Athletic Runner</option>
                    <option value="cowboy">Pasture Cowboy</option>
                    <option value="cyber">Cyber Visor</option>
                    <option value="onesie">Cow Onesie</option>
                    <option value="ninja">Shinobi</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {tab === 'upload' && (
            <div className="space-y-4">
              <div className="p-6 border-2 border-dashed border-slate-700 hover:border-emerald-500/70 rounded-xl text-center bg-slate-800/30 transition-colors">
                <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="font-semibold text-slate-200 text-sm mb-1">Upload Running Sprite or Spritesheet</h4>
                <p className="text-xs text-slate-400 mb-4">
                  Select a single character image, an animated running strip (4, 6, or 8 frames), or custom texture.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg cursor-pointer transition-colors shadow">
                    <ImageIcon className="w-4 h-4" />
                    <span>Upload Running Sprite</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  <label className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg cursor-pointer border border-slate-700 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Optional Jump Sprite</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const dataUrl = ev.target?.result as string;
                          const updated: CharacterSkin = {
                            ...currentSkin,
                            jumpImageUrl: dataUrl,
                          };
                          setCurrentSkin(updated);
                          onSelectSkin(updated);
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Active Texture Controls */}
              {currentSkin.style === 'custom_image' && currentSkin.customImageUrl && (
                <div className="p-4 bg-slate-800/50 rounded-xl border border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentSkin.customImageUrl}
                        alt="Uploaded character"
                        className="w-12 h-12 object-contain rounded-md bg-slate-950 p-1 border border-slate-700"
                      />
                      <div>
                        <span className="text-xs font-semibold text-emerald-400 block">Custom Texture Active</span>
                        <span className="text-[11px] text-slate-400">
                          {currentSkin.frameCount && currentSkin.frameCount > 1
                            ? `${currentSkin.frameCount}-Frame Running Spritesheet Strip`
                            : 'Single Texture Sprite'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePresetSelect(DEFAULT_SKINS[0])}
                      className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Frame count selector for running spritesheets */}
                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-medium">Spritesheet Frames:</span>
                    <div className="flex items-center gap-1.5">
                      {[1, 4, 5, 6, 8].map((fc) => (
                        <button
                          key={fc}
                          type="button"
                          onClick={() => {
                            const updated: CharacterSkin = {
                              ...currentSkin,
                              frameCount: fc,
                            };
                            setCurrentSkin(updated);
                            onSelectSkin(updated);
                          }}
                          className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-md border transition-colors ${
                            (currentSkin.frameCount || 1) === fc
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          {fc === 1 ? 'Single (1)' : `${fc} Frames`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {currentSkin.jumpImageUrl && (
                    <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                      <span className="flex items-center gap-1 text-amber-400">
                        <span>✓</span> Jump Sprite Loaded
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...currentSkin };
                          delete updated.jumpImageUrl;
                          setCurrentSkin(updated);
                          onSelectSkin(updated);
                        }}
                        className="text-[11px] text-slate-400 hover:text-rose-300"
                      >
                        Clear Jump Sprite
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            type="button"
            onClick={() => handlePresetSelect(DEFAULT_SKINS[0])}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Default Sprinter</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors"
          >
            Apply & Play
          </button>
        </div>
      </div>
    </div>
  );
};
