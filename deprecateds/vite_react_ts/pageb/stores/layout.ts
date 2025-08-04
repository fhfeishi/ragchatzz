import { create } from 'zustand'

export const useLayoutStore = create<{ collapsed: boolean; toggle: () => void }>(set => ({
  collapsed: false,
  toggle: () => set(s => ({ collapsed: !s.collapsed }))
}))