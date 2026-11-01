/**
 * Authentic Cow & Buffalo Canvas Renderer
 * Exclusively renders cows (Holstein & Jersey) and water buffaloes
 * with detailed vector silhouettes, horns, patches, and animated idle movements.
 */

import { AnimalType } from '../../types/game';

interface DrawAnimalParams {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  type: AnimalType;
  scale?: number;
  facingLeft?: boolean;
  state?: 'grazing' | 'resting' | 'chewing';
  animTime?: number;
  alpha?: number;
}

export function drawPastureAnimal({
  ctx,
  x,
  y,
  type,
  scale = 1.0,
  facingLeft = true,
  state = 'grazing',
  animTime = 0,
  alpha = 1.0,
}: DrawAnimalParams) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);

  // Flip horizontally if facing right
  if (!facingLeft) {
    ctx.scale(-1, 1);
  }
  ctx.scale(scale, scale);

  // Animation cycle math
  const chewOffset = Math.sin(animTime * 4) * (state === 'chewing' || state === 'grazing' ? 2 : 0.5);
  const tailSwish = Math.sin(animTime * 3) * 0.25;
  const earTwitch = Math.sin(animTime * 2) > 0.8 ? Math.sin(animTime * 15) * 3 : 0;
  const isResting = state === 'resting';

  if (type === 'water_buffalo') {
    drawWaterBuffalo(ctx, chewOffset, tailSwish, earTwitch, isResting);
  } else if (type === 'zebu_cow') {
    drawZebuCow(ctx, chewOffset, tailSwish, earTwitch, isResting);
  } else if (type === 'desi_calf') {
    drawDesiCalf(ctx, chewOffset, tailSwish, earTwitch, isResting);
  } else if (type === 'jersey_cow') {
    drawJerseyCow(ctx, chewOffset, tailSwish, earTwitch, isResting);
  } else {
    drawHolsteinCow(ctx, chewOffset, tailSwish, earTwitch, isResting);
  }

  ctx.restore();
}

/**
 * Water Buffalo:
 * Dark slate grey body, heavy muscular neck, distinct wide sweeping curved horns,
 * tough hooves, calm posture.
 */
