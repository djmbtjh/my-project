import React from 'react';

export default function BackgroundGrid({ showScanlines = true }) {
  return (
    <>
      <div className="cyber-bg-container">
        <div className="cyber-grid" />
        <div className="ambient-glow-1" />
        <div className="ambient-glow-2" />
      </div>
      {showScanlines && <div className="scanlines-overlay" />}
    </>
  );
}
