import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuildStore } from '../store/useBuildStore';
import { t } from '../utils/translator';

export default function BuildDetails() {
  const { shell, cores, implants, weapons, setShell, addCore, removeCore, addWeapon, removeWeapon, addImplant, removeImplant } = useBuildStore();
  const nav = useNavigate();

  const [swapTarget, setSwapTarget] = useState(null); // { type: 'shell' | 'core' | 'implant' | 'weapon', instanceId?: string, oldId?: string }
  const [db, setDb] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!shell) {
      nav('/');
      return;
    }
    Promise.all([
      fetch('https://5mpxwrp0-5000.euw.devtunnels.ms/api/data/shells').then(res => res.json()),
      fetch('https://5mpxwrp0-5000.euw.devtunnels.ms/api/data/cores').then(res => res.json()),
      fetch('https://5mpxwrp0-5000.euw.devtunnels.ms/api/data/implants').then(res => res.json()),
      fetch('https://5mpxwrp0-5000.euw.devtunnels.ms/api/data/weapons').then(res => res.json())
    ]).then(([s, c, i, w]) => setDb({ shells: s, cores: c, implants: i, weapons: w }))
      .catch(err => console.error(err));
  }, [shell, nav]);

  const executeSwap = (newItem) => {
    const { type, instanceId, oldId } = swapTarget;
    if (type === 'shell') setShell(newItem);
    if (type === 'core') {
      if (oldId) removeCore(oldId);
      addCore(newItem);
    }
    if (type === 'implant') {
      if (oldId) removeImplant(oldId);
      addImplant(newItem);
    }
    if (type === 'weapon') {
      if (instanceId) removeWeapon(instanceId);
      addWeapon(newItem);
    }
    setSwapTarget(null);
    setSearchQuery('');
  };

  const getFilteredItems = () => {
    if (!swapTarget) return [];
    let list = db[`${swapTarget.type}s`] || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item =>
        item.name.toLowerCase().includes(q) ||
        (item.type && item.type.toLowerCase().includes(q)) ||
        (item.weapon_type && item.weapon_type.toLowerCase().includes(q)) ||
        (item.effect && item.effect.toLowerCase().includes(q))
      );
    }
    return list;
  };

  const calculateTotalStats = () => {
    let stats = { ...shell };
    const exclude = ['id', 'name', 'category', 'image', 'description', 'slots', 'abilities'];
    let aggregated = {};

    Object.keys(stats).forEach(k => {
      if (!exclude.includes(k) && typeof stats[k] === 'number') {
        aggregated[k] = stats[k];
      }
    });

    const applyBonuses = (item) => {
      const effectStr = (item.effect || '').toLowerCase() + ' ' + (item.name || '').toLowerCase();
      Object.keys(aggregated).forEach(statKey => {
        const translatedStat = t(statKey).toLowerCase();
        const rawStatName = statKey.replace(/_/g, ' ').toLowerCase();
        if (effectStr.includes(translatedStat) || effectStr.includes(rawStatName)) {
          const match = effectStr.match(/([+-]\d+(?:\.\d+)?)/);
          if (match) aggregated[statKey] += parseFloat(match[1]);
        }
      });
    };

    cores.forEach(applyBonuses);
    implants.forEach(applyBonuses);

    return aggregated;
  };

  if (!shell) return null;

  const aggregatedStats = calculateTotalStats();

  const ItemCard = ({ title, item, type, instanceId }) => (
    <div className="border border-white/10 bg-[#0C0C0D] p-4 relative group hover:border-m-cyan/50 transition-colors">
      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 border-b border-white/10 pb-1">{title}</div>
      {item ? (
        <div className="flex gap-4 items-center">
          {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />}
          <div className="flex-1">
            <h3 className="text-m-cyan font-bold uppercase tracking-wider text-sm">{item.name}</h3>
            <p className="text-[10px] opacity-60 uppercase mt-1 line-clamp-2">{t(item.type || item.weapon_type || item.effect || 'Установлено')}</p>
          </div>
          <button
            onClick={() => setSwapTarget({ type, instanceId: instanceId || null, oldId: item.id })}
            className="opacity-0 group-hover:opacity-100 border border-m-pink text-m-pink px-3 py-1 text-xs uppercase hover:bg-m-pink hover:text-black transition-all"
          >
            Замена
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center h-16">
          <span className="text-xs opacity-30 font-mono">СЛОТ ПУСТ</span>
          <button
            onClick={() => setSwapTarget({ type, instanceId: null, oldId: null })}
            className="border border-m-acid text-m-acid px-3 py-1 text-xs uppercase hover:bg-m-acid hover:text-black transition-all"
          >
            Установить
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in relative max-w-7xl mx-auto">
      <div className="flex justify-between items-end border-b border-m-pink/30 pb-4">
        <div>
          <h2 className="text-3xl text-m-pink uppercase font-bold tracking-widest">ДЕТАЛИЗАЦИЯ СБОРКИ</h2>
          <p className="text-xs opacity-50 uppercase tracking-widest">АКТИВНЫЙ ПРОТОКОЛ: {shell.name}</p>
        </div>
        <button onClick={() => nav('/')} className="text-m-cyan hover:text-m-acid transition-colors uppercase text-sm border border-transparent hover:border-m-acid px-4 py-2">
          &lt; Возврат в конструктор
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm text-m-acid uppercase tracking-[0.2em] border-b border-m-acid/20 pb-2">КОНФИГУРАЦИЯ ОБОРУДОВАНИЯ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ItemCard title="ОБОЛОЧКА" item={shell} type="shell" />
            <ItemCard title="ЯДРО" item={cores[0]} type="core" />
            <ItemCard title="ИМПЛАНТ 1" item={implants[0]} type="implant" />
            <ItemCard title="ИМПЛАНТ 2" item={implants[1]} type="implant" />
            <ItemCard title="ОРУЖИЕ 1" item={weapons[0]} type="weapon" instanceId={weapons[0]?.instanceId} />
            <ItemCard title="ОРУЖИЕ 2" item={weapons[1]} type="weapon" instanceId={weapons[1]?.instanceId} />
          </div>

          <div className="mt-8">
            <h3 className="text-sm text-m-cyan uppercase tracking-[0.2em] border-b border-m-cyan/20 pb-2 mb-4">СИНЕРГИЯ СПОСОБНОСТЕЙ ОБОЛОЧКИ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(shell.abilities || []).map((ab, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-m-pink font-bold uppercase text-xs tracking-wider">{ab.name}</span>
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest">{t(ab.type)}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed">{ab.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#0C0C0D] border border-m-cyan/30 p-6 h-fit sticky top-8">
          <h3 className="text-sm text-m-cyan uppercase tracking-[0.2em] border-b border-m-cyan/20 pb-2 mb-6">РАСЧЕТНЫЕ ХАРАКТЕРИСТИКИ</h3>
          <div className="space-y-2">
            {Object.entries(aggregatedStats).map(([key, val]) => {
              const baseVal = shell[key];
              const diff = val - baseVal;
              return (
                <div key={key} className="flex justify-between items-end border-b border-white/5 pb-1 hover:border-white/20 transition-colors">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">{t(key)}</span>
                  <div className="flex items-center gap-2">
                    {diff !== 0 && (
                      <span className={`text-[9px] font-bold ${diff > 0 ? 'text-m-acid' : 'text-m-pink'}`}>
                        {diff > 0 ? '+' : ''}{Number(diff.toFixed(2))}
                      </span>
                    )}
                    <span className={`text-xs font-mono ${diff !== 0 ? 'text-white' : 'text-gray-400'}`}>
                      {Number(val.toFixed(2))}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {swapTarget && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-8 animate-fade-in">
          <div className="bg-[#0C0C0D] border border-m-acid w-full max-w-4xl h-[80vh] flex flex-col relative shadow-[0_0_30px_rgba(186,250,1,0.1)]">
            <div className="p-4 border-b border-m-acid/30 flex justify-between items-center bg-m-acid/5">
              <h2 className="text-xl text-m-acid uppercase tracking-widest">ЗАМЕНА МОДУЛЯ: {t(swapTarget.type)}</h2>
              <button onClick={() => setSwapTarget(null)} className="text-m-acid hover:text-white border border-transparent hover:border-m-acid px-3 py-1 transition-all">ОТМЕНА</button>
            </div>

            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ПОИСК ПО БАЗЕ ДАННЫХ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-m-black border border-white/20 text-white text-xs font-mono py-3 px-4 outline-none focus:border-m-acid transition-colors uppercase placeholder:text-gray-600"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar grid grid-cols-2 md:grid-cols-3 gap-4 content-start">
              {getFilteredItems().map(item => (
                <div
                  key={item.id}
                  onClick={() => executeSwap(item)}
                  className="border border-white/10 bg-m-black p-3 cursor-pointer hover:border-m-acid hover:bg-m-acid/5 transition-all flex flex-col group h-32"
                >
                  <div className="flex gap-3 h-full">
                    {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 object-contain opacity-70 group-hover:opacity-100" />}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] text-m-cyan font-bold uppercase truncate group-hover:text-m-acid">{item.name}</h4>
                      <div className="text-[9px] opacity-50 uppercase truncate mt-0.5">{t(item.type || item.weapon_type || item.category)}</div>
                      <div className="text-[9px] text-gray-400 mt-2 line-clamp-3 leading-tight">{t(item.effect || item.description || '')}</div>
                    </div>
                  </div>
                </div>
              ))}
              {getFilteredItems().length === 0 && <div className="col-span-full text-center text-xs opacity-50 mt-10">СОВПАДЕНИЙ НЕ НАЙДЕНО</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}