function drawWaterBuffalo(
  ctx: CanvasRenderingContext2D,
  chew: number,
  tailAngle: number,
  earAngle: number,
  isResting: boolean
) {
  // Ground shadow
  ctx.fillStyle = 'rgba(15, 30, 20, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, isResting ? 8 : 12, isResting ? 48 : 42, isResting ? 12 : 9, 0, 0, Math.PI * 2);
  ctx.fill();

  const buffaloDark = '#2c333a';
  const buffaloMid = '#3b444c';
  const buffaloHighlight = '#4c5761';
  const hornColor = '#d6cbba';
  const hornTip = '#403831';

  // Tail (attached to rear at x = 32, y = -14)
  ctx.save();
  ctx.translate(32, -14);
  ctx.rotate(0.2 + tailAngle);
  ctx.strokeStyle = buffaloDark;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(8, 14, 4, 24);
  ctx.stroke();
  // Tail tuft
  ctx.fillStyle = '#1c2227';
  ctx.beginPath();
  ctx.ellipse(4, 25, 4, 7, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Back legs (if not resting)
  if (!isResting) {
    ctx.fillStyle = '#22282e';
    // Back left leg
    ctx.fillRect(20, -5, 8, 16);
    // Front left leg
    ctx.fillRect(-22, -5, 9, 16);
    // Dark hooves
    ctx.fillStyle = '#15191c';
    ctx.fillRect(20, 9, 9, 3);
    ctx.fillRect(-22, 9, 10, 3);
  }

  // Main Body (Broad, heavy torso)
  ctx.fillStyle = buffaloMid;
  ctx.beginPath();
  if (isResting) {
    ctx.roundRect(-35, -20, 68, 28, [18, 14, 8, 10]);
  } else {
    ctx.roundRect(-34, -26, 68, 28, [18, 14, 10, 10]);
  }
  ctx.fill();

  // Muscular hump / shoulder contour
  ctx.fillStyle = buffaloHighlight;
  ctx.beginPath();
  ctx.ellipse(-14, isResting ? -16 : -22, 16, 8, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Front legs (right side)
  if (!isResting) {
    ctx.fillStyle = buffaloDark;
    // Front right leg
    ctx.fillRect(-14, -6, 9, 18);
    // Back right leg
    ctx.fillRect(28, -6, 8, 18);
    // Hooves
    ctx.fillStyle = '#15191c';
    ctx.fillRect(-14, 10, 10, 3);
    ctx.fillRect(28, 10, 9, 3);
  }

  // Neck & Head group
  ctx.save();
  ctx.translate(-30, isResting ? -10 : -16);

  // Heavy neck
  ctx.fillStyle = buffaloDark;
  ctx.beginPath();
  ctx.moveTo(12, 16);
  ctx.lineTo(-8, 12);
  ctx.lineTo(-12, -4);
  ctx.lineTo(8, -8);
  ctx.closePath();
  ctx.fill();

  // Head
  const headY = chew;
  ctx.fillStyle = buffaloMid;
  ctx.beginPath();
  ctx.roundRect(-24, -10 + headY, 24, 20, [8, 6, 8, 10]);
  ctx.fill();

  // Muzzle
  ctx.fillStyle = '#22282e';
  ctx.beginPath();
  ctx.roundRect(-28, -2 + headY, 12, 12, [4, 4, 6, 6]);
  ctx.fill();

  // Nostril
  ctx.fillStyle = '#101316';
  ctx.beginPath();
  ctx.arc(-24, 3 + headY, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Calm Dark Eye
  ctx.fillStyle = '#0f1214';
  ctx.beginPath();
  ctx.ellipse(-14, -3 + headY, 2.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-14.5, -3.5 + headY, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Ear
  ctx.save();
  ctx.translate(-7, -5 + headY);
  ctx.rotate(0.3 + (earAngle * Math.PI) / 180);
  ctx.fillStyle = buffaloDark;
  ctx.beginPath();
  ctx.ellipse(0, 0, 8, 4, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Magnificent Curved Horns (swept back and curved outwards/up)
  // Far Horn
  ctx.strokeStyle = hornTip;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-10, -8 + headY);
  ctx.bezierCurveTo(-4, -20 + headY, 14, -22 + headY, 12, -12 + headY);
  ctx.stroke();

  // Near Horn
  ctx.strokeStyle = hornColor;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-13, -7 + headY);
  ctx.bezierCurveTo(-8, -24 + headY, 18, -26 + headY, 16, -10 + headY);
  ctx.stroke();

  // Horn tip dark accent
  ctx.strokeStyle = hornTip;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(11, -22 + headY);
  ctx.lineTo(16, -10 + headY);
  ctx.stroke();

  ctx.restore(); // end head
}

/**
 * Holstein Cow:
 * Classic Black and White spotted dairy cow with gentle pink muzzle,
 * floppy ears, sweet bell, and curved little horns.
 */
function drawHolsteinCow(
  ctx: CanvasRenderingContext2D,
  chew: number,
  tailAngle: number,
  earAngle: number,
  isResting: boolean
) {
  // Ground shadow
  ctx.fillStyle = 'rgba(15, 30, 20, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, isResting ? 7 : 11, isResting ? 44 : 38, isResting ? 11 : 8, 0, 0, Math.PI * 2);
  ctx.fill();

  const cowWhite = '#fdfbf7';
  const cowBlack = '#1e232a';
  const muzzlePink = '#f8b4c0';

  // Tail
  ctx.save();
  ctx.translate(30, -12);
  ctx.rotate(0.15 + tailAngle);
  ctx.strokeStyle = cowWhite;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(8, 12, 3, 22);
  ctx.stroke();
  // Black tail brush
  ctx.fillStyle = cowBlack;
  ctx.beginPath();
  ctx.ellipse(3, 23, 3.5, 6, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Back legs
  if (!isResting) {
    ctx.fillStyle = '#e5dfd5';
    ctx.fillRect(18, -4, 7, 15);
    ctx.fillRect(-20, -4, 7, 15);
    // Dark hooves
    ctx.fillStyle = '#3a3530';
    ctx.fillRect(18, 9, 8, 3);
    ctx.fillRect(-20, 9, 8, 3);
  }

  // Main Torso (White body)
  ctx.fillStyle = cowWhite;
  ctx.beginPath();
  if (isResting) {
    ctx.roundRect(-30, -18, 62, 25, [14, 12, 8, 8]);
  } else {
    ctx.roundRect(-30, -24, 62, 25, [14, 12, 8, 8]);
  }
  ctx.fill();

  // Iconic Black Spots / Patches on Body
  ctx.fillStyle = cowBlack;
  ctx.beginPath();
  // Large patch on back
  ctx.ellipse(-8, isResting ? -15 : -21, 14, 8, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Rump patch
  ctx.beginPath();
  ctx.ellipse(20, isResting ? -10 : -16, 10, 9, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Flank small spot
  ctx.beginPath();
  ctx.arc(4, isResting ? -3 : -9, 5, 0, Math.PI * 2);
  ctx.fill();

  // Udder (if standing)
  if (!isResting) {
    ctx.fillStyle = '#f7c0ca';
    ctx.beginPath();
    ctx.ellipse(10, 0, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Front legs
  if (!isResting) {
    ctx.fillStyle = cowWhite;
    ctx.fillRect(-13, -5, 7, 16);
    ctx.fillRect(25, -5, 7, 16);
    // Spot on leg
    ctx.fillStyle = cowBlack;
    ctx.fillRect(-13, 0, 7, 5);
    // Hooves
    ctx.fillStyle = '#3a3530';
    ctx.fillRect(-13, 9, 8, 3);
    ctx.fillRect(25, 9, 8, 3);
  }

  // Head and Neck Group
  ctx.save();
  ctx.translate(-26, isResting ? -9 : -15);

  // Neck
  ctx.fillStyle = cowWhite;
  ctx.beginPath();
  ctx.moveTo(10, 14);
  ctx.lineTo(-6, 10);
  ctx.lineTo(-8, -4);
  ctx.lineTo(8, -6);
  ctx.closePath();
  ctx.fill();

  // Neck spot
  ctx.fillStyle = cowBlack;
  ctx.beginPath();
  ctx.arc(0, 2, 6, 0, Math.PI * 2);
  ctx.fill();

  // Head
  const headY = chew;
  ctx.fillStyle = cowWhite;
  ctx.beginPath();
  ctx.roundRect(-20, -10 + headY, 20, 18, [7, 5, 7, 8]);
  ctx.fill();

  // Head patch across eye
  ctx.fillStyle = cowBlack;
  ctx.beginPath();
  ctx.ellipse(-13, -5 + headY, 7, 6, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Cute Little Horns
  ctx.fillStyle = '#e6dcbe';
  ctx.beginPath();
  ctx.moveTo(-11, -10 + headY);
  ctx.lineTo(-9, -15 + headY);
  ctx.lineTo(-7, -9 + headY);
  ctx.fill();

  // Large Pink Muzzle
  ctx.fillStyle = muzzlePink;
  ctx.beginPath();
  ctx.roundRect(-24, -1 + headY, 11, 10, [4, 4, 5, 5]);
  ctx.fill();

  // Nostrils
  ctx.fillStyle = '#9e4d5d';
  ctx.beginPath();
  ctx.arc(-21, 4 + headY, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Sweet gentle eye
  ctx.fillStyle = '#111417';
  ctx.beginPath();
  ctx.arc(-13, -4 + headY, 2.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-13.6, -4.6 + headY, 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Floppy Ear
  ctx.save();
  ctx.translate(-5, -6 + headY);
  ctx.rotate(0.2 + (earAngle * Math.PI) / 180);
  ctx.fillStyle = cowWhite;
  ctx.beginPath();
  ctx.ellipse(0, 0, 7, 3.5, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = muzzlePink;
  ctx.beginPath();
  ctx.ellipse(0, 0, 4, 1.8, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Cow Bell on collar
  ctx.strokeStyle = '#c2410c'; // Red leather collar
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(3, 4 + headY * 0.5);
  ctx.lineTo(-2, 10 + headY * 0.5);
  ctx.stroke();
  // Golden bell
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(-1, 12 + headY * 0.5, 3.5, 0, Math.PI);
  ctx.lineTo(2.5, 9 + headY * 0.5);
  ctx.lineTo(-4.5, 9 + headY * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.restore(); // end head
}

/**
 * Jersey Cow:
 * Warm rich caramel/fawn coat with cream underbelly and muzzle.
 */
function drawJerseyCow(
  ctx: CanvasRenderingContext2D,
  chew: number,
  tailAngle: number,
  earAngle: number,
  isResting: boolean
) {
  // Ground shadow
  ctx.fillStyle = 'rgba(15, 30, 20, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, isResting ? 7 : 11, isResting ? 42 : 36, isResting ? 10 : 8, 0, 0, Math.PI * 2);
  ctx.fill();

  const caramel = '#b46e38';
  const warmShade = '#8f4f22';
  const creamMuzzle = '#faebd7';

  // Tail
  ctx.save();
  ctx.translate(28, -12);
  ctx.rotate(0.15 + tailAngle);
  ctx.strokeStyle = caramel;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(8, 12, 3, 22);
  ctx.stroke();
  // Dark tail brush
  ctx.fillStyle = '#3a2112';
  ctx.beginPath();
  ctx.ellipse(3, 23, 3.5, 6, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Back legs
  if (!isResting) {
    ctx.fillStyle = warmShade;
    ctx.fillRect(17, -4, 7, 15);
    ctx.fillRect(-19, -4, 7, 15);
    // Dark hooves
    ctx.fillStyle = '#2b1a0e';
    ctx.fillRect(17, 9, 8, 3);
    ctx.fillRect(-19, 9, 8, 3);
  }

  // Torso
  ctx.fillStyle = caramel;
  ctx.beginPath();
  if (isResting) {
    ctx.roundRect(-28, -18, 58, 25, [14, 12, 8, 8]);
  } else {
    ctx.roundRect(-28, -23, 58, 25, [14, 12, 8, 8]);
  }
  ctx.fill();

  // Subtle lighter belly highlight
  ctx.fillStyle = 'rgba(250, 235, 215, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, isResting ? -4 : -8, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Front legs
  if (!isResting) {
    ctx.fillStyle = caramel;
    ctx.fillRect(-12, -5, 7, 16);
    ctx.fillRect(24, -5, 7, 16);
    // Hooves
    ctx.fillStyle = '#2b1a0e';
    ctx.fillRect(-12, 9, 8, 3);
    ctx.fillRect(24, 9, 8, 3);
  }

  // Head & Neck
  ctx.save();
  ctx.translate(-24, isResting ? -9 : -14);

  // Neck
  ctx.fillStyle = warmShade;
  ctx.beginPath();
  ctx.moveTo(9, 13);
  ctx.lineTo(-5, 9);
  ctx.lineTo(-7, -4);
  ctx.lineTo(7, -5);
  ctx.closePath();
  ctx.fill();

  // Head
  const headY = chew;
  ctx.fillStyle = caramel;
  ctx.beginPath();
  ctx.roundRect(-19, -9 + headY, 19, 17, [7, 5, 7, 8]);
  ctx.fill();

  // Cream muzzle
  ctx.fillStyle = creamMuzzle;
  ctx.beginPath();
  ctx.roundRect(-23, -1 + headY, 11, 9, [4, 4, 5, 5]);
  ctx.fill();

  // Nostril
  ctx.fillStyle = '#4a2810';
  ctx.beginPath();
  ctx.arc(-20, 3 + headY, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Large expressive dark Jersey cow eye
  ctx.fillStyle = '#1c1006';
  ctx.beginPath();
  ctx.arc(-12, -4 + headY, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-12.7, -4.7 + headY, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Small curved horns
  ctx.fillStyle = '#e8d8be';
  ctx.beginPath();
  ctx.moveTo(-10, -9 + headY);
  ctx.lineTo(-8, -13 + headY);
  ctx.lineTo(-6, -8 + headY);
  ctx.fill();

  // Floppy Ear
  ctx.save();
  ctx.translate(-4, -5 + headY);
  ctx.rotate(0.25 + (earAngle * Math.PI) / 180);
  ctx.fillStyle = caramel;
  ctx.beginPath();
  ctx.ellipse(0, 0, 7, 3.5, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e59a7a';
  ctx.beginPath();
  ctx.ellipse(0, 0, 4, 1.8, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore(); // end head
}

/**
 * Zebu Humped Cow / Bull (Desi Cow - Gir / Sahiwal breed):
 * Light cream/ivory coat, prominent shoulder hump, characteristic curved horns,
 * dewlap skin fold under the throat, and dark soulful eyes (as seen in the reference photo!).
 */
function drawZebuCow(
  ctx: CanvasRenderingContext2D,
  chew: number,
  tailAngle: number,
  earAngle: number,
  isResting: boolean
) {
  // Ground shadow
  ctx.fillStyle = 'rgba(15, 30, 20, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, isResting ? 8 : 12, isResting ? 48 : 42, isResting ? 12 : 9, 0, 0, Math.PI * 2);
  ctx.fill();

  const zebuCream = '#f5efe3';
  const zebuShade = '#dfd4c0';
  const zebuDark = '#3d342c';
  const hornColor = '#4a3f35';

  // Tail
  ctx.save();
  ctx.translate(32, -14);
  ctx.rotate(0.18 + tailAngle);
  ctx.strokeStyle = zebuCream;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(8, 14, 4, 25);
  ctx.stroke();
  // Black tail brush
  ctx.fillStyle = zebuDark;
  ctx.beginPath();
  ctx.ellipse(4, 26, 4, 7, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Back legs
  if (!isResting) {
    ctx.fillStyle = zebuShade;
    ctx.fillRect(19, -4, 8, 16);
    ctx.fillRect(-21, -4, 8, 16);
    // Dark hooves
    ctx.fillStyle = zebuDark;
    ctx.fillRect(19, 10, 8, 3);
    ctx.fillRect(-21, 10, 8, 3);
  }

  // Main Torso
  ctx.fillStyle = zebuCream;
  ctx.beginPath();
  if (isResting) {
    ctx.roundRect(-32, -20, 66, 28, [16, 14, 8, 10]);
  } else {
    ctx.roundRect(-32, -26, 66, 28, [16, 14, 10, 10]);
  }
  ctx.fill();

  // PROMINENT SHOULDER HUMP (Iconic Bos Indicus / Zebu characteristic)
  ctx.fillStyle = zebuCream;
  ctx.beginPath();
  const humpY = isResting ? -22 : -28;
  ctx.ellipse(-12, humpY, 15, 12, -0.15, 0, Math.PI * 2);
  ctx.fill();
  // Subtle hump shadow
  ctx.fillStyle = zebuShade;
  ctx.beginPath();
  ctx.ellipse(-12, humpY + 4, 13, 8, -0.15, 0, Math.PI);
  ctx.fill();

  // Front legs
  if (!isResting) {
    ctx.fillStyle = zebuCream;
    ctx.fillRect(-13, -5, 8, 17);
    ctx.fillRect(26, -5, 8, 17);
    // Dark hooves
    ctx.fillStyle = zebuDark;
    ctx.fillRect(-13, 10, 8, 3);
    ctx.fillRect(26, 10, 8, 3);
  }

  // Neck, Head, Dewlap Group
  ctx.save();
  ctx.translate(-28, isResting ? -11 : -17);

  // Dewlap (hanging fold of loose skin under neck)
  ctx.fillStyle = zebuShade;
  ctx.beginPath();
  ctx.moveTo(12, 14);
  ctx.quadraticCurveTo(-4, 22, -10, 10);
  ctx.lineTo(-6, 2);
  ctx.closePath();
  ctx.fill();

  // Neck
  ctx.fillStyle = zebuCream;
  ctx.beginPath();
  ctx.moveTo(10, 14);
  ctx.lineTo(-6, 10);
  ctx.lineTo(-10, -4);
  ctx.lineTo(8, -8);
  ctx.closePath();
  ctx.fill();

  // Head
  const headY = chew;
  ctx.fillStyle = zebuCream;
  ctx.beginPath();
  ctx.roundRect(-22, -10 + headY, 22, 19, [8, 6, 8, 9]);
  ctx.fill();

  // Muzzle (soft grey/black)
  ctx.fillStyle = '#4b433c';
  ctx.beginPath();
  ctx.roundRect(-26, -1 + headY, 11, 10, [4, 4, 5, 5]);
  ctx.fill();

  // Nostril
  ctx.fillStyle = '#1c1712';
  ctx.beginPath();
  ctx.arc(-22, 4 + headY, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Expressive dark soulful eye
  ctx.fillStyle = '#140f0c';
  ctx.beginPath();
  ctx.arc(-13, -4 + headY, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-13.7, -4.7 + headY, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Curved Upward Horns
  ctx.strokeStyle = hornColor;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  // Near Horn
  ctx.beginPath();
  ctx.moveTo(-11, -8 + headY);
  ctx.quadraticCurveTo(-14, -22 + headY, -6, -24 + headY);
  ctx.stroke();
  // Far Horn
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-7, -9 + headY);
  ctx.quadraticCurveTo(-10, -20 + headY, -3, -22 + headY);
  ctx.stroke();

  // Drooping / relaxed ear
  ctx.save();
  ctx.translate(-5, -5 + headY);
  ctx.rotate(0.35 + (earAngle * Math.PI) / 180);
  ctx.fillStyle = zebuCream;
  ctx.beginPath();
  ctx.ellipse(0, 0, 8, 4, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8b8a0';
  ctx.beginPath();
  ctx.ellipse(0, 0, 5, 2, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore(); // end head
}

/**
 * Desi Calf:
 * Playful young calf with caramel fawn coat and cute sweet proportions.
 */
function drawDesiCalf(
  ctx: CanvasRenderingContext2D,
  chew: number,
  tailAngle: number,
  earAngle: number,
  isResting: boolean
) {
  ctx.save();
  ctx.scale(0.72, 0.72); // Smaller scale for calf

  // Ground shadow
  ctx.fillStyle = 'rgba(15, 30, 20, 0.2)';
  ctx.beginPath();
  ctx.ellipse(0, isResting ? 6 : 10, isResting ? 36 : 30, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  const calfColor = '#c98a58';
  const calfMuzzle = '#f5dfcb';

  // Tail
  ctx.save();
  ctx.translate(22, -10);
  ctx.rotate(0.3 + tailAngle * 1.5);
  ctx.strokeStyle = calfColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(6, 10, 2, 18);
  ctx.stroke();
  ctx.restore();

  // Legs (longer slender calf legs)
  if (!isResting) {
    ctx.fillStyle = '#a66b3d';
    ctx.fillRect(14, -2, 5, 14);
    ctx.fillRect(-15, -2, 5, 14);
    ctx.fillStyle = calfColor;
    ctx.fillRect(-9, -3, 5, 15);
    ctx.fillRect(19, -3, 5, 15);
    // Dark little hooves
    ctx.fillStyle = '#2b1a0e';
    ctx.fillRect(14, 10, 6, 2.5);
    ctx.fillRect(-15, 10, 6, 2.5);
    ctx.fillRect(-9, 10, 6, 2.5);
    ctx.fillRect(19, 10, 6, 2.5);
  }

  // Torso
  ctx.fillStyle = calfColor;
  ctx.beginPath();
  ctx.roundRect(-22, isResting ? -16 : -20, 46, 20, [10, 10, 6, 6]);
  ctx.fill();

  // Head
  ctx.save();
  ctx.translate(-19, isResting ? -8 : -12);
  const headY = chew * 0.8;

  ctx.fillStyle = calfColor;
  ctx.beginPath();
  ctx.roundRect(-16, -8 + headY, 16, 15, [6, 6, 7, 7]);
  ctx.fill();

  // Cute muzzle
  ctx.fillStyle = calfMuzzle;
  ctx.beginPath();
  ctx.roundRect(-19, 0 + headY, 9, 8, [4, 4, 4, 4]);
  ctx.fill();

  // Big cute baby calf eye
  ctx.fillStyle = '#170c04';
  ctx.beginPath();
  ctx.arc(-10, -3 + headY, 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-10.8, -3.8 + headY, 1.0, 0, Math.PI * 2);
  ctx.fill();

  // Cute perky ears
  ctx.save();
  ctx.translate(-4, -5 + headY);
  ctx.rotate(0.2 + (earAngle * Math.PI) / 180);
  ctx.fillStyle = calfColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, 7, 3.5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore(); // end head
  ctx.restore(); // end calf
}

