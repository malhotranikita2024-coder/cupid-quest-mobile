import React from 'react';
import { TutorialDebugInfo, resetTutorialStorage, setTutorialDebugMode } from '@/hooks/useTutorialNudges';

interface TutorialDebugOverlayProps {
  info: TutorialDebugInfo;
  levelId: number;
}

export function TutorialDebugOverlay({ info, levelId }: TutorialDebugOverlayProps) {
  return (
    <div
      className="fixed top-2 left-2 z-[100] pointer-events-auto"
      style={{
        background: 'hsl(0 0% 0% / 0.8)',
        color: 'hsl(120 80% 70%)',
        fontFamily: 'monospace',
        fontSize: '11px',
        padding: '8px 12px',
        borderRadius: '8px',
        lineHeight: 1.6,
        minWidth: '220px',
      }}
    >
      <div style={{ color: 'hsl(50 100% 70%)', fontWeight: 'bold', marginBottom: 4 }}>
        🛠 Tutorial Debug
      </div>
      <div>Level: <b>{levelId}</b></div>
      <div>System mounted: <b>{info.mounted ? '✅' : '❌'}</b></div>
      <div>Active nudge: <b>{info.activeType ?? 'none'}</b></div>
      <div>Queue length: <b>{info.queueLength}</b></div>
      <div>Last trigger: <b>{info.lastTrigger ?? 'none'}</b></div>
      <div>Seen count: <b>{info.seenCount}</b></div>
      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        <button
          onClick={() => {
            resetTutorialStorage();
            window.location.reload();
          }}
          style={{
            padding: '4px 10px',
            background: 'hsl(0 70% 55%)',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: '11px',
            fontWeight: 'bold',
          }}
        >
          🔄 Reset
        </button>
        <button
          onClick={() => {
            setTutorialDebugMode(false);
            window.location.reload();
          }}
          style={{
            padding: '4px 10px',
            background: 'hsl(200 70% 45%)',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: '11px',
            fontWeight: 'bold',
          }}
        >
          ✖ Exit Debug
        </button>
      </div>
    </div>
  );
}
