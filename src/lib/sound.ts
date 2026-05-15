"use client";

class SoundEngine {
  private audioCtx: AudioContext | null = null;

  private init() {
    if (typeof window !== "undefined" && !this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public playStep() {
    this.init();
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.audioCtx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);
    
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.05);
  }

  public playDice() {
    this.init();
    if (!this.audioCtx) return;
    // Simple noise for dice
    const bufferSize = this.audioCtx.sampleRate * 0.2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const gainNode = this.audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);
    
    noise.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);
    noise.start();
  }

  public playCoin() {
    this.init();
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, this.audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);
    
    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);
    
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.3);
  }

  public playError() {
    this.init();
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);
    
    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);
    
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.3);
  }

  public playTada() {
    this.init();
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(400, this.audioCtx.currentTime);
    osc.frequency.setValueAtTime(600, this.audioCtx.currentTime + 0.1);
    osc.frequency.setValueAtTime(800, this.audioCtx.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.4);
    
    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);
    
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.4);
  }
}

export const soundEngine = new SoundEngine();
