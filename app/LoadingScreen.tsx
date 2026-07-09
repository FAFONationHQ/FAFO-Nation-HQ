"use client";

import { useEffect, useRef, useState } from "react";

const IMPACT_TIME_MS = 1430;
const SCREEN_REMOVE_TIME_MS = 5000;

export default function LoadingScreen() {
  const [started, setStarted] = useState(false);
  const [visible, setVisible] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const impactTimerRef = useRef<number | null>(null);
  const removeTimerRef = useRef<number | null>(null);

  const startSequence = () => {
    if (started) return;

    const audio = audioRef.current;

    /*
      Start playback directly inside the user's tap event.
      Keep the audio silent until the visual impact moment.
      This preserves browser permission for audible playback.
    */
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0;

      audio.play().catch(() => {
        // Visual sequence still continues if playback fails.
      });
    }

    setStarted(true);

    impactTimerRef.current = window.setTimeout(() => {
      if (audio) {
        audio.volume = 1;
      }
    }, IMPACT_TIME_MS);

    removeTimerRef.current = window.setTimeout(() => {
      setVisible(false);
    }, SCREEN_REMOVE_TIME_MS);
  };

  useEffect(() => {
    return () => {
      if (impactTimerRef.current !== null) {
        window.clearTimeout(impactTimerRef.current);
      }

      if (removeTimerRef.current !== null) {
        window.clearTimeout(removeTimerRef.current);
      }

      const audio = audioRef.current;

      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`loading-screen ${
        started ? "loading-screen-started" : "loading-screen-waiting"
      }`}
    >
      <audio
        ref={audioRef}
        src="/assets/audio/crest-impact.mp3"
        preload="auto"
      />

      {!started && (
        <div className="loading-entry">
          <img
            src="/assets/logos/FAFO Heritage Crest.png"
            alt="FAFO Nation"
            className="loading-entry-crest"
          />

          <button
            type="button"
            className="loading-enter-button"
            onClick={startSequence}
            aria-label="Enter FAFO Nation"
          >
            <img
              src="/assets/ui/enter-fafo-nation.png"
              alt=""
              className="loading-enter-graphic"
            />
          </button>
        </div>
      )}

      {started && (
        <div className="loading-crest-stage">
          <div className="loading-smoke"></div>

          <img
            src="/assets/logos/FAFO Heritage Crest.png"
            alt=""
            className="loading-logo"
          />
        </div>
      )}
    </div>
  );
}