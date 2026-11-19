import { useEffect, useRef, type RefObject } from 'react';

/**
 * The home object: a five-lobed mesh (the vinca's petal count) with embers burning inside.
 * Drawn on a 2D canvas so it needs no library. `progress` is the home scroll position (0 to 4);
 * the embers burn hottest around the second scene and the canvas stops drawing once it is covered.
 */
export function Ember({ progress, reduced }: { progress: RefObject<number>; reduced: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;

    let seed = 11;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const SHELL = 360;
    const pts: number[][] = [];
    for (let i = 0; i < SHELL; i++) {
      const y = 1 - (2 * (i + 0.5)) / SHELL;
      const rr = Math.sqrt(1 - y * y);
      const phi = i * 2.39996;
      const r = (1 + 0.17 * Math.cos(5 * phi) * rr) * (1 + (rnd() - 0.5) * 0.14);
      pts.push([Math.cos(phi) * rr * r, y * r * 0.9, Math.sin(phi) * rr * r]);
    }
    for (let i = 0; i < 90; i++) {
      const y = 1 - (2 * (i + 0.5)) / 90;
      const rr = Math.sqrt(1 - y * y);
      const phi = i * 2.39996 + 1;
      const r = 0.48 + rnd() * 0.12;
      pts.push([Math.cos(phi) * rr * r, y * r, Math.sin(phi) * rr * r]);
    }
    // Join every point to its three nearest neighbours.
    const seen = new Set<string>();
    const edges: [number, number][] = [];
    for (let i = 0; i < pts.length; i++) {
      const near = pts
        .map((p, k) => [(pts[i][0] - p[0]) ** 2 + (pts[i][1] - p[1]) ** 2 + (pts[i][2] - p[2]) ** 2, k])
        .filter(([, k]) => k !== i)
        .sort((a, b) => a[0] - b[0])
        .slice(0, 3);
      for (const [, k] of near) {
        const a = Math.min(i, k), b = Math.max(i, k);
        if (!seen.has(a + ':' + b)) {
          seen.add(a + ':' + b);
          edges.push([a, b]);
        }
      }
    }
    const embers = Array.from({ length: 110 }, () => ({ a: rnd() * 6.283, y: (rnd() - 0.5) * 1.2, r: 0.08 + rnd() * 0.55, s: 0.3 + rnd() * 1.4, f: rnd() * 6.283, z: rnd() }));

    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    const sc = sprite.getContext('2d')!;
    const glow = sc.createRadialGradient(32, 32, 0, 32, 32, 32);
    glow.addColorStop(0, 'rgba(255,246,214,1)');
    glow.addColorStop(0.22, 'rgba(255,200,110,0.75)');
    glow.addColorStop(0.55, 'rgba(226,140,48,0.18)');
    glow.addColorStop(1, 'rgba(226,140,48,0)');
    sc.fillStyle = glow;
    sc.fillRect(0, 0, 64, 64);

    const proj: number[][] = new Array(pts.length);
    const draw = (now: number) => {
      const t = progress.current ?? 0;
      if (t > 2.15) return;
      // 1.5x is sharp enough for a soft, moving object and draws far fewer pixels than 2x.
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const W = cv.clientWidth, H = cv.clientHeight;
      if (!W || !H) return;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const R = Math.min(W, H) * 0.36, cx = W / 2, cy = H / 2;
      const heat = 0.35 + 0.65 * Math.max(0, 1 - Math.abs(t - 1) * 1.1);
      const ry = now * 0.00011 + t * 1.2, rx = 0.38 + Math.sin(now * 0.00021) * 0.08;
      const cY = Math.cos(ry), sY = Math.sin(ry), cX = Math.cos(rx), sX = Math.sin(rx);
      const rot = (p: number[]) => {
        const x = p[0] * cY - p[2] * sY, z = p[0] * sY + p[2] * cY;
        const y = p[1] * cX - z * sX, z2 = p[1] * sX + z * cX;
        const k = 3.2 / (3.2 + z2);
        return [cx + x * R * k, cy + y * R * k, z2];
      };
      for (let i = 0; i < pts.length; i++) proj[i] = rot(pts[i]);

      const smoke = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.95);
      smoke.addColorStop(0, 'rgba(30,22,14,0.62)');
      smoke.addColorStop(0.5, 'rgba(46,36,24,0.24)');
      smoke.addColorStop(1, 'rgba(46,36,24,0)');
      ctx.fillStyle = smoke;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.95, 0, 6.283);
      ctx.fill();

      // Near lines darker, far lines fainter, so the mesh reads as a volume.
      const buckets: [number, number][][] = [[], [], []];
      for (const e of edges) {
        const z = (proj[e[0]][2] + proj[e[1]][2]) / 2;
        buckets[z < -0.35 ? 0 : z < 0.35 ? 1 : 2].push(e);
      }
      ctx.lineWidth = 0.8;
      [0.78, 0.5, 0.24].forEach((alpha, b) => {
        ctx.strokeStyle = `rgba(27,24,19,${alpha})`;
        ctx.beginPath();
        for (const e of buckets[b]) {
          ctx.moveTo(proj[e[0]][0], proj[e[0]][1]);
          ctx.lineTo(proj[e[1]][0], proj[e[1]][1]);
        }
        ctx.stroke();
      });

      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(255,196,104,${(0.55 * heat).toFixed(3)})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let i = 0; i < edges.length; i += 9) {
        const e = edges[i];
        if (e[0] < SHELL) continue;
        ctx.moveTo(proj[e[0]][0], proj[e[0]][1]);
        ctx.lineTo(proj[e[1]][0], proj[e[1]][1]);
      }
      ctx.stroke();
      for (const m of embers) {
        const a = m.a + now * 0.0004 * m.s, rr = m.r * (0.75 + heat * 0.5);
        const p = rot([Math.cos(a) * rr, m.y * rr, Math.sin(a) * rr]);
        const flick = 0.55 + 0.45 * Math.sin(now * 0.004 * m.s + m.f);
        const size = (5 + 22 * m.z * heat) * flick * (1.25 - p[2] * 0.3);
        ctx.globalAlpha = Math.min(1, (0.25 + heat * 0.75) * flick);
        ctx.drawImage(sprite, p[0] - size / 2, p[1] - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    if (reduced) {
      // One still frame, redrawn only when the size changes.
      const still = () => draw(0);
      still();
      const observer = new ResizeObserver(still);
      observer.observe(cv);
      return () => observer.disconnect();
    }

    let raf = 0;
    let visible = true;
    const loop = (now: number) => {
      draw(now);
      raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };
    const wake = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    observer.observe(cv);
    document.addEventListener('visibilitychange', wake);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener('visibilitychange', wake);
    };
  }, [progress, reduced]);

  return <canvas ref={canvas} aria-hidden="true" />;
}
