/**
 * ScrollVideo.tsx
 * ---------------
 * Frame-by-frame canvas scrubber driven by page scroll.
 * Ported from kmct_hackethone/frontend/src/components/ScrollVideo.jsx.
 *
 * - Tries `${framesDir}/meta.json` -> preloads `frame_XXXX.jpg` with
 *   keyframe priority (every 4th frame first, 8 parallel queues).
 * - If frames are absent (no public/frames in this project), it hides
 *   itself and lets the CSS animated fallback behind it show through.
 * - Object-cover draw, resize-aware, scroll-synced.
 */

import { useRef, useEffect, useState, useCallback } from 'react';

interface ScrollVideoProps {
  framesDir?: string;
  poster?: string;
  onReadyChange?: (ready: boolean) => void;
}

export function ScrollVideo({ framesDir = '/frames', poster, onReadyChange }: ScrollVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedMapRef = useRef<Set<number>>(new Set());
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const totalFramesRef = useRef(192);

  const [loadedCount, setLoadedCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [framesAvailable, setFramesAvailable] = useState(true);

  const markReady = useCallback(
    (ready: boolean) => {
      setIsReady((prev) => {
        if (prev !== ready) onReadyChange?.(ready);
        return ready;
      });
    },
    [onReadyChange],
  );

  const drawFrame = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const total = totalFramesRef.current;
    if (total <= 0) return;

    const clampedIdx = Math.max(0, Math.min(total - 1, frameIdx));
    const images = imagesRef.current;

    let imgToDraw = images[clampedIdx];
    if (!imgToDraw || !imgToDraw.complete || imgToDraw.naturalWidth === 0) {
      let bestDist = Infinity;
      let bestIdx = -1;
      for (const loadedIdx of loadedMapRef.current) {
        const dist = Math.abs(loadedIdx - clampedIdx);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = loadedIdx;
        }
      }
      if (bestIdx >= 0) imgToDraw = images[bestIdx];
    }
    if (!imgToDraw || !imgToDraw.complete || imgToDraw.naturalWidth === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cw = canvas.width;
    const ch = canvas.height;
    if (cw === 0 || ch === 0) return;

    const imgW = imgToDraw.naturalWidth;
    const imgH = imgToDraw.naturalHeight;
    const scale = Math.max(cw / imgW, ch / imgH);
    const dw = imgW * scale;
    const dh = imgH * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(imgToDraw, dx, dy, dw, dh);
    currentFrameRef.current = clampedIdx;
  }, []);

  const scheduleDraw = useCallback(
    (targetIdx: number) => {
      targetFrameRef.current = targetIdx;
      drawFrame(targetIdx);
    },
    [drawFrame],
  );

  // Canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(targetFrameRef.current);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [drawFrame]);

  // Preload frames with keyframe priority
  useEffect(() => {
    let isCancelled = false;

    fetch(`${framesDir}/meta.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`meta.json HTTP ${r.status}`);
        return r.json();
      })
      .then((meta: { totalFrames?: number }) => {
        if (isCancelled) return;
        const count = meta.totalFrames || 192;
        totalFramesRef.current = count;
        startPreloading(count);
      })
      .catch(() => {
        // No frames bundle in this project -> signal fallback mode.
        if (isCancelled) return;
        setFramesAvailable(false);
      });

    function startPreloading(total: number) {
      imagesRef.current = new Array(total);
      loadedMapRef.current.clear();
      let loaded = 0;

      const priorityQueue: number[] = [];
      for (let i = 0; i < total; i += 4) priorityQueue.push(i);
      for (let i = 0; i < total; i++) if (i % 4 !== 0) priorityQueue.push(i);

      function loadNext(queueIdx: number) {
        if (queueIdx >= priorityQueue.length || isCancelled) return;
        const frameIndex = priorityQueue[queueIdx];
        const img = new Image();

        img.onload = () => {
          if (isCancelled) return;
          loadedMapRef.current.add(frameIndex);
          loaded++;
          setLoadedCount(loaded);
          if (frameIndex === 0) {
            markReady(true);
            drawFrame(0);
          }
          const target = targetFrameRef.current;
          const current = currentFrameRef.current;
          if (Math.abs(frameIndex - target) < Math.abs(current - target)) {
            drawFrame(target);
          }
          if (loaded >= 4) markReady(true);
        };

        img.onerror = () => {
          if (isCancelled) return;
          loaded++;
          setLoadedCount(loaded);
          // If even frame 0 fails, fall back to CSS background.
          if (frameIndex === 0 && loaded < 4) setFramesAvailable(false);
        };

        const padded = String(frameIndex).padStart(4, '0');
        img.src = `${framesDir}/frame_${padded}.jpg`;
        imagesRef.current[frameIndex] = img;
        loadNext(queueIdx + 1);
      }

      const concurrency = 8;
      for (let c = 0; c < concurrency; c++) {
        loadNext(c * Math.floor(priorityQueue.length / concurrency));
      }
    }

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [framesDir]);

  // Sync frame with scroll
  useEffect(() => {
    if (!framesAvailable) return;
    const onScroll = () => {
      const total = totalFramesRef.current;
      if (total <= 0) return;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, scrollTop / maxScroll));
      const targetIdx = Math.min(total - 1, Math.round(progress * (total - 1)));
      scheduleDraw(targetIdx);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [scheduleDraw, framesAvailable]);

  if (!framesAvailable) return null;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none" aria-hidden="true">
      {poster && !isReady && (
        <img
          src={poster}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        />
      )}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ opacity: isReady ? 1 : 0, transition: 'opacity 0.3s ease-out' }}
      />
      {loadedCount > 0 && !isReady && (
        <span className="sr-only">Loading secure background ({loadedCount} frames)</span>
      )}
    </div>
  );
}
