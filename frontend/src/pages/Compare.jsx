import { useState, useEffect } from 'react';
import { useBuildStore } from '../store/useBuildStore';
import { t } from '../utils/translator';

export default function Compare() {
  const [dbMods, setDbMods] = useState([]);
  const { compareList, removeFromCompare, toggleCompareMod } = useBuildStore();

  useEffect(() => {
    fetch('/api/data/mods')
      .then(res => res.json())
      .then(data => setDbMods(Array.isArray(data) ? data : []))
      .catch(() => setDbMods([]));
  }, []);

  const getDisplayStats = (weapon) => {
    const exclude = ['id', 'instanceId', 'name', 'category', 'image', 'mod_slots', 'selectedMods', 'weapon_type', 'type'];
    return Object.entries(weapon).filter(([key]) => !exclude.includes(key));
  };

  const getModBonus = (statKey, mods) => {
    let bonus = 0;
    mods.forEach(mod => {
      const effectStr = (mod.effect || '').toLowerCase() + ' ' + (mod.name || '').toLowerCase();
      const translatedStat = t(statKey).toLowerCase();
      const rawStatName = statKey.replace(/_/g, ' ').toLowerCase();

      if (effectStr.includes(translatedStat) || effectStr.includes(rawStatName)) {
        const match = effectStr.match(/([+-]\d+(?:\.\d+)?)/);
        if (match) bonus += parseFloat(match[1]);
      }
    });
    return bonus;
  };

  const baselineWeapon = compareList[0];

  return (
    <div className="space-y-6 animate-fade-in relative">
      <h2 className="text-2xl text-m-pink uppercase">&gt; АНАЛИЗАТОР И СРАВНЕНИЕ ХАРАКТЕРИСТИК</h2>

      {compareList.length === 0 ? (
        <div className="border border-m-cyan/30 p-8 text-center opacity-50 uppercase text-sm tracking-widest">
          МОДУЛЬ СРАВНЕНИЯ ПУСТ. ТРЕБУЕТСЯ ВВОД ДАННЫХ ИЗ БАЗЫ.
        </div>
      ) : (
        <div className="flex overflow-x-auto custom-scrollbar gap-6 pb-4 snap-x">
          {compareList.map((weapon, index) => {
            const isBaseline = index === 0;

            return (
              <div key={weapon.instanceId} className={`min-w-[400px] w-[400px] shrink-0 border ${isBaseline ? 'border-m-acid shadow-[0_0_15px_rgba(186,250,1,0.1)]' : 'border-m-cyan/30'} bg-m-black flex flex-col snap-start relative transition-all`}>

                {isBaseline && <div className="absolute -top-3 left-4 bg-m-black px-2 text-[10px] text-m-acid uppercase tracking-widest z-10 font-bold border border-m-acid">ЭТАЛОН</div>}

                <div className="p-4 border-b border-m-cyan/30 flex justify-between items-start bg-[#0C0C0D]">
                  <div>
                    <h3 className="text-xl text-m-cyan font-bold uppercase">{weapon.name}</h3>
                    <div className="text-[10px] opacity-60 uppercase">{t(weapon.weapon_type || weapon.type)}</div>
                  </div>
                  <button
                    onClick={() => removeFromCompare(weapon.instanceId)}
                    className="text-m-pink hover:text-white text-xs px-2 py-1 border border-transparent hover:border-m-pink transition-colors"
                  >
                    [ X ]
                  </button>
                </div>

                <div className="p-4 border-b border-m-cyan/30 h-40 flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAwLCA4NSwgMC4wNSkiLz48L3N2Zz4=')]">
                  {weapon.image ? <img src={weapon.image} alt={weapon.name} className="max-h-full max-w-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]" /> : <span className="text-xs opacity-30">НЕТ ДАННЫХ</span>}
                </div>

                <div className="p-4 border-b border-m-cyan/30 bg-m-black/50">
                  <h4 className="text-[10px] text-m-acid uppercase tracking-widest mb-3">КОНФИГУРАЦИЯ МОДИФИКАЦИЙ</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(weapon.mod_slots || []).map(slot => (
                      <div key={slot} className="border border-white/5 p-2 bg-[#0C0C0D]">
                        <div className="text-[9px] opacity-40 uppercase mb-1">{t(slot)}</div>
                        <div className="flex flex-col gap-1">
                          {dbMods.filter(m => m.type === slot).map(mod => {
                            const isActive = weapon.selectedMods.find(m => m.id === mod.id);
                            return (
                              <button
                                key={mod.id}
                                onClick={() => toggleCompareMod(weapon.instanceId, mod)}
                                className={`text-[9px] text-left px-1.5 py-1 uppercase transition-colors border ${isActive ? 'border-m-pink text-m-pink bg-m-pink/10' : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'}`}
                                title={mod.effect}
                              >
                                {t(mod.name)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 flex-1 bg-[#0C0C0D]">
                  <h4 className="text-[10px] text-m-cyan uppercase tracking-widest mb-3">ХАРАКТЕРИСТИКИ И ОТКЛОНЕНИЯ</h4>
                  <div className="flex flex-col gap-1.5">
                    {getDisplayStats(weapon).map(([key, baseVal]) => {
                      const numBase = parseFloat(baseVal);
                      const isNumeric = !isNaN(numBase);

                      const modBonus = isNumeric ? getModBonus(key, weapon.selectedMods) : 0;
                      const effectiveVal = isNumeric ? numBase + modBonus : baseVal;

                      let deltaDisplay = null;
                      let valueColor = "text-gray-200";

                      if (isNumeric && !isBaseline && baselineWeapon) {
                        const baselineBase = parseFloat(baselineWeapon[key]) || 0;
                        const baselineBonus = getModBonus(key, baselineWeapon.selectedMods);
                        const baselineEffective = baselineBase + baselineBonus;

                        const delta = effectiveVal - baselineEffective;

                        if (delta > 0) {
                          deltaDisplay = <span className="text-[10px] text-m-acid ml-2 font-bold">+{delta.toFixed(1)}</span>;
                          valueColor = "text-m-acid";
                        } else if (delta < 0) {
                          deltaDisplay = <span className="text-[10px] text-m-pink ml-2 font-bold">{delta.toFixed(1)}</span>;
                          valueColor = "text-m-pink";
                        } else {
                          deltaDisplay = <span className="text-[10px] text-gray-600 ml-2">0</span>;
                        }
                      }

                      if (isNumeric && isBaseline && modBonus !== 0) {
                         if (modBonus > 0) {
                           deltaDisplay = <span className="text-[10px] text-m-acid ml-2">(+{modBonus.toFixed(1)})</span>;
                           valueColor = "text-m-acid";
                         } else {
                           deltaDisplay = <span className="text-[10px] text-m-pink ml-2">({modBonus.toFixed(1)})</span>;
                           valueColor = "text-m-pink";
                         }
                      }

                      return (
                        <div key={key} className="flex justify-between items-end border-b border-white/5 pb-1 hover:border-white/20 transition-colors">
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest">{t(key)}</span>
                          <div className="flex items-center">
                            <span className={`text-[12px] font-mono ${valueColor}`}>
                              {isNumeric ? Number(effectiveVal.toFixed(2)) : t(effectiveVal)}
                            </span>
                            {deltaDisplay}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {weapon.selectedMods.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-m-pink/30">
                      <h4 className="text-[10px] text-m-pink uppercase tracking-widest mb-3">АКТИВНЫЕ ЭФФЕКТЫ</h4>
                      <div className="flex flex-col gap-1">
                        {weapon.selectedMods.map(mod => (
                          <div key={mod.id} className="text-[10px] text-m-pink font-mono">
                            + {t(mod.effect || mod.name)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}