/**
 * Parallax Scenery Manager
 * Renders multi-layer scrolling countryside scenery.
 * Strictly features ONLY cows and water buffaloes in the pasture background!
 */

import { AnimalType, BgAnimal } from '../../types/game';
import { drawPastureAnimal } from './CowBuffaloRenderer';

interface Cloud {
  x: number;
  y: number;
  scale: number;
  speed: number;
}

export class ParallaxScenery {
  private width = 1000;
  private height = 500;
  private groundY = 400;

  private clouds: Cloud[] = [];
  private distantAnimals: BgAnimal[] = [];
  private midAnimals: BgAnimal[] = [];

  // Scenery cycle width for seamless looping
  private sceneLoopWidth = 3200;

  constructor(width: number, height: number, groundY: number) {
    this.resize(width, height, groundY);
    this.initClouds();
    this.initAnimals();
  }

  public resize(width: number, height: number, groundY: number) {
    this.width = width;
    this.height = height;
    this.groundY = groundY;
  }

  private initClouds() {
    this.clouds = [
      { x: 50, y: 45, scale: 1.2, speed: 0.05 },
      { x: 380, y: 70, scale: 0.9, speed: 0.04 },
      { x: 720, y: 35, scale: 1.4, speed: 0.06 },
      { x: 1100, y: 60, scale: 1.0, speed: 0.05 },
      { x: 1500, y: 40, scale: 1.1, speed: 0.055 },
      { x: 1900, y: 80, scale: 0.85, speed: 0.045 },
    ];
  }

  /**
   * Initializes background herd: Strictly cows (Holstein, Jersey) and water buffaloes!
   */
  private initAnimals() {
    // Distant hill grazing herd (smaller scale 0.42 - 0.55)
    const distantTypes: AnimalType[] = [
      'water_buffalo',
      'zebu_cow',
      'desi_calf',
      'water_buffalo',
      'jersey_cow',
      'zebu_cow',
      'water_buffalo',
      'holstein_cow',
      'water_buffalo',
      'zebu_cow',
    ];

    this.distantAnimals = distantTypes.map((type, i) => {
      const x = (i / distantTypes.length) * this.sceneLoopWidth + (Math.random() * 120 - 60);
      return {
        x,
        layer: 'distant_hill',
        type,
        state: Math.random() > 0.4 ? 'grazing' : 'resting',
        facingLeft: Math.random() > 0.5,
        scale: 0.42 + Math.random() * 0.12,
        yOffset: -12 + (Math.sin(i * 1.5) * 8),
        animTimer: Math.random() * 10,
      };
    });

    // Mid pasture herd closer to runner (scale 0.72 - 0.95)
    // Matches the cattle lineup in the user's reference screenshot!
    const midTypes: AnimalType[] = [
      'desi_calf',
      'desi_calf',
      'water_buffalo',
      'water_buffalo',
      'zebu_cow',
      'jersey_cow',
      'water_buffalo',
      'zebu_cow',
      'desi_calf',
      'holstein_cow',
      'water_buffalo',
      'zebu_cow',
    ];

    this.midAnimals = midTypes.map((type, i) => {
      const x = (i / midTypes.length) * this.sceneLoopWidth + (Math.random() * 80 - 40);
      const isResting = (i % 4 === 0);
      return {
        x,
        layer: 'mid_pasture',
        type,
        state: isResting ? 'resting' : (Math.random() > 0.3 ? 'chewing' : 'grazing'),
        facingLeft: Math.random() > 0.5,
        scale: type === 'desi_calf' ? 0.65 : (0.78 + Math.random() * 0.15),
        yOffset: isResting ? 6 : -4 + (Math.sin(i * 2.3) * 6),
        animTimer: Math.random() * 10,
      };
    });
  }

  public update(speed: number, deltaTime: number) {
    // Move clouds slowly
    this.clouds.forEach(cloud => {
      cloud.x -= (cloud.speed * 20 + speed * 0.05);
      if (cloud.x < -200) {
        cloud.x += this.sceneLoopWidth;
      }
    });

    // Update animal animation timers
    this.distantAnimals.forEach(a => a.animTimer += deltaTime);
    this.midAnimals.forEach(a => a.animTimer += deltaTime);
  }

