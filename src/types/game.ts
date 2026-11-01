/**
 * Game Types and Configurations
 */

export type ObstacleType = 'camp_fire' | 'fire_ball' | 'wood_crate' | 'granite_rock' | 'spiked_bush';

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  hit: boolean;
  scoreAwarded?: boolean;
}

export interface Collectible {
  id: number;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  type: 'clover' | 'milk_jug' | 'gold_coin';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape?: 'circle' | 'square' | 'splinter' | 'flame' | 'smoke';
  rotation?: number;
  vRot?: number;
}

export type AnimalType = 'holstein_cow' | 'jersey_cow' | 'water_buffalo' | 'zebu_cow' | 'desi_calf';

export interface BgAnimal {
  x: number; // 0 to 1 relative position in parallax loop or absolute world X
  layer: 'distant_hill' | 'mid_pasture';
  type: AnimalType;
  state: 'grazing' | 'resting' | 'chewing';
  facingLeft: boolean;
  scale: number;
  yOffset: number;
  animTimer: number;
}

export interface CharacterSkin {
  id: string;
  name: string;
  category: 'preset' | 'custom';
  description: string;
  primaryColor: string; // shirt/body
  secondaryColor: string; // pants/legs
  hairColor: string;
  accentColor: string; // scarf/hat/visor
  skinTone: string;
  style: 'runner' | 'cowboy' | 'cyber' | 'pixel' | 'onesie' | 'ninja' | 'custom_image' | 'spritesheet';
  customImageUrl?: string;
  spritesheetUrl?: string;
  frameCount?: number;
  jumpImageUrl?: string;
  customPixelMatrix?: string[][]; // 16x16 grid of hex colors
}

export type SoundEffectType = 
  | 'jump' 
  | 'hit_wood' 
  | 'hit_stone' 
  | 'hit_spike' 
  | 'hit_fire'
  | 'clover_pickup' 
  | 'game_over' 
  | 'high_score'
  | 'moo_ambient';

export interface SoundPresetOption {
  id: string;
  label: string;
  description: string;
}

export interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  ambienceEnabled: boolean;
  ambienceVolume: number;
  
  // Custom sound presets
  jumpSound: string; // 'boing' | 'pip8bit' | 'swoop' | 'spring' | 'laser'
  jumpPitch: number; // 0.5 to 2.0
  
  hitWoodSound: string; // 'splinter' | 'timber' | 'hollow' | 'bonk'
  hitWoodPitch: number;
  
  hitStoneSound: string; // 'granite' | 'seismic' | 'rumble' | 'shatter'
  hitStonePitch: number;
  
  hitSpikeSound: string; // 'clang' | 'razor_twang' | 'anvil' | 'electric'
  hitSpikePitch: number;

  hitFireSound: string; // 'flame_whoosh' | 'sizzle_burn' | 'fire_burst' | 'blazing_crackle'
  hitFirePitch: number;

  // User uploaded custom sound effects (Base64 audio data URLs)
  customJumpAudio?: string;
  customHitAudio?: string;
  customGameOverAudio?: string;
}

export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'HIT_FREEZE' | 'GAME_OVER';

export interface GameStats {
  score: number;
  distanceMeters: number;
  cloversCollected: number;
  obstaclesDodged: number;
  highScore: number;
  causeOfDeath?: ObstacleType | null;
}
