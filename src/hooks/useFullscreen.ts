import { useState, useEffect, useCallback } from 'react';

interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenEnabled?: boolean;
  msFullscreenElement?: Element | null;
  msExitFullscreen?: () => Promise<void> | void;
}

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
}

function getFullscreenElement(): Element | null {
  if (typeof document === 'undefined') return null;
  const doc = document as FullscreenDocument;
  return (
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.msFullscreenElement ||
    null
  );
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => Boolean(getFullscreenElement()));

  useEffect(() => {
    const syncState = () => {
      setIsFullscreen(Boolean(getFullscreenElement()));
    };

    document.addEventListener('fullscreenchange', syncState);
    document.addEventListener('webkitfullscreenchange', syncState);
    document.addEventListener('MSFullscreenChange', syncState);
    return () => {
      document.removeEventListener('fullscreenchange', syncState);
      document.removeEventListener('webkitfullscreenchange', syncState);
      document.removeEventListener('MSFullscreenChange', syncState);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return;
    const doc = document as FullscreenDocument;
    const root = document.documentElement as FullscreenElement;

    try {
      if (getFullscreenElement()) {
        if (typeof doc.exitFullscreen === 'function') {
          await doc.exitFullscreen();
        } else if (typeof doc.webkitExitFullscreen === 'function') {
          await doc.webkitExitFullscreen();
        } else if (typeof doc.msExitFullscreen === 'function') {
          await doc.msExitFullscreen();
        }
      } else {
        if (typeof root.requestFullscreen === 'function') {
          await root.requestFullscreen();
        } else if (typeof root.webkitRequestFullscreen === 'function') {
          await root.webkitRequestFullscreen();
        } else if (typeof root.msRequestFullscreen === 'function') {
          await root.msRequestFullscreen();
        }
      }
    } catch {
      // Ignore fullscreen denial in restricted iframes or unsupported mobile browsers
    } finally {
      setIsFullscreen(Boolean(getFullscreenElement()));
    }
  }, []);

  return { isFullscreen, toggleFullscreen };
}
