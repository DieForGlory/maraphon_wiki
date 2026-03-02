import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuildStore } from '../store/useBuildStore';
import { t } from '../utils/translator';

const STAGES = [
  { id: 0, title: '01_ОБОЛОЧКА', limit: 1 },
  { id: 1, title: '02_ЯДРО', limit: 1 },
  { id: 2, title: '03_ИМПЛАНТЫ', limit: 4 },
  { id: 3, title: '04_ОРУЖИЕ', limit: 2 }
];

const CardWrapper = ({ item, children, onClick, onRemove, active, className, onHover, onLeave }) => (
  <div
    onClick={onClick}
    onMouseEnter={(e) => onHover(item, e)}
    onMouseMove={(e) => onHover(item, e)}
    onMouseLeave={onLeave}
    className={`tech-corners relative cursor-pointer transition-all duration-200 group border ${
      active
      ? 'border-m-cyan bg-m-cyan/5 shadow-[0_0_20px_rgba(0,255,255,0.15)]'
      : 'border-white/10 bg-m-black/40 hover:border-m-cyan/50 hover:bg-m-cyan/5'
    } ${className}`}
  >
    {active && onRemove && (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-0 right-0 z-[50] bg-m-pink text-black px-3 py-1.5 text-[9px] font-black uppercase hover:bg-white transition-colors shadow-[0_0_10px_rgba(255,0,85,0.5)]"
      >
        УДАЛИТЬ [X]
      </button>
    )}
    <div className="absolute inset-0 bg-gradient-to-b from-m-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    {children}
  </div>
);

