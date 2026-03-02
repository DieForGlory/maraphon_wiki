import { useState, useEffect, useCallback } from 'react';
import { t } from '../utils/translator';
import { useAuthStore } from '../store/useAuthStore';
import LoreModal from '../components/LoreModal';

export default function Lore() {
  const [loreData, setLoreData] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { role, token } = useAuthStore();
  const canEdit = role === 'архитектор' || role === 'летописец';
  const canDelete = role === 'архитектор';

  const API_BASE = "";

  const fetchLore = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/community/lore`)
      .then(res => {
        if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setLoreData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [API_BASE]);

  useEffect(() => {
    fetchLore();
  }, [fetchLore]);

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить запись из архива?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/community/lore/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Сбой удаления');
      setSelectedEntry(null);
      fetchLore();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="flex flex-col md:grid md:grid-cols-4 gap-4 md:gap-8 animate-fade-in min-h-[70vh]">
      <aside className="border-b md:border-b-0 md:border-r border-m-cyan/20 pb-4 md:pb-0 md:pr-4 flex flex-col gap-2">
        <div className="flex justify-between items-end mb-2 md:mb-4 border-b border-m-cyan/10 pb-2">
          <h3 className="text-m-cyan text-[10px] tracking-[0.3em] uppercase opacity-50">
            УЗЛЫ_ДАННЫХ_UESC
          </h3>
          {canEdit && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-m-pink text-[10px] border border-m-pink/30 px-2 py-1 uppercase"
            >
              + Добавить
            </button>
          )}
        </div>

        {loading && <div className="text-[10px] text-gray-600 animate-pulse uppercase">Сканирование...</div>}
        {error && <div className="text-[10px] text-m-pink uppercase">Ошибка: {error}</div>}
        {!loading && loreData.length === 0 && <div className="text-[10px] text-gray-500 uppercase">Архив пуст</div>}

        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto max-h-[15vh] md:max-h-[60vh] custom-scrollbar pb-2 md:pb-0 pr-0 md:pr-2">
          {loreData.map(entry => (
            <button
              key={entry.id}
              onClick={() => setSelectedEntry(entry)}
              className={`flex-shrink-0 w-[180px] md:w-full text-left px-3 py-2 md:px-4 md:py-3 text-[10px] md:text-[11px] uppercase transition-all border-b-2 md:border-b-0 md:border-l-2 font-mono tracking-wider truncate ${
                selectedEntry?.id === entry.id
                ? 'border-m-pink text-m-pink bg-m-pink/5 shadow-[inset_0_0_10px_rgba(255,0,85,0.1)]'
                : 'border-transparent text-gray-500 bg-white/5 md:bg-transparent'
              }`}
            >
              {entry.title}
            </button>
          ))}
        </div>
      </aside>

      <main className="md:col-span-3 border border-m-cyan/10 bg-m-black/40 p-4 md:p-8 relative overflow-hidden flex flex-col min-h-[50vh]">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

        {selectedEntry ? (
          <div className="space-y-4 md:space-y-8 animate-fade-in relative z-10">
            <div className="border-b border-m-cyan/30 pb-4 flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="w-full">
                <span className="text-m-acid text-[10px] tracking-[0.4em] uppercase font-bold">
                  // КАТЕГОРИЯ: {t(selectedEntry.category) || selectedEntry.category}
                </span>
                <h2 className="text-xl md:text-4xl text-white font-bold uppercase tracking-tighter mt-2 leading-tight break-words">
                  {selectedEntry.title}
                </h2>
              </div>
              {canDelete && (
                <button
                  onClick={() => handleDelete(selectedEntry.id)}
                  className="text-red-500 border border-red-500/30 px-3 py-1 text-[10px] md:text-xs uppercase w-full md:w-auto"
                >
                  Удалить
                </button>
              )}
            </div>

            {selectedEntry.image && (
              <div className="w-full h-40 md:h-72 bg-black border border-white/5 overflow-hidden relative">
                <img
                  src={selectedEntry.image}
                  alt={selectedEntry.title}
                  className="w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 transition-all duration-1000"
                  onError={(e) => e.target.style.display = 'none'}
                />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-m-pink/50"></div>
              </div>
            )}

            <div className="text-gray-300 leading-relaxed font-light text-xs md:text-lg whitespace-pre-wrap max-w-4xl border-l-2 border-white/5 pl-4 md:pl-6">
              {selectedEntry.content}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 space-y-6 z-10 py-10">
             <div className="w-12 h-12 md:w-20 md:h-20 border-2 border-m-cyan/30 border-t-m-cyan rounded-full animate-spin"></div>
             <div className="text-center">
               <p className="uppercase tracking-[0.2em] md:tracking-[0.4em] text-[10px] md:text-sm text-m-cyan">Ожидание выбора протокола</p>
             </div>
          </div>
        )}
      </main>
    </div>

      {isModalOpen && (
        <LoreModal
          onClose={() => setIsModalOpen(false)}
          onAdded={fetchLore}
          token={token}
          apiBase={API_BASE}
        />
      )}
    </>
  );
}