import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBuildStore } from '../store/useBuildStore';
import { t } from '../utils/translator';

const ImageLoader = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {!loaded && (
        <div className="absolute inset-0 bg-m-cyan/5 animate-pulse border border-m-cyan/10 flex items-center justify-center">
          <span className="text-xs text-m-cyan/30 uppercase font-mono tracking-widest animate-bounce">ОЖИДАНИЕ СИГНАЛА...</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`max-h-full max-w-full object-contain transition-all duration-500 ${loaded ? 'opacity-80 group-hover:opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};

export default function CategoryDb() {
  const { category } = useParams();
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const nav = useNavigate();
  const { resetBuild, addWeapon, setShell, addToCompare } = useBuildStore();

  useEffect(() => {
    setItems([]);
    setSelectedItem(null);
    fetch(`https://5mpxwrp0-5000.euw.devtunnels.ms/api/data/${category}`)
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  }, [category]);

  const initBuild = (item) => {
    resetBuild();
    if (category === 'weapons') addWeapon(item);
    if (category === 'shells') setShell(item);
    nav('/');
  };

  const getDisplayStats = (item) => {
    const exclude = ['id', 'name', 'category', 'image', 'mod_slots', 'abilities', 'slots'];
    return Object.entries(item).filter(([key]) => !exclude.includes(key));
  };

  const showBuildButton = ['weapons', 'shells'].includes(category);

  return (
    <div className="space-y-6 animate-fade-in relative">
      <h2 className="text-2xl text-m-pink uppercase">&gt; БАЗА ДАННЫХ: {t(category.replace(/-/g, ' '))}</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(item => (
          <div key={item.id} className="border border-m-cyan/30 p-4 relative group overflow-hidden bg-m-black hover:border-m-acid transition-colors flex flex-col h-[380px]">
            <div className="absolute top-0 right-0 p-2 text-[10px] opacity-30 group-hover:opacity-100 group-hover:text-m-acid transition-all z-10 cursor-default">
              {item.id}
            </div>

            <div
              className="h-40 w-full mb-4 cursor-pointer relative bg-[#0C0C0D] border border-white/5 p-4"
              onClick={() => setSelectedItem(item)}
            >
              {item.image ? <ImageLoader src={item.image} alt={item.name} /> : <div className="h-full flex items-center justify-center opacity-30 text-xs">НЕТ ДАННЫХ</div>}
            </div>

            <h3
              className="text-lg text-m-cyan font-bold uppercase mb-2 cursor-pointer hover:text-m-acid transition-colors line-clamp-2 leading-tight"
              onClick={() => setSelectedItem(item)}
            >
              {item.name}
            </h3>

            <div className="text-[10px] opacity-60 mb-auto uppercase line-clamp-2">
              {t(item.weapon_type || item.type || item.category)}
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedItem(item)}
                  className={`bg-transparent border border-m-cyan/50 text-m-cyan px-4 py-2 uppercase text-[10px] hover:bg-m-cyan hover:text-m-black transition-colors ${showBuildButton ? 'w-1/3' : 'w-full'}`}
                >
                  Анализ
                </button>
                {showBuildButton && (
                  <button
                    onClick={() => initBuild(item)}
                    className="bg-transparent border border-m-acid text-m-acid px-4 py-2 uppercase text-[10px] hover:bg-m-acid hover:text-m-black transition-colors w-2/3"
                  >
                    В сборку
                  </button>
                )}
              </div>
              {category === 'weapons' && (
                <button
                  onClick={() => addToCompare(item)}
                  className="bg-transparent border border-m-pink/50 text-m-pink px-4 py-2 uppercase text-[10px] hover:bg-m-pink hover:text-m-black transition-colors w-full"
                >
                  В сравнение
                </button>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-full text-m-cyan opacity-50">Массив данных пуст.</div>}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-8 animate-fade-in">
          <div className="bg-[#0C0C0D] border border-m-pink w-full max-w-6xl h-[80vh] flex flex-col relative shadow-[0_0_30px_rgba(255,0,85,0.15)] overflow-hidden">
            <div className="border-b border-m-pink/30 p-4 flex justify-between items-center bg-m-pink/5">
              <div>
                <h2 className="text-3xl text-m-pink uppercase font-bold tracking-widest">{selectedItem.name}</h2>
                <p className="text-xs opacity-50 uppercase tracking-widest">{selectedItem.id}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-m-pink hover:text-white border border-transparent hover:border-m-pink p-2 transition-all"
              >
                [ РАЗОРВАТЬ СОЕДИНЕНИЕ ]
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/2 p-8 border-r border-m-pink/10 flex items-center justify-center relative bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAwLCA4NSwgMC4wNSkiLz48L3N2Zz4=')]">
                {selectedItem.image ? (
                  <img src={selectedItem.image} alt={selectedItem.name} className="max-w-full max-h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                ) : (
                  <span className="opacity-20 text-2xl tracking-widest">ИЗОБРАЖЕНИЕ ОТСУТСТВУЕТ</span>
                )}
              </div>

              <div className="w-1/2 p-8 overflow-y-auto custom-scrollbar">
                <h3 className="text-m-cyan text-sm uppercase tracking-[0.2em] mb-6 border-b border-m-cyan/20 pb-2">Данные телеметрии</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  {getDisplayStats(selectedItem).map(([key, val]) => (
                    <div key={key} className="group border-b border-white/5 pb-1 flex justify-between items-end hover:border-m-acid/50 transition-colors">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{t(key)}</span>
                      <span className="text-sm text-gray-200 font-mono text-right">{t(val)}</span>
                    </div>
                  ))}
                </div>

                {selectedItem.abilities && selectedItem.abilities.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-m-pink text-sm uppercase tracking-[0.2em] mb-4 border-b border-m-pink/20 pb-2">Способности</h3>
                    <div className="flex flex-col gap-4">
                      {selectedItem.abilities.map((ability, index) => (
                        <div key={index} className="bg-white/5 p-3 border border-white/10">
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-m-pink font-bold uppercase">{ability.name}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">{t(ability.type)}</span>
                          </div>
                          <p className="text-xs text-gray-300 leading-relaxed">{ability.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedItem.mod_slots || selectedItem.slots) && (
                  <div className="mt-8">
                    <h3 className="text-m-acid text-sm uppercase tracking-[0.2em] mb-4 border-b border-m-acid/20 pb-2">Слоты оборудования</h3>
                    <div className="flex flex-wrap gap-2">
                      {(selectedItem.mod_slots || selectedItem.slots).map(slot => (
                        <span key={slot} className="border border-m-acid/30 text-m-acid px-3 py-1 text-xs uppercase bg-m-acid/5">
                          {t(slot)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {showBuildButton && (
              <div className="border-t border-m-pink/20 p-4 bg-black/50 flex justify-end gap-4">
                {category === 'weapons' && (
                  <button
                    onClick={() => {
                      addToCompare(selectedItem);
                      setSelectedItem(null);
                      nav('/compare');
                    }}
                    className="bg-transparent border border-m-pink text-m-pink px-8 py-3 uppercase text-sm hover:bg-m-pink hover:text-m-black transition-colors font-bold tracking-wider"
                  >
                    К сравнению
                  </button>
                )}
                <button
                  onClick={() => {
                    initBuild(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="bg-m-pink/10 border border-m-pink text-m-pink px-8 py-3 uppercase text-sm hover:bg-m-pink hover:text-m-black transition-colors font-bold tracking-wider shadow-[0_0_10px_rgba(255,0,85,0.2)]"
                >
                  Развернуть конфигурацию
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}