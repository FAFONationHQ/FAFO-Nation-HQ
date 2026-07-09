"use client";

import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="loading-screen">
      <img
        src="/assets/logos/FAFO Heritage Crest.png"
        alt="FAFO Nation Heritage Crest"
        className="loading-logo"
      />

      <h1>INITIALIZING FAFO NATION HQ</h1>

      <div className="loading-bar">
        <div className="loading-progress"></div>
      </div>
    </div>
  );
}