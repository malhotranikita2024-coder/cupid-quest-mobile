import { useRef, useCallback, useEffect } from 'react';
import { useState } from 'react';

// Simple 8-bit style audio generation using Web Audio API
class RetroAudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicEnabled: boolean = true;
  private sfxEnabled: boolean = true;
  private bgMusicOsc: OscillatorNode[] = [];
  private bgMusicGain: GainNode | null = null;
  private bgMusicInterval: number | null = null;
  private menuMusicInterval: number | null = null;
  private menuMusicGain: GainNode | null = null;
  private menuMusicPlaying: boolean = false;
  private bgMusicPlaying: boolean = false;

  init() {
    if (this.audioContext) {
      // Resume if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      return;
    }
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Resume context if suspended (for autoplay policy)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.8; // Higher master volume
      console.log('Audio engine initialized successfully');
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  isInitialized(): boolean {
    return this.audioContext !== null;
  }

  isMenuMusicPlaying(): boolean {
    return this.menuMusicPlaying;
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    console.log('Music enabled set to:', enabled);
    if (!enabled) {
      this.stopBackgroundMusic();
      this.stopMenuMusic(false);
    }
  }

  setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'square', volume: number = 0.3) {
    if (!this.audioContext || !this.masterGain || !this.sfxEnabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playJump() {
    if (!this.sfxEnabled) return;
    this.init();
    // Rising sweep for jump
    const ctx = this.audioContext;
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  playCollect() {
    if (!this.sfxEnabled) return;
    this.init();
    // Happy chime
    setTimeout(() => this.playTone(880, 0.1, 'square', 0.15), 0);
    setTimeout(() => this.playTone(1100, 0.1, 'square', 0.15), 50);
    setTimeout(() => this.playTone(1320, 0.15, 'square', 0.15), 100);
  }

  playCookieCollect() {
    if (!this.sfxEnabled) return;
    this.init();
    // Magical sparkle sound
    const notes = [523, 659, 784, 880, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'sine', 0.2), i * 60);
    });
  }

  playBlockHit() {
    if (!this.sfxEnabled) return;
    this.init();
    this.playTone(150, 0.08, 'square', 0.25);
    setTimeout(() => this.playTone(200, 0.05, 'square', 0.15), 40);
  }

  playEnemyStomp() {
    if (!this.sfxEnabled) return;
    this.init();
    this.playTone(400, 0.05, 'square', 0.2);
    setTimeout(() => this.playTone(200, 0.1, 'square', 0.15), 30);
  }

  playDeath() {
    if (!this.sfxEnabled) return;
    this.init();
    // Classic descending death jingle
    const notes = [440, 415, 392, 370, 349, 330, 311, 294, 277, 262];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.12, 'square', 0.25), i * 80);
    });
  }

  playGameOver() {
    if (!this.sfxEnabled) return;
    this.init();
    // Sad game over tone
    setTimeout(() => this.playTone(392, 0.3, 'square', 0.2), 0);
    setTimeout(() => this.playTone(330, 0.3, 'square', 0.2), 300);
    setTimeout(() => this.playTone(262, 0.5, 'square', 0.2), 600);
  }

  playLevelComplete() {
    if (!this.sfxEnabled) return;
    this.init();
    // Victory fanfare
    const melody = [
      { freq: 523, dur: 0.1 },
      { freq: 659, dur: 0.1 },
      { freq: 784, dur: 0.1 },
      { freq: 1047, dur: 0.3 },
      { freq: 784, dur: 0.1 },
      { freq: 1047, dur: 0.4 },
    ];
    let time = 0;
    melody.forEach((note) => {
      setTimeout(() => this.playTone(note.freq, note.dur, 'square', 0.2), time);
      time += note.dur * 800;
    });
  }

  playCheckpoint() {
    if (!this.sfxEnabled) return;
    this.init();
    this.playTone(440, 0.1, 'square', 0.15);
    setTimeout(() => this.playTone(554, 0.1, 'square', 0.15), 100);
    setTimeout(() => this.playTone(659, 0.2, 'square', 0.15), 200);
  }

  playFireball() {
    if (!this.sfxEnabled) return;
    this.init();
    // Whoosh sound for fireball
    const ctx = this.audioContext;
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

   playShieldActivate() {
     if (!this.sfxEnabled) return;
     this.init();
     const ctx = this.audioContext;
     if (!ctx || !this.masterGain) return;
 
     // Magical ascending arpeggio with shimmer effect
     const notes = [440, 554, 659, 880, 1047, 1319];
     notes.forEach((freq, i) => {
       setTimeout(() => {
         if (!ctx || !this.masterGain) return;
         
         // Main tone
         const osc = ctx.createOscillator();
         const gain = ctx.createGain();
         osc.connect(gain);
         gain.connect(this.masterGain!);
         osc.type = 'sine';
         osc.frequency.value = freq;
         gain.gain.setValueAtTime(0.2, ctx.currentTime);
         gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
         osc.start(ctx.currentTime);
         osc.stop(ctx.currentTime + 0.2);
 
         // Shimmer harmonic
         const shimmer = ctx.createOscillator();
         const shimmerGain = ctx.createGain();
         shimmer.connect(shimmerGain);
         shimmerGain.connect(this.masterGain!);
         shimmer.type = 'triangle';
         shimmer.frequency.value = freq * 2;
         shimmerGain.gain.setValueAtTime(0.1, ctx.currentTime);
         shimmerGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
         shimmer.start(ctx.currentTime);
         shimmer.stop(ctx.currentTime + 0.15);
       }, i * 50);
     });
   }
 
  startBackgroundMusic() {
    if (!this.musicEnabled) return;
    this.init();
    if (!this.audioContext || !this.masterGain) return;
    
    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // Don't restart if already playing
    if (this.bgMusicPlaying) return;

    // Stop existing music
    this.stopBackgroundMusic();

    this.bgMusicGain = this.audioContext.createGain();
    this.bgMusicGain.connect(this.masterGain);
    this.bgMusicGain.gain.value = 0.35; // 35% volume for gameplay music
    
    this.bgMusicPlaying = true;
    console.log('Background music started');

    // Simple looping melody pattern
    const bassPattern = [131, 165, 196, 165]; // C3, E3, G3, E3
    const melodyPattern = [392, 440, 494, 523, 494, 440, 392, 330]; // Adventurous melody

    let bassIdx = 0;
    let melodyIdx = 0;

    this.bgMusicInterval = window.setInterval(() => {
      if (!this.audioContext || !this.bgMusicGain || !this.musicEnabled) return;
      
      const currentTime = this.audioContext.currentTime;

      // Bass note
      const bassOsc = this.audioContext.createOscillator();
      const bassGain = this.audioContext.createGain();
      bassOsc.connect(bassGain);
      bassGain.connect(this.bgMusicGain);
      bassOsc.type = 'triangle';
      bassOsc.frequency.value = bassPattern[bassIdx % bassPattern.length];
      bassGain.gain.setValueAtTime(0.4, currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.25);
      bassOsc.start(currentTime);
      bassOsc.stop(currentTime + 0.25);
      bassIdx++;

      // Melody note every 2 beats
      if (bassIdx % 2 === 0) {
        const melodyOsc = this.audioContext.createOscillator();
        const melodyGainNode = this.audioContext.createGain();
        melodyOsc.connect(melodyGainNode);
        melodyGainNode.connect(this.bgMusicGain);
        melodyOsc.type = 'square';
        melodyOsc.frequency.value = melodyPattern[melodyIdx % melodyPattern.length];
        melodyGainNode.gain.setValueAtTime(0.25, currentTime);
        melodyGainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);
        melodyOsc.start(currentTime);
        melodyOsc.stop(currentTime + 0.2);
        melodyIdx++;
      }
    }, 220); // Slightly faster tempo for gameplay
  }

  stopBackgroundMusic() {
    this.bgMusicPlaying = false;
    if (this.bgMusicInterval) {
      clearInterval(this.bgMusicInterval);
      this.bgMusicInterval = null;
    }
    this.bgMusicOsc.forEach(osc => {
      try { osc.stop(); } catch {}
    });
    this.bgMusicOsc = [];
  }

  startMenuMusic() {
    if (!this.musicEnabled) return;
    this.init();
    if (!this.audioContext || !this.masterGain) return;
    
    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // Don't restart if already playing
    if (this.menuMusicPlaying) return;

    // Stop existing menu music
    this.stopMenuMusic(false);

    this.menuMusicGain = this.audioContext.createGain();
    this.menuMusicGain.connect(this.masterGain);
    this.menuMusicGain.gain.value = 0.45; // 45% volume for menu music
    
    this.menuMusicPlaying = true;
    console.log('Menu music started');

    // Cheerful Mario-style menu melody
    // C major scale with happy bouncy feel
    const melodyPattern = [
      { note: 523, dur: 0.15 },  // C5
      { note: 587, dur: 0.15 },  // D5
      { note: 659, dur: 0.15 },  // E5
      { note: 523, dur: 0.15 },  // C5
      { note: 659, dur: 0.15 },  // E5
      { note: 784, dur: 0.3 },   // G5
      { note: 784, dur: 0.15 },  // G5
      { note: 0, dur: 0.15 },    // Rest
      { note: 392, dur: 0.15 },  // G4
      { note: 440, dur: 0.15 },  // A4
      { note: 494, dur: 0.15 },  // B4
      { note: 392, dur: 0.15 },  // G4
      { note: 494, dur: 0.15 },  // B4
      { note: 523, dur: 0.3 },   // C5
      { note: 523, dur: 0.15 },  // C5
      { note: 0, dur: 0.15 },    // Rest
    ];

    const bassPattern = [
      { note: 131, dur: 0.25 },  // C3
      { note: 165, dur: 0.25 },  // E3
      { note: 196, dur: 0.25 },  // G3
      { note: 165, dur: 0.25 },  // E3
    ];

    let melodyIdx = 0;
    let bassIdx = 0;
    let beatCount = 0;

    this.menuMusicInterval = window.setInterval(() => {
      if (!this.audioContext || !this.menuMusicGain || !this.musicEnabled) return;

      const currentTime = this.audioContext.currentTime;

      // Play bass note every beat
      const bassNote = bassPattern[bassIdx % bassPattern.length];
      if (bassNote.note > 0) {
        const bassOsc = this.audioContext.createOscillator();
        const bassGainNode = this.audioContext.createGain();
        bassOsc.connect(bassGainNode);
        bassGainNode.connect(this.menuMusicGain);
        bassOsc.type = 'triangle';
        bassOsc.frequency.value = bassNote.note;
        bassGainNode.gain.setValueAtTime(0.45, currentTime);
        bassGainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + bassNote.dur);
        bassOsc.start(currentTime);
        bassOsc.stop(currentTime + bassNote.dur);
      }
      bassIdx++;

      // Play melody note every beat
      if (beatCount % 1 === 0) {
        const melodyNote = melodyPattern[melodyIdx % melodyPattern.length];
        if (melodyNote.note > 0) {
          const melodyOsc = this.audioContext.createOscillator();
          const melodyGainNode = this.audioContext.createGain();
          melodyOsc.connect(melodyGainNode);
          melodyGainNode.connect(this.menuMusicGain);
          melodyOsc.type = 'square';
          melodyOsc.frequency.value = melodyNote.note;
          melodyGainNode.gain.setValueAtTime(0.3, currentTime);
          melodyGainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + melodyNote.dur);
          melodyOsc.start(currentTime);
          melodyOsc.stop(currentTime + melodyNote.dur);

          // Add a subtle harmony
          const harmonyOsc = this.audioContext.createOscillator();
          const harmonyGainNode = this.audioContext.createGain();
          harmonyOsc.connect(harmonyGainNode);
          harmonyGainNode.connect(this.menuMusicGain);
          harmonyOsc.type = 'sine';
          harmonyOsc.frequency.value = melodyNote.note * 0.5; // Octave below
          harmonyGainNode.gain.setValueAtTime(0.15, currentTime);
          harmonyGainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + melodyNote.dur * 0.8);
          harmonyOsc.start(currentTime);
          harmonyOsc.stop(currentTime + melodyNote.dur * 0.8);
        }
        melodyIdx++;
      }
      beatCount++;
    }, 200); // Tempo: 300 BPM feel (upbeat)
  }

  stopMenuMusic(fadeOut: boolean = false): Promise<void> {
    return new Promise((resolve) => {
      this.menuMusicPlaying = false;
      
      const fadeTime = fadeOut ? 600 : 0;
      
      if (fadeOut && this.menuMusicGain && this.audioContext) {
        this.menuMusicGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.6);
      }
      
      setTimeout(() => {
        if (this.menuMusicInterval) {
          clearInterval(this.menuMusicInterval);
          this.menuMusicInterval = null;
        }
        resolve();
      }, fadeTime);
    });
  }
}

