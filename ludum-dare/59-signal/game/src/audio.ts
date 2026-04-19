// @ts-expect-error - jsfxr has no types shipped
import { sfxr } from 'jsfxr';

type Cue = 'click' | 'wrong' | 'right' | 'page';

type Sound = {
  play: () => void;
};

// Hand-tuned jsfxr params. Params follow the SfxrParams schema; we build
// objects via sfxr.b58decode(...) by way of a base58 string, OR we can set
// the fields directly. jsfxr accepts a params object via sfxr.toAudio(params)
// and returns an Audio-like wrapper with .play(). Kept minimal and readable.

function makeParams(preset: {
  wave_type?: number;
  p_env_attack?: number;
  p_env_sustain?: number;
  p_env_decay?: number;
  p_env_punch?: number;
  p_base_freq?: number;
  p_freq_limit?: number;
  p_freq_ramp?: number;
  p_freq_dramp?: number;
  p_vib_strength?: number;
  p_vib_speed?: number;
  p_arp_mod?: number;
  p_arp_speed?: number;
  p_duty?: number;
  p_duty_ramp?: number;
  p_repeat_speed?: number;
  p_pha_offset?: number;
  p_pha_ramp?: number;
  p_lpf_freq?: number;
  p_lpf_ramp?: number;
  p_lpf_resonance?: number;
  p_hpf_freq?: number;
  p_hpf_ramp?: number;
  sound_vol?: number;
  sample_rate?: number;
  sample_size?: number;
}) {
  return {
    oldParams: true,
    wave_type: 0,
    p_env_attack: 0,
    p_env_sustain: 0.1,
    p_env_punch: 0,
    p_env_decay: 0.2,
    p_base_freq: 0.3,
    p_freq_limit: 0,
    p_freq_ramp: 0,
    p_freq_dramp: 0,
    p_vib_strength: 0,
    p_vib_speed: 0,
    p_arp_mod: 0,
    p_arp_speed: 0,
    p_duty: 0,
    p_duty_ramp: 0,
    p_repeat_speed: 0,
    p_pha_offset: 0,
    p_pha_ramp: 0,
    p_lpf_freq: 1,
    p_lpf_ramp: 0,
    p_lpf_resonance: 0,
    p_hpf_freq: 0,
    p_hpf_ramp: 0,
    sound_vol: 0.25,
    sample_rate: 44100,
    sample_size: 8,
    ...preset,
  };
}

// Presets tuned by ear (per spec): keep each cue short and warm.
// click - square blip, very short decay, slight HPF
const CLICK = makeParams({
  wave_type: 0, // square
  p_env_attack: 0,
  p_env_sustain: 0.02,
  p_env_decay: 0.08,
  p_base_freq: 0.5,
  p_freq_ramp: -0.25,
  p_hpf_freq: 0.12,
  p_duty: 0.3,
  sound_vol: 0.18,
});

// wrong - low sawtooth buzz
const WRONG = makeParams({
  wave_type: 1, // sawtooth
  p_env_attack: 0,
  p_env_sustain: 0.14,
  p_env_decay: 0.12,
  p_base_freq: 0.17,
  p_freq_ramp: -0.08,
  p_vib_strength: 0.32,
  p_vib_speed: 0.5,
  p_lpf_freq: 0.45,
  p_lpf_resonance: 0.3,
  sound_vol: 0.22,
});

// right - warm ascending triad via arp + sine
const RIGHT = makeParams({
  wave_type: 2, // sine
  p_env_attack: 0.02,
  p_env_sustain: 0.35,
  p_env_decay: 0.35,
  p_base_freq: 0.38,
  p_freq_ramp: 0.08,
  p_arp_mod: 0.45,
  p_arp_speed: 0.55,
  p_lpf_freq: 1,
  sound_vol: 0.24,
});

// page - noise burst, short, high-passed to approximate paper
const PAGE = makeParams({
  wave_type: 3, // noise
  p_env_attack: 0,
  p_env_sustain: 0.05,
  p_env_decay: 0.14,
  p_base_freq: 0.62,
  p_freq_ramp: -0.2,
  p_hpf_freq: 0.4,
  p_lpf_freq: 0.8,
  sound_vol: 0.18,
});

const PRESETS: Record<Cue, ReturnType<typeof makeParams>> = {
  click: CLICK,
  wrong: WRONG,
  right: RIGHT,
  page: PAGE,
};

// localStorage is unavailable in the LD embed sandbox — wrap access so
// the game degrades to in-memory-only mute state rather than crashing.
function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function lsSet(key: string, val: string): void {
  try {
    localStorage.setItem(key, val);
  } catch {
    // no-op: embed sandbox, private-browsing, etc.
  }
}

class AudioBank {
  private sounds: Partial<Record<Cue, Sound>> = {};
  private _muted = false;
  private ready = false;

  constructor() {
    this._muted = lsGet('ld59-muted') === '1';
  }

  init() {
    if (this.ready) return;
    try {
      for (const [cue, params] of Object.entries(PRESETS) as [
        Cue,
        ReturnType<typeof makeParams>,
      ][]) {
        // jsfxr returns a small object with a .play() method (wraps an
        // HTMLAudioElement). This is plenty performant for our ≤ 4 cues.
        this.sounds[cue] = sfxr.toAudio(params) as Sound;
      }
      this.ready = true;
    } catch (err) {
      // Safari / iOS may refuse Audio construction before a user gesture.
      // We'll retry lazily on next play().
      // eslint-disable-next-line no-console
      console.warn('Audio init deferred', err);
    }
  }

  play(cue: Cue) {
    if (this._muted) return;
    if (!this.ready) this.init();
    const s = this.sounds[cue];
    if (!s) return;
    try {
      s.play();
    } catch {
      // swallow - autoplay policies etc.
    }
  }

  get muted() {
    return this._muted;
  }

  toggleMute(): boolean {
    this._muted = !this._muted;
    lsSet('ld59-muted', this._muted ? '1' : '0');
    return this._muted;
  }
}

export const audio = new AudioBank();
