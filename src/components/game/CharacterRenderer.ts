/**
 * Character Canvas Renderer
 * Supports multiple skins, customizable color palettes,
 * custom uploaded image textures, and responsive running/jumping animations.
 */

import { CharacterSkin } from '../../types/game';

interface DrawCharacterParams {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number; // Ground baseline or current player Y
  width: number;
  height: number;
  skin: CharacterSkin;
  isGrounded: boolean;
  isDucking: boolean;
  runCycle: number; // 0 to 1 run cycle phase
  vy: number;
  rotation?: number;
  isDead?: boolean;
}

// Cache for user-uploaded custom images
const imageCache = new Map<string, HTMLImageElement>();

export function drawCharacter({
  ctx,
  x,
  y,
  width,
  height,
  skin,
  isGrounded,
  isDucking,
  runCycle,
  vy,
  rotation = 0,
  isDead = false,
}: DrawCharacterParams) {
  ctx.save();
  ctx.translate(x + width / 2, y + height);

  if (rotation !== 0) {
    ctx.rotate(rotation);
  }

  // Draw soft dynamic shadow under character on ground
  if (isGrounded && !isDead) {
    const shadowW = isDucking ? width * 1.3 : width * 0.9;
    ctx.fillStyle = 'rgba(10, 20, 15, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, shadowW / 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // If user selected a custom uploaded image texture or animated spritesheet
  if ((skin.style === 'custom_image' || skin.style === 'spritesheet') && (skin.customImageUrl || skin.spritesheetUrl)) {
    const imgUrl = skin.spritesheetUrl || skin.customImageUrl!;
    drawCustomImageTexture(ctx, imgUrl, width, height, isGrounded, isDucking, runCycle, skin);
    ctx.restore();
    return;
  }

  // If user drew a custom pixel matrix
  if (skin.customPixelMatrix && skin.customPixelMatrix.length > 0) {
    drawPixelMatrix(ctx, skin.customPixelMatrix, width, height, isGrounded, runCycle);
    ctx.restore();
    return;
  }

  // Otherwise, render stylized procedural vector character
  drawProceduralCharacter(ctx, skin, width, height, isGrounded, isDucking, runCycle, vy, isDead);

  ctx.restore();
}

/**
 * Procedural stylized vector character with smooth skeletal/bone running motion
 */
function drawProceduralCharacter(
  ctx: CanvasRenderingContext2D,
  skin: CharacterSkin,
  width: number,
  height: number,
  isGrounded: boolean,
  isDucking: boolean,
  runCycle: number,
  vy: number,
  isDead: boolean
) {
  const primary = skin.primaryColor || '#22c55e';
  const secondary = skin.secondaryColor || '#1e293b';
  const skinTone = skin.skinTone || '#fcd34d';
  const hair = skin.hairColor || '#78350f';
  const accent = skin.accentColor || '#ef4444';

  // Running & jumping calculations based on user's 5-frame animation sequences
  const runPhase = runCycle * Math.PI * 2;
  let legAngle1 = 0;
  let legAngle2 = 0;
  let armAngle1 = 0;
  let armAngle2 = 0;

  if (isGrounded) {
    // 5-phase running stride cycle from runing.png
    legAngle1 = Math.sin(runPhase) * 0.72;
    legAngle2 = -Math.sin(runPhase) * 0.72;
    armAngle1 = -Math.sin(runPhase) * 0.75;
    armAngle2 = Math.sin(runPhase) * 0.75;
  } else {
    // 5-phase jump poses from jumping.png
    if (vy < -8) {
      // Launch phase: upward thrust
      legAngle1 = -0.5;
      legAngle2 = 0.4;
      armAngle1 = -0.9;
      armAngle2 = 0.8;
    } else if (vy < 0) {
      // Rising leap phase
      legAngle1 = -0.7;
      legAngle2 = -0.3;
      armAngle1 = -0.7;
      armAngle2 = -0.5;
    } else if (vy <= 4) {
      // High apex tuck phase
      legAngle1 = -0.6;
      legAngle2 = -0.55;
      armAngle1 = -0.4;
      armAngle2 = -0.3;
    } else {
      // Descent landing prep phase
      legAngle1 = 0.25;
      legAngle2 = 0.35;
      armAngle1 = 0.2;
      armAngle2 = -0.2;
    }
  }

  const torsoBob = isGrounded ? Math.abs(Math.sin(runPhase)) * 4.5 : 0;
  const bodyLean = isDucking ? 0.45 : isGrounded ? 0.14 : vy < 0 ? -0.08 : 0.18;

  ctx.translate(0, -torsoBob);

  if (isDucking) {
    // Ducking slide pose: compact lower profile
    ctx.save();
    ctx.translate(0, -18);
    ctx.rotate(0.35);

    // Slide dust streak
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(-width * 0.8, 12, width * 0.9, 3);

    // Legs stretched back
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(-width * 0.6, 14);
    ctx.stroke();

    // Torso
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.roundRect(-width * 0.3, -8, width * 0.65, 16, 6);
    ctx.fill();

    // Head
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(width * 0.35, -4, 9, 0, Math.PI * 2);
    ctx.fill();

    // Hair / Hat
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.arc(width * 0.35, -8, 8, Math.PI, Math.PI * 2);
    ctx.fill();

    // Scarf streaming behind
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(width * 0.2, -4);
    ctx.quadraticCurveTo(-width * 0.2, -10 + Math.sin(runPhase) * 4, -width * 0.7, -6);
    ctx.stroke();

    ctx.restore();
    return;
  }

  // --- NORMAL RUNNING / JUMPING POSE ---

  // 1. Far Leg (Leg 2)
  drawLeg(ctx, legAngle2, secondary, width, height, false);

  // 2. Far Arm (Arm 2)
  drawArm(ctx, armAngle2, primary, skinTone, width, height, false);

  // 3. Torso
  ctx.save();
  ctx.rotate(bodyLean);

  // Torso base Y
  const torsoTopY = -height + 20;
  const torsoHeight = height * 0.42;

  ctx.fillStyle = primary;
  ctx.beginPath();
  ctx.roundRect(-width * 0.26, torsoTopY, width * 0.52, torsoHeight, [8, 8, 4, 4]);
  ctx.fill();

  // Belt / waistband
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-width * 0.26, torsoTopY + torsoHeight - 5, width * 0.52, 4);

  // Special Skin Overlay (Cowboy vest, Cyber line, Cow onesie spots)
  if (skin.style === 'cowboy') {
    // Leather vest open over shirt
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-width * 0.26, torsoTopY, 6, torsoHeight - 4);
    ctx.fillRect(width * 0.26 - 6, torsoTopY, 6, torsoHeight - 4);
    // Silver belt buckle
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-3, torsoTopY + torsoHeight - 6, 6, 6);
  } else if (skin.style === 'cyber') {
    // Glowing cyber neon line
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, torsoTopY + 3);
    ctx.lineTo(0, torsoTopY + torsoHeight - 8);
    ctx.stroke();
  } else if (skin.style === 'onesie') {
    // Cow patches on onesie
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(-4, torsoTopY + 8, 5, 0, Math.PI * 2);
    ctx.arc(4, torsoTopY + 16, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (skin.style === 'runner') {
    // Beige inner collar / zipper trim from the reference screenshot
    ctx.fillStyle = '#e8dec8';
    ctx.beginPath();
    ctx.moveTo(-5, torsoTopY);
    ctx.lineTo(0, torsoTopY + 8);
    ctx.lineTo(5, torsoTopY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3a271d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, torsoTopY + 4);
    ctx.lineTo(0, torsoTopY + 12);
    ctx.stroke();
  }

  // 4. Head, Hair, Face, Hat/Visor
  const headCenterY = torsoTopY - 11;
  const headRadius = 11;

  // Neck
  ctx.fillStyle = skinTone;
  ctx.fillRect(-3, torsoTopY - 3, 6, 5);

  // Head Circle
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.arc(0, headCenterY, headRadius, 0, Math.PI * 2);
  ctx.fill();

  // Face elements (looking right towards travel direction)
  if (!isDead) {
    // Eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(4, headCenterY - 1, 2, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(4.6, headCenterY - 1.6, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Smile / determined mouth
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(4, headCenterY + 4, 2.5, 0.1, Math.PI * 0.85);
    ctx.stroke();

    // Spectacles / cool glasses & mustache (from the uploaded sprites!)
    if (skin.style === 'runner') {
      ctx.strokeStyle = '#2d1e12';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(1, headCenterY - 4, 7, 6);
      ctx.beginPath();
      ctx.moveTo(8, headCenterY - 2);
      ctx.lineTo(11, headCenterY - 3);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillRect(2, headCenterY - 3, 2.5, 2);

      // Distinctive mustache from uploaded sprites
      ctx.strokeStyle = '#2b1b11';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(1, headCenterY + 2.5);
      ctx.lineTo(6.5, headCenterY + 2.5);
      ctx.stroke();
    }
  } else {
    // X eyes on collision
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(2, headCenterY - 3);
    ctx.lineTo(6, headCenterY + 1);
    ctx.moveTo(6, headCenterY - 3);
    ctx.lineTo(2, headCenterY + 1);
    ctx.stroke();
  }

  // Hair & Headwear Styles
  if (skin.style === 'cowboy') {
    // Ten-gallon brown cowboy hat
    ctx.fillStyle = '#92400e';
    // Brim
    ctx.beginPath();
    ctx.ellipse(0, headCenterY - 9, 17, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Crown
    ctx.beginPath();
    ctx.roundRect(-8, headCenterY - 20, 16, 12, [5, 5, 2, 2]);
    ctx.fill();
    // Hat band
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-8, headCenterY - 11, 16, 2.5);
  } else if (skin.style === 'cyber') {
    // Futuristic glowing visor
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.roundRect(0, headCenterY - 3, 10, 5, 2);
    ctx.fill();
    // Dark cyber helmet
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, headCenterY, headRadius + 1, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();
  } else if (skin.style === 'onesie') {
    // Cow onesie hood with cute horns & ears
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, headCenterY, headRadius + 1.5, Math.PI * 0.8, Math.PI * 2.2);
    ctx.fill();
    // Little horns
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.moveTo(-6, headCenterY - 10);
    ctx.lineTo(-4, headCenterY - 16);
    ctx.lineTo(-2, headCenterY - 10);
    ctx.moveTo(6, headCenterY - 10);
    ctx.lineTo(4, headCenterY - 16);
    ctx.lineTo(2, headCenterY - 10);
    ctx.fill();
  } else if (skin.style === 'ninja') {
    // Midnight cowl with narrow eye slit
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, headCenterY, headRadius + 1, 0, Math.PI * 2);
    ctx.fill();
    // Eye cutout
    ctx.fillStyle = skinTone;
    ctx.fillRect(1, headCenterY - 3, 7, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, headCenterY - 2, 2, 2);
  } else {
    // Runner style: energetic hair + headband
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.arc(-2, headCenterY - 3, headRadius + 1, Math.PI * 0.6, Math.PI * 1.8);
    ctx.lineTo(0, headCenterY - 11);
    ctx.fill();

    // Athletic Headband
    ctx.fillStyle = accent;
    ctx.fillRect(-headRadius, headCenterY - 7, headRadius * 2, 3.5);
  }

  // Flowing Scarf / Cape trailing in the wind
  const scarfWave = Math.sin(runPhase * 1.5) * 4;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, torsoTopY + 2);
  ctx.quadraticCurveTo(-width * 0.35, torsoTopY - 4 + scarfWave, -width * 0.65, torsoTopY + scarfWave * 1.2);
  ctx.stroke();

  ctx.restore(); // end torso rotation

  // 5. Near Leg (Leg 1)
  drawLeg(ctx, legAngle1, secondary, width, height, true);

  // 6. Near Arm (Arm 1)
  drawArm(ctx, armAngle1, primary, skinTone, width, height, true);
}

