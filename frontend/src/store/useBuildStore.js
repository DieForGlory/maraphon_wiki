import { create } from 'zustand';

export const useBuildStore = create((set) => ({
  shell: null,
  cores: [],
  weapons: [],
  implants: [],
  compareList: [],

  setShell: (shell) => set({ shell }),

  addCore: (core) => set((state) => ({ cores: [...state.cores, core] })),
  removeCore: (coreId) => set((state) => ({ cores: state.cores.filter(c => c.id !== coreId) })),

  addWeapon: (weapon) => set((state) => ({
    weapons: [...state.weapons, { ...weapon, instanceId: crypto.randomUUID(), selectedMods: [] }]
  })),

  removeWeapon: (instanceId) => set((state) => ({
    weapons: state.weapons.filter(w => w.instanceId !== instanceId)
  })),

  toggleMod: (instanceId, mod) => set((state) => ({
    weapons: state.weapons.map(w => {
      if (w.instanceId !== instanceId) return w;
      const hasMod = w.selectedMods.find(m => m.id === mod.id);
      const sameTypeMod = w.selectedMods.find(m => m.type === mod.type);
      let newMods = [...w.selectedMods];
      if (hasMod) newMods = newMods.filter(m => m.id !== mod.id);
      else {
        if (sameTypeMod) newMods = newMods.filter(m => m.type !== mod.type);
        newMods.push(mod);
      }
      return { ...w, selectedMods: newMods };
    })
  })),

  addImplant: (implant) => set((state) => ({ implants: [...state.implants, implant] })),
  removeImplant: (implantId) => set((state) => ({ implants: state.implants.filter(i => i.id !== implantId) })),
  resetBuild: () => set({ shell: null, cores: [], weapons: [], implants: [] }),

  addToCompare: (weapon) => set((state) => ({
    compareList: [...state.compareList, { ...weapon, instanceId: crypto.randomUUID(), selectedMods: [] }]
  })),

  removeFromCompare: (instanceId) => set((state) => ({
    compareList: state.compareList.filter(w => w.instanceId !== instanceId)
  })),

  toggleCompareMod: (instanceId, mod) => set((state) => ({
    compareList: state.compareList.map(w => {
      if (w.instanceId !== instanceId) return w;
      const hasMod = w.selectedMods.find(m => m.id === mod.id);
      const sameTypeMod = w.selectedMods.find(m => m.type === mod.type);
      let newMods = [...w.selectedMods];
      if (hasMod) newMods = newMods.filter(m => m.id !== mod.id);
      else {
        if (sameTypeMod) newMods = newMods.filter(m => m.type !== mod.type);
        newMods.push(mod);
      }
      return { ...w, selectedMods: newMods };
    })
  }))
}));