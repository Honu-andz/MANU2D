/**
 * Obstacle and Collectible Canvas Renderer
 * Distinct visual styles for:
 * 1. Wooden Crate / Haystack (Wood smash sound)
 * 2. Granite Boulder (Rock crash sound)
 * 3. Spiked Iron Bramble (Metallic clang sound)
 */

import { Collectible, Obstacle } from '../../types/game';

export function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle, time = 0) {
  if (obs.hit) return; // Disintegrated into particles on hit

  ctx.save();
  ctx.translate(obs.x, obs.y);

  if (obs.type === 'camp_fire') {
    drawCampfire(ctx, obs.width, obs.height, time);
  } else if (obs.type === 'fire_ball') {
    drawFireball(ctx, obs.width, obs.height, time);
  } else if (obs.type === 'wood_crate') {
    drawWoodCrate(ctx, obs.width, obs.height);
  } else if (obs.type === 'granite_rock') {
    drawGraniteBoulder(ctx, obs.width, obs.height);
  } else {
    drawSpikedBramble(ctx, obs.width, obs.height);
  }

  ctx.restore();
}

/**
 * CAMPFIRE:
 * Burning criss-crossed logs with glowing embers, animated multi-tier dancing flames,
 * floating sparks, and radiant ground glow.
 */
