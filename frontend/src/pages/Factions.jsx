import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = "";

export default function Factions() {
  const [factions, setFactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/factions/`)
      .then(res => res.json())
      .then(data => {
        setFactions(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <div className="text-m-cyan uppercase animate-pulse">Установка соединения...</div>;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="border-b border-m-cyan/30 pb-4">
        <h2 className="text-3xl md:text-4xl text-white font-bold uppercase tracking-widest">
          Фракции
        </h2>
        <p className="text-sm opacity-50 mt-2 tracking-widest uppercase">Сеть зашифрованных каналов связи</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {factions.map(faction => (
          <Link
            key={faction.id}
            to={`/factions/${faction.id}`}
            className="border border-m-cyan/30 bg-m-black/40 p-6 hover:border-m-pink hover:bg-m-pink/5 transition-all group flex flex-col"
          >
            <h3 className="text-xl text-m-cyan group-hover:text-m-pink uppercase tracking-widest font-bold mb-4">
              {faction.name}
            </h3>
            <p className="text-sm text-gray-400 mb-8 flex-1">
              {faction.description}
            </p>
            <div className="text-[10px] text-m-acid uppercase tracking-widest border border-m-acid/20 py-2 text-center w-full">
              [ Инициировать связь ]
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}