"use client";

import { useEffect, useRef, useState } from "react";

const IMPACT_TIME_MS = 1430;
const SCREEN_REMOVE_TIME_MS = 5000;

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const impactTimer = window.setTimeout(() => {
      const audio = audioRef.current;

      if (audio) {
        audio.currentTime = 0;

        audio.play().catch(() => {
          // Mobile browsers may block autoplay audio.
          // The visual sequence continues normally.
        });
      }
    }, IMPACT_TIME_MS);

    const removeTimer = window.setTimeout(() => {
      setVisible(false);
    }, SCREEN_REMOVE_TIME_MS);

    return () => {
      window.clearTimeout(impactTimer);
      window.clearTimeout(removeTimer);

      const audio = audioRef.current;

      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="loading-screen" aria-hidden="true">
      <audio
        ref={audioRef}
        src="/assets/audio/crest-impact.mp3"
        preload="auto"
      />

      <div className="loading-crest-stage">
        <div className="loading-smoke"></div>

        <img
          src="/assets/logos/FAFO Heritage Crest.png"
          alt=""
          className="loading-logo"
        />
      </div>
    </div>
  );
}