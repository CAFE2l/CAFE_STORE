'use client';

import { useEffect, useState } from 'react';

export function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    if (document.body) {
      document.body.classList.add('custom-cursor-enabled');
    }

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.body?.classList.remove('custom-cursor-enabled');
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <div
        className="custom-cursor"
        style={{ left: pos.x - 8, top: pos.y - 8 }}
      />
      <div
        className="custom-cursor-dot"
        style={{ left: pos.x - 3, top: pos.y - 3 }}
      />
    </>
  );
}