const HoverInfo = ({ item, mousePos }) => {
  if (!item) return null;
  const stats = Object.entries(item).filter(([k, v]) =>
    !['id', 'name', 'category', 'image', 'description', 'slots', 'abilities', 'mod_slots', 'instanceId', 'selectedMods'].includes(k)
    && typeof v === 'number'
  );

  return (
    <div
      key={item.id}
      className="hover-info-container p-8 animate-intense-glitch border-l-8 border-m-cyan"
      style={{ left: `${mousePos.x + 30}px`, top: `${mousePos.y - 120}px` }}
    >
      <div className="noise-overlay absolute inset-0 pointer-events-none opacity-10"></div>
      <div className="relative z-10">
        <h4 className="text-3xl text-white font-black uppercase italic tracking-tighter leading-none mb-1">{item.name}</h4>
        <div className="text-m-pink text-[10px] font-mono mb-6 tracking-[0.4em]">СИСТЕМНЫЙ_МОДУЛЬ // {t(item.category || 'ОБОРУДОВАНИЕ')}</div>
        <div className="space-y-4">
          {stats.slice(0, 6).map(([k, v]) => (
            <div key={k} className="space-y-1.5">
              <div className="flex justify-between text-[9px] uppercase tracking-widest text-gray-500">
                <span>{t(k)}</span> <span className="text-m-cyan font-mono">{v}</span>
              </div>
              <div className="h-1 w-full bg-white/5 relative">
                <div className="absolute h-full bg-m-cyan shadow-[0_0_10px_#00ffff]" style={{ width: `${Math.min((v/150)*100, 100)}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ModModal = ({ weaponId, weaponsInStore, mods, onClose, onToggleMod, onHover, onLeave }) => {
  const weapon = weaponsInStore.find(w => w.instanceId === weaponId);
  if (!weapon) return null;

  const rawSlots = weapon.mod_slots || [];
  const slots = Array.isArray(rawSlots) ? rawSlots : rawSlots.split(',').map(s => s.trim());

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-6 z-[20000]">
      <div className="bg-[#050505] border border-m-cyan w-full max-w-6xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-[0_0_100px_rgba(0,255,255,0.2)] animate-modal relative">
        <div className="sticky top-0 bg-[#050505] z-30 p-8 border-b border-m-cyan/30 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-m-cyan text-black flex flex-col items-center justify-center font-black italic skew-x-[-15deg]">
              <span className="text-xl">МОД</span>
            </div>
            <div>
              <h2 className="text-4xl text-white font-black uppercase italic tracking-tighter leading-none">{weapon.name}</h2>
              <p className="text-m-cyan text-[10px] font-mono mt-2 tracking-[0.4em] animate-pulse">НЕЙРОПОДКЛЮЧЕНИЕ_АКТИВНО // СИНХРОНИЗАЦИЯ...</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-sync px-12 py-4 text-xs font-black uppercase tracking-[0.2em]">ПОДТВЕРДИТЬ_ИЗМЕНЕНИЯ</button>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {slots.map(slot => {
            const availableMods = mods.filter(m => m.type?.toLowerCase().trim() === slot.toLowerCase().trim());
            return (
              <div key={slot} className="space-y-6">
                <div className="text-[11px] text-gray-500 font-black uppercase tracking-[0.3em] border-b border-white/10 pb-2 flex items-center gap-3">
                  <div className="w-2 h-2 bg-m-cyan rotate-45"></div> {t(slot)}
                </div>
                <div className="flex flex-col gap-2">
                  {availableMods.map(mod => {
                    const isInstalled = weapon.selectedMods?.some(m => m.id === mod.id);
                    return (
                      <button
                        key={mod.id}
                        onMouseEnter={(e) => onHover(mod, e)}
                        onMouseLeave={onLeave}
                        onClick={() => onToggleMod(weapon.instanceId, mod)}
                        className={`text-[11px] text-left p-4 uppercase transition-all border-l-4 font-black ${
                          isInstalled ? 'border-m-pink text-m-pink bg-m-pink/10 shadow-[inset_0_0_20px_rgba(255,0,85,0.2)]' : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        &gt; {t(mod.name)}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function Builder() {
  const [db, setDb] = useState({ shells: [], cores: [], weapons: [], implants: [], mods: [] });
  const [activeStage, setActiveStage] = useState(0);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [editingWeaponId, setEditingWeaponId] = useState(null);

  const nav = useNavigate();
  const {
    shell, cores, weapons, implants, setShell, addCore, removeCore,
    addWeapon, removeWeapon, addImplant, removeImplant, toggleMod
  } = useBuildStore();

  const API_BASE = "";

  useEffect(() => {
    const endpoints = ['shells', 'cores', 'weapons', 'implants', 'mods'];
    Promise.all(endpoints.map(ep => fetch(`${API_BASE}/api/data/${ep}`).then(res => res.json())))
      .then(data => setDb({ shells: data[0], cores: data[1], weapons: data[2], implants: data[3], mods: data[4] }))
      .catch(err => console.error("СБОЙ_СИНХРОНИЗАЦИИ", err));
  }, []);

  const handleHover = (item, e) => {
    setHoveredItem(item);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleWeaponAction = (wpn) => {
    const selected = weapons.find(w => w.id === wpn.id);
    if (selected) {
      setEditingWeaponId(selected.instanceId);
    } else {
      if (weapons.length < 2) {
        const added = addWeapon(wpn);
        if (added) setEditingWeaponId(added.instanceId);
      } else {
        alert("ОШИБКА: СЛОТЫ ВНЕШНЕЙ ПОДВЕСКИ ЗАПОЛНЕНЫ (МАКС: 2)");
      }
    }
  };

  return (
    <>
      <HoverInfo item={hoveredItem} mousePos={mousePos} />

      <ModModal
        weaponId={editingWeaponId} weaponsInStore={weapons} mods={db.mods}
        onClose={() => setEditingWeaponId(null)} onToggleMod={toggleMod}
        onHover={handleHover} onLeave={() => setHoveredItem(null)}
      />

      <main className="grid grid-cols-1 xl:grid-cols-4 gap-8 animate-fade-in relative min-h-[90vh]" onMouseLeave={() => setHoveredItem(null)}>
        <section className="xl:col-span-3 space-y-6">
          <div className="flex bg-m-black/80 border border-white/10 backdrop-blur-md">
            {STAGES.map((s) => {
              const counts = { 0: shell?1:0, 1: cores.length, 2: implants.length, 3: weapons.length };
              return (
                <button key={s.id} onClick={() => setActiveStage(s.id)}
                  className={`flex-1 py-5 text-[11px] tracking-[0.3em] font-black uppercase transition-all relative ${
                    activeStage === s.id ? 'text-m-cyan' : 'text-gray-600 hover:text-white'
                  }`}
                >
                  {activeStage === s.id && <div className="absolute inset-0 border-b-2 border-m-cyan bg-m-cyan/5 animate-pulse"></div>}
                  <span className="relative z-10">{s.title} // {counts[s.id]}_{s.limit}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-grid-pattern scanline-effect border border-white/5 p-10 bg-m-black/40 relative min-h-[70vh]">

            {activeStage === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {db.shells.map(s => (
                  <CardWrapper key={s.id} item={s} active={shell?.id === s.id} onClick={() => {setShell(s); setActiveStage(1);}} onHover={handleHover} onLeave={() => setHoveredItem(null)} className="p-0 overflow-hidden border-2">
                    <div className="h-80 bg-black flex items-center justify-center">
                       {s.image && <img src={s.image} alt="" className="h-64 object-contain transition-transform group-hover:scale-110" />}
                    </div>
                    <div className="p-6 bg-m-black/90 border-t border-white/10 flex justify-between items-center">
                       <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">{s.name}</h3>
                       <div className="text-[10px] text-m-pink font-black border border-m-pink px-2 py-1">ГОТОВ</div>
                    </div>
                  </CardWrapper>
                ))}
              </div>
            )}

            {(activeStage === 1 || activeStage === 2) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(activeStage === 1 ? db.cores : db.implants).map(item => {
                  const isSel = activeStage === 1 ? cores.some(i => i.id === item.id) : implants.some(i => i.id === item.id);
                  return (
                    <CardWrapper
                      key={item.id} item={item} active={isSel}
                      onClick={() => activeStage === 1 ? (isSel ? removeCore(item.id) : (cores.length < 1 && addCore(item))) : (isSel ? removeImplant(item.id) : (implants.length < 4 && addImplant(item)))}
                      onRemove={() => activeStage === 1 ? removeCore(item.id) : removeImplant(item.id)}
                      onHover={handleHover} onLeave={() => setHoveredItem(null)}
                      className="flex gap-8 p-6 items-center"
                    >
                      <div className="w-20 h-20 bg-black border border-white/5 flex items-center justify-center p-3 shrink-0">
                        {item.image && <img src={item.image} alt="" className="max-h-full" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-black uppercase italic text-white">{item.name}</h3>
                        <p className="text-[11px] text-m-acid mt-2 font-mono uppercase border-l-2 border-m-acid/30 pl-4">&gt; {t(item.effect || '')}</p>
                      </div>
                    </CardWrapper>
                  );
                })}
              </div>
            )}

            {activeStage === 3 && (
              <div className="space-y-12 animate-fade-in">
                <h3 className="text-m-cyan text-xs font-black uppercase tracking-[0.5em]">// АРСЕНАЛ_ДОСТУПЕН</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {db.weapons.map(w => {
                    const isSelected = weapons.find(i => i.id === w.id);
                    return (
                      <CardWrapper
                        key={w.id} item={w} active={isSelected}
                        onClick={() => handleWeaponAction(w)}
                        onRemove={() => removeWeapon(w.id)}
                        onHover={handleHover} onLeave={() => setHoveredItem(null)}
                        className="p-10 flex flex-col items-center justify-center text-center"
                      >
                        <div className="text-m-cyan text-[10px] font-black tracking-[0.4em] opacity-20 mb-6 font-mono">СЕРИЯ_0x{w.id}</div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">{w.name}</h3>
                        <div className={`h-1 transition-all duration-500 ${isSelected ? 'w-full bg-m-cyan shadow-[0_0_10px_#00ffff]' : 'w-12 bg-white/10 group-hover:w-full'}`}></div>
                        {isSelected && <div className="mt-6 text-[10px] text-m-pink font-black uppercase animate-pulse">НАСТРОИТЬ_МОДУЛИ</div>}
                      </CardWrapper>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="border border-m-cyan/30 bg-m-black/80 backdrop-blur-xl p-8 h-fit sticky top-10 flex flex-col gap-10 shadow-2xl">
          <div className="space-y-10">
            <div className="space-y-1">
              <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Шасси // Оболочка</div>
              <div className="text-xl text-m-pink font-black uppercase italic tracking-tighter border-b border-m-pink/20 pb-1">{shell?.name || '---'}</div>
            </div>

            <div className="space-y-4">
              <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Вооружение // Обвес</div>
              <div className="space-y-3">
                {weapons.length > 0 ? weapons.map(w => (
                  <div key={w.instanceId} className="flex items-center gap-2">
                    <div onClick={() => setEditingWeaponId(w.instanceId)} className="flex-1 text-[11px] text-white flex items-center justify-between group cursor-pointer border-l-4 border-m-cyan pl-4 bg-white/5 py-3 hover:bg-m-cyan/10 transition-all">
                      <span className="font-black uppercase italic">{w.name}</span>
                      <span className="text-m-cyan text-[9px] font-black opacity-40 group-hover:opacity-100">ИЗМЕНИТЬ_</span>
                    </div>
                    <button onClick={() => removeWeapon(w.id)} className="bg-m-pink/10 border border-m-pink text-m-pink p-3 hover:bg-m-pink hover:text-black transition-all font-black text-xs">×</button>
                  </div>
                )) : <div className="text-[10px] text-gray-800 italic uppercase">СЛОТЫ_СВОБОДНЫ</div>}
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5">
             <div className="flex justify-between items-end mb-8">
                <div className="text-[11px] text-gray-500 uppercase font-black tracking-widest">ВЫХОД_РЕАКТОРА</div>
                <div className="text-4xl text-white font-black italic tracking-tighter font-mono leading-none">
                  {shell ? (100 + (implants.length * 20)) : 0}<span className="text-xs ml-1 text-m-cyan">кВт</span>
                </div>
             </div>

             <button
                disabled={!shell}
                onClick={() => nav('/build')}
                className={`w-full py-6 uppercase text-sm font-black italic tracking-[0.4em] transition-all skew-x-[-12deg] ${
                  shell
                  ? 'bg-m-pink text-black hover:bg-white shadow-[0_15px_40px_rgba(255,0,85,0.4)] scale-100 hover:scale-[1.03]'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-30'
                }`}
              >
                ИНИЦИИРОВАТЬ_ВЫСАДКУ
              </button>
          </div>
        </aside>
      </main>
    </>
  );
}