function drawCampfire(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const cx = w / 2;
  const baseLogY = h - 6;

  // 1. Fiery ground illumination glow
  const groundGlow = ctx.createRadialGradient(cx, baseLogY, 2, cx, baseLogY, w * 0.85);
  groundGlow.addColorStop(0, 'rgba(251, 146, 60, 0.6)');
  groundGlow.addColorStop(0.5, 'rgba(234, 88, 12, 0.25)');
  groundGlow.addColorStop(1, 'rgba(234, 88, 12, 0)');
  ctx.fillStyle = groundGlow;
  ctx.beginPath();
  ctx.ellipse(cx, baseLogY + 4, w * 0.85, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Charred ground / coal bed
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.ellipse(cx, baseLogY, w * 0.45, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hot glowing coal core underneath
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.ellipse(cx, baseLogY - 2, w * 0.28, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. Wooden logs (criss-cross teepee campfire formation)
  ctx.save();
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';

  // Left angled log
  ctx.beginPath();
  ctx.moveTo(cx - 16, baseLogY + 2);
  ctx.lineTo(cx + 8, baseLogY - 14);
  ctx.stroke();

  // Right angled log
  ctx.beginPath();
  ctx.moveTo(cx + 16, baseLogY + 2);
  ctx.lineTo(cx - 8, baseLogY - 14);
  ctx.stroke();

  // Bottom support log
  ctx.strokeStyle = '#291407';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx - 18, baseLogY);
  ctx.lineTo(cx + 18, baseLogY);
  ctx.stroke();
  ctx.restore();

  // 4. Multi-tier animated flickering flames
  const fTime = time * 8;
  const flame1 = Math.sin(fTime) * 3;
  const flame2 = Math.cos(fTime * 1.3) * 3.5;
  const flame3 = Math.sin(fTime * 1.7) * 4;

  // Outer Crimson Flame Tongue
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(cx - 16, baseLogY - 2);
  ctx.quadraticCurveTo(cx - 18 + flame1, baseLogY - h * 0.55, cx + flame2 * 0.5, 2);
  ctx.quadraticCurveTo(cx + 18 + flame3, baseLogY - h * 0.55, cx + 16, baseLogY - 2);
  ctx.closePath();
  ctx.fill();

  // Mid Radiant Orange Flame Tongue
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.moveTo(cx - 11, baseLogY - 4);
  ctx.quadraticCurveTo(cx - 12 + flame2, baseLogY - h * 0.45, cx + flame1 * 0.4, 7);
  ctx.quadraticCurveTo(cx + 12 + flame1, baseLogY - h * 0.45, cx + 11, baseLogY - 4);
  ctx.closePath();
  ctx.fill();

  // Inner Intense Golden Yellow Flame Tongue
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.moveTo(cx - 7, baseLogY - 5);
  ctx.quadraticCurveTo(cx - 6 + flame3, baseLogY - h * 0.35, cx + flame2 * 0.3, 14);
  ctx.quadraticCurveTo(cx + 6 + flame2, baseLogY - h * 0.35, cx + 7, baseLogY - 5);
  ctx.closePath();
  ctx.fill();

  // Pure White Hot Fire Core
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cx + flame1 * 0.2, baseLogY - 8, 4, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // 5. Rising hot embers and sparks
  for (let i = 0; i < 4; i++) {
    const sparkX = cx + Math.sin(fTime + i * 2) * (10 + i * 2);
    const sparkY = baseLogY - 18 - ((fTime * 6 + i * 16) % 32);
    ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#f97316';
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * FIREBALL:
 * Blazing rolling/flying fiery sphere hurtling along with trailing flame tails,
 * radiant corona, and molten core.
 */
function drawFireball(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) * 0.36;
  const fTime = time * 10;

  // 1. Fiery Glow Halo
  const halo = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius * 2.1);
  halo.addColorStop(0, 'rgba(251, 146, 60, 0.7)');
  halo.addColorStop(0.4, 'rgba(239, 68, 68, 0.35)');
  halo.addColorStop(1, 'rgba(239, 68, 68, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 2.1, 0, Math.PI * 2);
  ctx.fill();

  // 2. Trailing Flame Tails (stretching right/behind the rolling ball)
  const tailCount = 4;
  for (let i = 0; i < tailCount; i++) {
    const tailYOffset = (i - 1.5) * (radius * 0.45);
    const wave = Math.sin(fTime + i * 2.5) * 4;
    const tailLength = radius * 1.5 + Math.cos(fTime * 0.8 + i) * 6;

    ctx.fillStyle = i % 2 === 0 ? '#dc2626' : '#ea580c';
    ctx.beginPath();
    ctx.moveTo(cx, cy + tailYOffset - 4);
    ctx.quadraticCurveTo(cx + tailLength * 0.6, cy + tailYOffset + wave, cx + tailLength, cy + tailYOffset);
    ctx.quadraticCurveTo(cx + tailLength * 0.6, cy + tailYOffset + 4 + wave, cx, cy + tailYOffset + 4);
    ctx.closePath();
    ctx.fill();
  }

  // 3. Outer Red Corona
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // 4. Vibrant Orange Layer
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.arc(cx - 2, cy, radius * 0.8, 0, Math.PI * 2);
  ctx.fill();

  // 5. Bright Yellow Middle Core
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(cx - 3, cy, radius * 0.55, 0, Math.PI * 2);
  ctx.fill();

  // 6. Blazing White Center Heat
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - 4, cy, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // 7. Swirling Sparks spinning off the fireball
  for (let s = 0; s < 5; s++) {
    const angle = fTime * 1.8 + (s * Math.PI * 2) / 5;
    const dist = radius * 1.25 + Math.sin(fTime + s) * 4;
    const sx = cx + Math.cos(angle) * dist;
    const sy = cy + Math.sin(angle) * dist;
    ctx.fillStyle = s % 2 === 0 ? '#fef08a' : '#fb923c';
    ctx.beginPath();
    ctx.arc(sx, sy, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * 1. WOODEN CRATE / TIMBER BALE
 */
function drawWoodCrate(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Shadow
  ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
  ctx.beginPath();
  ctx.ellipse(w / 2, h, w * 0.55, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Outer Crate Box
  ctx.fillStyle = '#b45309'; // Rich warm timber
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 4);
  ctx.fill();

  // Inner inset panel
  ctx.fillStyle = '#92400e';
  ctx.fillRect(4, 4, w - 8, h - 8);

  // Planks
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;
  const plankH = (h - 8) / 3;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(4, 4 + i * plankH);
    ctx.lineTo(w - 4, 4 + i * plankH);
    ctx.stroke();
  }

  // Diagonal Wooden Brace
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(6, 6);
  ctx.lineTo(w - 6, h - 6);
  ctx.stroke();

  // Corner Metal Brackets & Rivets
  ctx.fillStyle = '#475569';
  const bSize = 6;
  ctx.fillRect(0, 0, bSize, bSize);
  ctx.fillRect(w - bSize, 0, bSize, bSize);
  ctx.fillRect(0, h - bSize, bSize, bSize);
  ctx.fillRect(w - bSize, h - bSize, bSize, bSize);

  // Rivets (golden yellow dots)
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(2, 2, 2, 2);
  ctx.fillRect(w - 4, 2, 2, 2);
  ctx.fillRect(2, h - 4, 2, 2);
  ctx.fillRect(w - 4, h - 4, 2, 2);

  // Stray Golden Straw sticking out from top
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.3, 0);
  ctx.lineTo(w * 0.25, -6);
  ctx.moveTo(w * 0.6, 0);
  ctx.lineTo(w * 0.65, -8);
  ctx.moveTo(w * 0.7, 0);
  ctx.lineTo(w * 0.78, -5);
  ctx.stroke();
}

/**
 * 2. GRANITE BOULDER / ANCIENT ROCK
 */
function drawGraniteBoulder(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Shadow
  ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
  ctx.beginPath();
  ctx.ellipse(w / 2, h + 2, w * 0.58, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark Base Silhouette
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(4, h);
  ctx.lineTo(w * 0.15, h * 0.45);
  ctx.lineTo(w * 0.4, 3);
  ctx.lineTo(w * 0.75, 6);
  ctx.lineTo(w - 4, h * 0.5);
  ctx.lineTo(w - 2, h);
  ctx.closePath();
  ctx.fill();

  // Mid-tone Facet
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(w * 0.15, h * 0.45);
  ctx.lineTo(w * 0.4, 3);
  ctx.lineTo(w * 0.55, h * 0.55);
  ctx.lineTo(w * 0.2, h * 0.85);
  ctx.closePath();
  ctx.fill();

  // Light Sunlit Facet
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(w * 0.4, 3);
  ctx.lineTo(w * 0.75, 6);
  ctx.lineTo(w * 0.55, h * 0.55);
  ctx.closePath();
  ctx.fill();

  // Jagged Crack Lines
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(w * 0.45, 12);
  ctx.lineTo(w * 0.42, 22);
  ctx.lineTo(w * 0.48, 30);
  ctx.stroke();

  // Green Moss on top
  ctx.fillStyle = '#65a30d';
  ctx.beginPath();
  ctx.arc(w * 0.4, 5, 4, 0, Math.PI * 2);
  ctx.arc(w * 0.65, 8, 5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 3. SPIKED IRON BRAMBLE / FENCE TRAP
 */
function drawSpikedBramble(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Shadow
  ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
  ctx.beginPath();
  ctx.ellipse(w / 2, h + 1, w * 0.55, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tangled thorn bush background
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(w * 0.25, h * 0.65, w * 0.26, 0, Math.PI * 2);
  ctx.arc(w * 0.5, h * 0.5, w * 0.32, 0, Math.PI * 2);
  ctx.arc(w * 0.75, h * 0.65, w * 0.26, 0, Math.PI * 2);
  ctx.fill();

  // Dark thorny brambles
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(4, h - 2);
  ctx.quadraticCurveTo(w * 0.3, h * 0.2, w - 4, h * 0.5);
  ctx.moveTo(w - 4, h - 2);
  ctx.quadraticCurveTo(w * 0.7, h * 0.2, 4, h * 0.5);
  ctx.stroke();

  // Sharp Iron Spikes (3 upward-pointing steel stakes)
  const spikeXs = [w * 0.25, w * 0.5, w * 0.75];
  spikeXs.forEach((sx, idx) => {
    const spikeH = idx === 1 ? h * 0.95 : h * 0.8;
    const topY = h - spikeH;

    // Spike base
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(sx - 4, h);
    ctx.lineTo(sx, topY);
    ctx.lineTo(sx + 4, h);
    ctx.closePath();
    ctx.fill();

    // Sharp Highlight edge
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(sx, topY);
    ctx.lineTo(sx + 3, h - 2);
    ctx.stroke();

    // Red warning tip / rust
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(sx, topY + 2, 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * 4. LUCKY CLOVER COLLECTIBLE
 */
export function drawCollectible(
  ctx: CanvasRenderingContext2D,
  item: Collectible,
  time: number
) {
  if (item.collected) return;

  const floatY = Math.sin(time * 5 + item.id) * 4;
  const cx = item.x;
  const cy = item.y + floatY;

  ctx.save();
  ctx.translate(cx, cy);

  if (item.type === 'gold_coin') {
    // 3D spinning coin effect (classic Jantar Mantar Run / arcade collectible)
    const spinWidth = Math.abs(Math.cos(time * 6 + item.id)) * 13 + 3;
    // Golden Glow
    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
    glow.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
    glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    // Outer coin gold rim
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(0, 0, spinWidth, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright gold face
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(0, 0, spinWidth * 0.78, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Embossed center star / sparkle
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(0, 0, spinWidth * 0.35, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return;
  }

  // Gentle glow halo
  const glow = ctx.createRadialGradient(0, 0, 3, 0, 0, 16);
  glow.addColorStop(0, 'rgba(74, 222, 128, 0.45)');
  glow.addColorStop(1, 'rgba(74, 222, 128, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();

  // Four-leaf clover leaves
  ctx.fillStyle = '#22c55e';
  const leafOffsets = [
    { x: 0, y: -5 },
    { x: 5, y: 0 },
    { x: 0, y: 5 },
    { x: -5, y: 0 },
  ];

  leafOffsets.forEach(leaf => {
    ctx.beginPath();
    ctx.arc(leaf.x, leaf.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Center Stem
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.quadraticCurveTo(3, 8, 4, 11);
  ctx.stroke();

  // Golden sparkle highlight in center
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
