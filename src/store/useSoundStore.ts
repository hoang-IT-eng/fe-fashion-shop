import { create } from 'zustand'
import { enigmaAudio } from '../lib/enigmaAudio'

interface SoundState {
  soundEnabled: boolean
  toggleSound: () => void
  setSound: (enabled: boolean) => void
  playTick: () => void
  playChime: () => void
}

export const useSoundStore = create<SoundState>((set, get) => ({
  soundEnabled: false,

  toggleSound: () => {
    const next = !get().soundEnabled
    enigmaAudio.setEnabled(next)
    set({ soundEnabled: next })
  },

  setSound: (enabled: boolean) => {
    enigmaAudio.setEnabled(enabled)
    set({ soundEnabled: enabled })
  },

  playTick: () => {
    enigmaAudio.playWatchTick()
  },

  playChime: () => {
    enigmaAudio.playGavelChime()
  },
}))
