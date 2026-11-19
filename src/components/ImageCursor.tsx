import { useEffect, useRef } from 'react';
import cursorImg from './assets/large-cursor.png';

export default function ImageCursor() {
  const cursorRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      const cursor = cursorRef.current;
      if (!cursor) return;
      requestAnimationFrame(() => {
        cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      });
    };

    window.addEventListener('pointermove', moveCursor);
    return () => window.removeEventListener('pointermove', moveCursor);
  }, []);

  return (
    <img
      ref={cursorRef}
      src={cursorImg}
      alt=""
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '64px',
        height: '64px',
        pointerEvents: 'none', // Lets clicks pass through to elements underneath
        zIndex: 9999,
      }}
    />
  );
}