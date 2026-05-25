import { create } from 'zustand'

type VariantMap = Record<string, string>

type State = {
  store: Record<string, VariantMap>
  setSelected: (productId: string, variants: VariantMap) => void
  getSelected: (productId: string) => VariantMap | undefined
}

export const useVariantStore = create<State>((set, get) => ({
  store: {},
  setSelected: (productId, variants) => set((s) => ({ store: { ...s.store, [productId]: variants } })),
  getSelected: (productId) => get().store[productId],
}))
