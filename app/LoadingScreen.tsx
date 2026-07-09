"use client";

import { useEffect, useRef, useState } from "react";

const IMPACT_TIME_MS = 1430;
const SCREEN_REMOVE_TIME_MS = 5000;
const ENTRY_EXIT_TIME_MS = 180;

export default function LoadingScreen() {
  const [started, setStarted] = useState(false);
  const [entryLeaving, setEntryLeaving] = useState(false);
  const [visible, setVisible] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const entryTimerRef = useRef<number | null>(null);
  const impactTimerRef = useRef<number | null>(null);
  const removeTimerRef = useRef<number | null>(null);

  const startedRef = useRef(false);

  const startSequence = () => {
    if (startedRef.current) return;

    startedRef.current = true;
    setEntryLeaving(true);

    const audio = audioRef.current;

    /*
      Unlock audio during the user's click.
      Reset immediately so the actual sound begins
      from the start at the impact moment.
    */
    if (audio) {
      audio.volume = 0;
      audio.currentTime = 0;

      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 1;
        })
        .catch(() => {
          audio.volume = 1;
        });
    }

    /*
      Allow the entry graphic to fade out quickly,
      then mount the animated crest.
    */
    entryTimerRef.current = window.setTimeout(() => {
      setStarted(true);

      /*
        Impact timing begins when the crest animation begins.
      */
      impactTimerRef.current = window.setTimeout(() => {
        const impactAudio = audioRef.current;

        if (!impactAudio) return;

        impactAudio.volume = 1;
        impactAudio.currentTime = 0;

        impactAudio.play().catch(() => {
          // Visual sequence continues if playback fails.
        });
      }, IMPACT_TIME_MS);

      /*
        Remove the loading screen after the full animation.
      */
      removeTimerRef.current = window.setTimeout(() => {
        setVisible(false);
      }, SCREEN_REMOVE_TIME_MS);
    }, ENTRY_EXIT_TIME_MS);
  };

  useEffect(() => {
    return () => {
      if (entryTimerRef.current !== null) {
        window.clearTimeout(entryTimerRef.current);
      }

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
        <div
          className={`loading-entry ${
            entryLeaving ? "loading-entry-leaving" : ""
          }`}
        >
          <button
            type="button"
            className="loading-enter-button"
            onClick={startSequence}
            disabled={entryLeaving}
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