/**
 * Particle System for runner dust, landing squashes, collectible sparkles,
 * and high-impact collision debris (splinters, gravel, sparks).
 */

import { Particle } from '../../types/game';

export class ParticleSystem {
  private particles: Particle[] = [];

  public update(deltaTime: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * deltaTime * 60;
      p.y += p.vy * deltaTime * 60;

      // Apply gravity to debris
      if (p.shape === 'splinter' || p.shape === 'square') {
        p.vy += 0.35 * deltaTime * 60;
      }

      if (p.rotation !== undefined && p.vRot !== undefined) {
        p.rotation += p.vRot * deltaTime * 60;
      }

      p.alpha -= p.decay * deltaTime * 60;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      if (p.shape === 'splinter') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.fillRect(-p.size, -p.size / 4, p.size * 2, p.size / 2);
      } else if (p.shape === 'square') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  // Running footstep dust
  public addRunningDust(x: number, groundY: number) {
    if (Math.random() > 0.4) return;
    this.particles.push({
      x: x - 8 + (Math.random() * 6 - 3),
      y: groundY - 2,
      vx: -(1.5 + Math.random() * 2),
      vy: -(Math.random() * 1.2),
      size: 2.5 + Math.random() * 2.5,
      color: '#d6c4a5',
      alpha: 0.6,
      decay: 0.04,
      shape: 'circle',
    });
  }

  // Jump burst
  public addJumpPuff(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.PI + (Math.random() - 0.5) * 1.4;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.4,
        size: 3 + Math.random() * 3,
        color: '#e2d3bb',
        alpha: 0.7,
        decay: 0.05,
      });
    }
  }

  // Wood splinters on crate hit
  public addWoodDebris(x: number, y: number) {
    const colors = ['#b45309', '#d97706', '#92400e', '#fef08a'];
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      this.particles.push({
        x: x + (Math.random() * 20 - 10),
        y: y + (Math.random() * 20 - 10),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        size: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        decay: 0.02,
        shape: 'splinter',
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.3,
      });
    }
  }

  // Stone gravel on rock hit
  public addStoneDebris(x: number, y: number) {
    const colors = ['#64748b', '#475569', '#94a3b8', '#334155'];
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6.5;
      this.particles.push({
        x: x + (Math.random() * 20 - 10),
        y: y + (Math.random() * 20 - 10),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        decay: 0.018,
        shape: 'square',
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2,
      });
    }
  }

  // Metallic sparks on spike hit
  public addSpikeSparks(x: number, y: number) {
    const colors = ['#f59e0b', '#fbbf24', '#fef08a', '#38bdf8', '#ffffff'];
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8.5;
      this.particles.push({
        x: x + (Math.random() * 16 - 8),
        y: y + (Math.random() * 16 - 8),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        size: 2 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        decay: 0.035,
        shape: 'circle',
      });
    }
  }

  // Clover pickup sparkles
  public addCloverSparkles(x: number, y: number) {
    const colors = ['#4ade80', '#22c55e', '#a7f3d0', '#fef08a'];
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.9,
        decay: 0.03,
      });
    }
  }

  // Fire and flame explosion on campfire / fireball hit
  public addFireDebris(x: number, y: number) {
    const fireColors = ['#f97316', '#ef4444', '#dc2626', '#facc15', '#fef08a', '#ffffff'];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 8.5;
      this.particles.push({
        x: x + (Math.random() * 16 - 8),
        y: y + (Math.random() * 16 - 8),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        size: 3 + Math.random() * 4.5,
        color: fireColors[Math.floor(Math.random() * fireColors.length)],
        alpha: 1.0,
        decay: 0.025,
        shape: 'circle',
      });
    }

    // Hot smoke puffs rising
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: x + (Math.random() * 20 - 10),
        y: y + (Math.random() * 10 - 5),
        vx: (Math.random() - 0.5) * 2,
        vy: -(1.5 + Math.random() * 3),
        size: 6 + Math.random() * 8,
        color: 'rgba(30, 41, 59, 0.65)',
        alpha: 0.8,
        decay: 0.015,
        shape: 'circle',
      });
    }
  }

  public clear() {
    this.particles = [];
  }
}