function drawLeg(
  ctx: CanvasRenderingContext2D,
  angle: number,
  color: string,
  width: number,
  height: number,
  isNear: boolean
) {
  ctx.save();
  ctx.translate(isNear ? 2 : -2, -height * 0.38);
  ctx.rotate(angle);

  // Upper leg
  ctx.strokeStyle = isNear ? color : shadeColor(color, -25);
  ctx.lineWidth = 6.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, height * 0.2);
  ctx.stroke();

  // Lower leg / Knee bend
  ctx.translate(0, height * 0.2);
  const kneeBend = Math.max(0, -angle * 0.6);
  ctx.rotate(kneeBend);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(2, height * 0.17);
  ctx.stroke();

  // Running boot / shoe (brown leather boots matching reference screenshot)
  ctx.fillStyle = isNear ? '#6b4426' : '#4d2e16';
  ctx.beginPath();
  ctx.roundRect(-2, height * 0.14, 12, 6, 2);
  ctx.fill();
  // Boot sole
  ctx.fillStyle = '#2b180d';
  ctx.fillRect(-2, height * 0.14 + 5, 12, 2.5);

  ctx.restore();
}

function drawArm(
  ctx: CanvasRenderingContext2D,
  angle: number,
  sleeveColor: string,
  skinColor: string,
  width: number,
  height: number,
  isNear: boolean
) {
  ctx.save();
  ctx.translate(isNear ? 3 : -3, -height + 25);
  ctx.rotate(angle);

  // Sleeve
  ctx.strokeStyle = isNear ? sleeveColor : shadeColor(sleeveColor, -25);
  ctx.lineWidth = 5.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, height * 0.16);
  ctx.stroke();

  // Forearm & Hand
  ctx.strokeStyle = skinColor;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(0, height * 0.16);
  ctx.lineTo(2, height * 0.28);
  ctx.stroke();

  // Hand fist
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(2, height * 0.29, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
/**
 * Renders custom user-uploaded image texture or multi-frame running spritesheet
 */
function drawCustomImageTexture(
  ctx: CanvasRenderingContext2D,
  imageUrl: string,
  width: number,
  height: number,
  isGrounded: boolean,
  isDucking: boolean,
  runCycle: number,
  skin?: CharacterSkin
) {
  // If player is airborne (jumping) and a jumping sprite is provided (e.g. jumping.png)
  if (!isGrounded && skin?.jumpImageUrl) {
    let jumpImg = imageCache.get(skin.jumpImageUrl);
    if (!jumpImg) {
      jumpImg = new Image();
      jumpImg.src = skin.jumpImageUrl;
      imageCache.set(skin.jumpImageUrl, jumpImg);
    }
    if (jumpImg.complete && jumpImg.naturalWidth > 0) {
      ctx.drawImage(jumpImg, -width / 2, -height, width, height);
      return;
    }
  }

  let img = imageCache.get(imageUrl);
  if (!img) {
    img = new Image();
    img.src = imageUrl;
    imageCache.set(imageUrl, img);
  }

  if (!img.complete || img.naturalWidth === 0) {
    // Fallback while loading
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(-width / 2, -height, width, height);
    return;
  }

  const frameCount = skin?.frameCount && skin.frameCount > 1 ? skin.frameCount : 1;
  const drawW = isDucking ? width * 1.2 : width;
  const drawH = isDucking ? height * 0.55 : height;
  const runBob = (isGrounded && frameCount === 1) ? Math.sin(runCycle * Math.PI * 2) * 3 : 0;
  const drawY = isDucking ? -drawH : -height - runBob;

  if (frameCount > 1) {
    // Slices horizontal animated running spritesheet strip
    const currentFrame = Math.floor(runCycle * frameCount) % frameCount;
    const frameSourceW = img.naturalWidth / frameCount;
    const frameSourceH = img.naturalHeight;
    ctx.drawImage(
      img,
      currentFrame * frameSourceW,
      0,
      frameSourceW,
      frameSourceH,
      -drawW / 2,
      drawY,
      drawW,
      drawH
    );
  } else {
    // Single sprite texture with procedural running bounce
    ctx.drawImage(img, -drawW / 2, drawY, drawW, drawH);
  }
}

/**
 * Renders custom 16x16 pixel matrix texture
 */
function drawPixelMatrix(
  ctx: CanvasRenderingContext2D,
  matrix: string[][],
  width: number,
  height: number,
  isGrounded: boolean,
  runCycle: number
) {
  const rows = matrix.length;
  const cols = matrix[0]?.length || 16;
  const pixelSize = height / rows;
  const startX = -((cols * pixelSize) / 2);
  const runBob = isGrounded ? Math.sin(runCycle * Math.PI * 2) * 3 : 0;
  const startY = -height - runBob;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = matrix[r][c];
      if (color && color !== 'transparent') {
        ctx.fillStyle = color;
        ctx.fillRect(startX + c * pixelSize, startY + r * pixelSize, pixelSize + 0.5, pixelSize + 0.5);
      }
    }
  }
}

function shadeColor(color: string, percent: number): string {
  let num = parseInt(color.replace('#', ''), 16);
  if (isNaN(num)) return color;
  let amt = Math.round(2.55 * percent);
  let R = (num >> 16) + amt;
  let B = ((num >> 8) & 0x00ff) + amt;
  let G = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
      (G < 255 ? (G < 1 ? 0 : G) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
