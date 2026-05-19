import create from 'zustand'

type State = {
  userId?: string | null
  setUser: (id: string | null) => void
}

export const useStore = create<State>((set) => ({
  userId: null,
  setUser: (id) => set({ userId: id }),
}))