  public render(ctx: CanvasRenderingContext2D, scrollDistance: number) {
    const w = this.width;
    const h = this.height;
    const gY = this.groundY;

    // --- 1. SKY GRADIENT ---
    const skyGrad = ctx.createLinearGradient(0, 0, 0, gY);
    skyGrad.addColorStop(0, '#589bf4'); // Radiant cerulean sky
    skyGrad.addColorStop(0.55, '#a6d5f7'); // Soft atmospheric horizon
    skyGrad.addColorStop(1, '#dff1fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Warm Sun in upper right
    const sunX = w - 160;
    const sunY = 90;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 70);
    sunGlow.addColorStop(0, 'rgba(255, 245, 180, 0.95)');
    sunGlow.addColorStop(0.4, 'rgba(255, 220, 120, 0.4)');
    sunGlow.addColorStop(1, 'rgba(255, 220, 120, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 70, 0, Math.PI * 2);
    ctx.fill();

    // Solid Sun disk
    ctx.fillStyle = '#fff4a3';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
    ctx.fill();

    // --- 2. CLOUDS ---
    this.clouds.forEach(c => {
      this.drawCloud(ctx, c.x, c.y, c.scale);
    });

    // --- 3. DISTANT MOUNTAINS / BLUE HILLS (Speed: 0.12x) ---
    this.drawDistantMountainLayer(ctx, scrollDistance * 0.12, w, gY);

    // --- 4. ROLLING FAR HILLS & DISTANT COWS/BUFFALOES (Speed: 0.28x) ---
    this.drawFarPastureHills(ctx, scrollDistance * 0.28, w, gY);

    // --- 5. MID-PASTURE MEADOW WITH GRAZING HERD (Speed: 0.55x) ---
    this.drawMidPastureWithHerd(ctx, scrollDistance * 0.55, w, gY);

    // --- 6. RUSTIC WOODEN FENCE & WILDFLOWERS (Speed: 0.85x) ---
    this.drawFenceAndFloraLayer(ctx, scrollDistance * 0.85, w, gY);

    // --- 7. FOREGROUND RUNNER PATH & TURF (Speed: 1.0x) ---
    this.drawForegroundPath(ctx, scrollDistance, w, h, gY);
  }

  private drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.arc(22, -8, 20, 0, Math.PI * 2);
    ctx.arc(42, 2, 18, 0, Math.PI * 2);
    ctx.arc(18, 10, 16, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawDistantMountainLayer(
    ctx: CanvasRenderingContext2D,
    offset: number,
    w: number,
    gY: number
  ) {
    const horizonY = gY - 140;
    ctx.fillStyle = '#7caed6'; // Hazy distant mountain ridge
    ctx.beginPath();
    ctx.moveTo(0, gY);

    const step = 80;
    const startX = -((offset) % (step * 8));
    for (let x = startX - step; x < w + step * 2; x += step) {
      const worldX = x + offset;
      const peak = Math.sin(worldX * 0.003) * 45 + Math.cos(worldX * 0.008) * 25;
      ctx.lineTo(x, horizonY - 40 + peak);
    }
    ctx.lineTo(w, gY);
    ctx.closePath();
    ctx.fill();
  }

  private drawFarPastureHills(
    ctx: CanvasRenderingContext2D,
    offset: number,
    w: number,
    gY: number
  ) {
    const hillBaseY = gY - 95;
    ctx.fillStyle = '#5ca865'; // Soft distant green rolling pasture
    ctx.beginPath();
    ctx.moveTo(0, gY);

    const step = 60;
    const startX = -((offset) % (step * 8));
    for (let x = startX - step; x < w + step * 2; x += step) {
      const worldX = x + offset;
      const elevation = Math.sin(worldX * 0.005) * 32 + Math.cos(worldX * 0.012) * 18;
      ctx.lineTo(x, hillBaseY + elevation);
    }
    ctx.lineTo(w, gY);
    ctx.closePath();
    ctx.fill();

    // Render distant grazing cows and buffaloes on these far hills
    this.distantAnimals.forEach(animal => {
      // Calculate screen X relative to looped offset
      let animalScreenX = ((animal.x - offset) % this.sceneLoopWidth);
      if (animalScreenX < -150) animalScreenX += this.sceneLoopWidth;

      if (animalScreenX >= -120 && animalScreenX <= w + 120) {
        const worldX = animal.x;
        const hillElevation = Math.sin(worldX * 0.005) * 32 + Math.cos(worldX * 0.012) * 18;
        const animalY = hillBaseY + hillElevation + animal.yOffset;

        drawPastureAnimal({
          ctx,
          x: animalScreenX,
          y: animalY,
          type: animal.type,
          scale: animal.scale,
          facingLeft: animal.facingLeft,
          state: animal.state,
          animTime: animal.animTimer,
          alpha: 0.85,
        });
      }
    });
  }

  private drawMidPastureWithHerd(
    ctx: CanvasRenderingContext2D,
    offset: number,
    w: number,
    gY: number
  ) {
    const pastureBaseY = gY - 45;

    // Rich rolling emerald pasture
    const pastureGrad = ctx.createLinearGradient(0, pastureBaseY - 30, 0, gY);
    pastureGrad.addColorStop(0, '#429e4e');
    pastureGrad.addColorStop(1, '#2e813a');
    ctx.fillStyle = pastureGrad;

    ctx.beginPath();
    ctx.moveTo(0, gY);
    const step = 50;
    const startX = -((offset) % (step * 8));
    for (let x = startX - step; x < w + step * 2; x += step) {
      const worldX = x + offset;
      const ridge = Math.sin(worldX * 0.006) * 22 + Math.cos(worldX * 0.015) * 12;
      ctx.lineTo(x, pastureBaseY + ridge);
    }
    ctx.lineTo(w, gY);
    ctx.closePath();
    ctx.fill();

    // Render large lush trees behind the cattle (matching the reference photo!)
    const treeSpacing = 640;
    const treeCount = Math.floor(this.sceneLoopWidth / treeSpacing);
    for (let t = 0; t < treeCount; t++) {
      const treeWorldX = t * treeSpacing + 220;
      let treeScreenX = ((treeWorldX - offset) % this.sceneLoopWidth);
      if (treeScreenX < -250) treeScreenX += this.sceneLoopWidth;

      if (treeScreenX >= -200 && treeScreenX <= w + 200) {
        const ridge = Math.sin(treeWorldX * 0.006) * 22 + Math.cos(treeWorldX * 0.015) * 12;
        const treeY = pastureBaseY + ridge;
        this.drawPastureTree(ctx, treeScreenX, treeY, 1.05);
      }
    }

    // Render mid-range cows and buffaloes
    this.midAnimals.forEach(animal => {
      let animalScreenX = ((animal.x - offset) % this.sceneLoopWidth);
      if (animalScreenX < -150) animalScreenX += this.sceneLoopWidth;

      if (animalScreenX >= -120 && animalScreenX <= w + 120) {
        const worldX = animal.x;
        const ridge = Math.sin(worldX * 0.006) * 22 + Math.cos(worldX * 0.015) * 12;
        const animalY = pastureBaseY + ridge + animal.yOffset;

        drawPastureAnimal({
          ctx,
          x: animalScreenX,
          y: animalY,
          type: animal.type,
          scale: animal.scale,
          facingLeft: animal.facingLeft,
          state: animal.state,
          animTime: animal.animTimer,
          alpha: 0.98,
        });
      }
    });
  }

  /**
   * Lush green shade tree matching the tree in the Godot screenshot
   */
  private drawPastureTree(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Tree ground shadow
    ctx.fillStyle = 'rgba(15, 35, 20, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 75, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tree trunk & branches
    ctx.fillStyle = '#6b4629';
    ctx.beginPath();
    ctx.moveTo(-16, 2);
    ctx.quadraticCurveTo(-10, -45, -6, -95);
    ctx.lineTo(8, -95);
    ctx.quadraticCurveTo(12, -45, 18, 2);
    ctx.closePath();
    ctx.fill();

    // Bark texture lines
    ctx.strokeStyle = '#4e301a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(-2, -60);
    ctx.moveTo(6, 0);
    ctx.lineTo(4, -50);
    ctx.stroke();

    // Main canopy foliage clusters (stylized layered greens)
    const foliageClusters = [
      // Base back foliage
      { x: -35, y: -110, r: 42, color: '#27672e' },
      { x: 35, y: -115, r: 40, color: '#27672e' },
      { x: 0, y: -145, r: 48, color: '#2d7835' },
      // Mid canopy
      { x: -45, y: -125, r: 35, color: '#388e3c' },
      { x: 45, y: -130, r: 36, color: '#388e3c' },
      { x: -15, y: -160, r: 38, color: '#43a047' },
      { x: 20, y: -155, r: 36, color: '#43a047' },
      // Top peak highlights (warm yellow-green foliage)
      { x: 0, y: -180, r: 32, color: '#66bb6a' },
      { x: -20, y: -140, r: 24, color: '#81c784' },
      { x: 25, y: -145, r: 22, color: '#a5d6a7' },
      { x: 0, y: -165, r: 18, color: '#c8e6c9' },
    ];

    foliageClusters.forEach(f => {
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  private drawFenceAndFloraLayer(
    ctx: CanvasRenderingContext2D,
    offset: number,
    w: number,
    gY: number
  ) {
    const fenceY = gY - 14;

    // Two horizontal rustic wooden fence rails
    ctx.strokeStyle = '#855937';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, fenceY - 16);
    ctx.lineTo(w, fenceY - 16);
    ctx.moveTo(0, fenceY - 6);
    ctx.lineTo(w, fenceY - 6);
    ctx.stroke();

    // Vertical wooden fence posts
    const postSpacing = 140;
    const postStartX = -((offset) % postSpacing);

    ctx.fillStyle = '#6b4426';
    ctx.strokeStyle = '#4e301a';
    ctx.lineWidth = 1.5;

    for (let x = postStartX; x < w + postSpacing; x += postSpacing) {
      ctx.beginPath();
      ctx.roundRect(x - 4, fenceY - 26, 8, 30, [2, 2, 0, 0]);
      ctx.fill();
      ctx.stroke();

      // Little wooden post cap
      ctx.fillStyle = '#9c6b45';
      ctx.fillRect(x - 4, fenceY - 26, 8, 3);
      ctx.fillStyle = '#6b4426';
    }

    // Little buttercup and daisy blossoms along the fence line
    const flowerSpacing = 50;
    const flowerStartX = -((offset) % flowerSpacing);
    for (let x = flowerStartX; x < w + flowerSpacing; x += flowerSpacing) {
      const fx = x + Math.sin(x * 12) * 10;
      const isDaisy = (Math.floor(x / flowerSpacing) % 2 === 0);
      ctx.fillStyle = isDaisy ? '#ffffff' : '#fcd34d';
      ctx.beginPath();
      ctx.arc(fx, fenceY + 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // Center dot
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(fx, fenceY + 6, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawForegroundPath(
    ctx: CanvasRenderingContext2D,
    offset: number,
    w: number,
    h: number,
    gY: number
  ) {
    // Turf base gradient (rich soil and lush runner track)
    const groundGrad = ctx.createLinearGradient(0, gY, 0, h);
    groundGrad.addColorStop(0, '#4b8830'); // Vibrant top grass
    groundGrad.addColorStop(0.12, '#386f21');
    groundGrad.addColorStop(0.25, '#78532f'); // Dirt track
    groundGrad.addColorStop(0.55, '#5c3d20');
    groundGrad.addColorStop(1, '#3b2513'); // Deep earth
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, gY, w, h - gY);

    // Crisp green grass blades along top edge of track
    ctx.fillStyle = '#549c37';
    const bladeStep = 12;
    const startBladeX = -((offset) % bladeStep);
    for (let x = startBladeX; x < w + bladeStep; x += bladeStep) {
      const bh = 5 + (Math.sin(x * 3) + 1) * 3;
      ctx.beginPath();
      ctx.moveTo(x, gY);
      ctx.lineTo(x + 2, gY - bh);
      ctx.lineTo(x + 4, gY);
      ctx.fill();
    }

    // Dirt track texture / pebbles speeding by
    const pebbleStep = 70;
    const startPebbleX = -((offset) % pebbleStep);
    ctx.fillStyle = 'rgba(215, 185, 145, 0.45)';
    for (let x = startPebbleX; x < w + pebbleStep; x += pebbleStep) {
      const px = x + ((Math.sin(x * 9) * 20));
      const py = gY + 16 + ((Math.cos(x * 5) * 15));
      ctx.beginPath();
      ctx.ellipse(px, py, 4, 2, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distance markers (picket stakes with small flags every 500 units)
    const markerStep = 500;
    const startMarkerX = -((offset) % markerStep);
    for (let x = startMarkerX; x < w + markerStep; x += markerStep) {
      const mx = x;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(mx - 2, gY - 18, 4, 20);
      // Small red pennant flag
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(mx + 2, gY - 18);
      ctx.lineTo(mx + 16, gY - 12);
      ctx.lineTo(mx + 2, gY - 6);
      ctx.closePath();
      ctx.fill();
    }
  }
}