const audioEngine = new RetroAudioEngine();

export function useAudio(musicEnabled: boolean, sfxEnabled: boolean) {
  const initializedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    audioEngine.setMusicEnabled(musicEnabled);
  }, [musicEnabled]);

  useEffect(() => {
    audioEngine.setSfxEnabled(sfxEnabled);
  }, [sfxEnabled]);

  const initAudio = useCallback(() => {
    if (!initializedRef.current) {
      audioEngine.init();
      initializedRef.current = true;
    }
  }, []);

  const isAudioReady = useCallback(() => {
    return audioEngine.isInitialized();
  }, []);

  const isMenuMusicPlaying = useCallback(() => {
    return audioEngine.isMenuMusicPlaying();
  }, []);

  const playJump = useCallback(() => {
    audioEngine.playJump();
  }, []);

  const playCollect = useCallback(() => {
    audioEngine.playCollect();
  }, []);

  const playCookieCollect = useCallback(() => {
    audioEngine.playCookieCollect();
  }, []);

  const playBlockHit = useCallback(() => {
    audioEngine.playBlockHit();
  }, []);

  const playEnemyStomp = useCallback(() => {
    audioEngine.playEnemyStomp();
  }, []);

  const playDeath = useCallback(() => {
    audioEngine.playDeath();
  }, []);

  const playGameOver = useCallback(() => {
    audioEngine.playGameOver();
  }, []);

  const playLevelComplete = useCallback(() => {
    audioEngine.playLevelComplete();
  }, []);

  const playCheckpoint = useCallback(() => {
    audioEngine.playCheckpoint();
  }, []);

  const playFireball = useCallback(() => {
    audioEngine.playFireball();
  }, []);

   const playShieldActivate = useCallback(() => {
     audioEngine.playShieldActivate();
   }, []);
 
  const startBackgroundMusic = useCallback(() => {
    audioEngine.startBackgroundMusic();
  }, []);

  const stopBackgroundMusic = useCallback(() => {
    audioEngine.stopBackgroundMusic();
  }, []);

  const startMenuMusic = useCallback(() => {
    audioEngine.startMenuMusic();
    setIsPlaying(true);
  }, []);

  const stopMenuMusic = useCallback((fadeOut: boolean = false) => {
    audioEngine.stopMenuMusic(fadeOut);
    setIsPlaying(false);
  }, []);

  return {
    initAudio,
    isAudioReady,
    isMenuMusicPlaying,
    isPlaying,
    playJump,
    playCollect,
    playCookieCollect,
    playBlockHit,
    playEnemyStomp,
    playDeath,
    playGameOver,
    playLevelComplete,
    playCheckpoint,
    playFireball,
     playShieldActivate,
    startBackgroundMusic,
    stopBackgroundMusic,
    startMenuMusic,
    stopMenuMusic,
  };
}
