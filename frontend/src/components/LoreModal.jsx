import { useState } from 'react';

export default function LoreModal({ onClose, onAdded, token, apiBase }) {
  const [formData, setFormData] = useState({
    category: 'UESC',
    title: '',
    content: '',
    image_url: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/api/community/lore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки данных');

      onAdded();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-2 md:p-0">
      <div className="bg-m-black border border-m-pink p-4 md:p-8 w-[95%] md:w-[600px] relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute top-4 right-4 text-m-pink hover:text-white">
          [X]
        </button>
        <h2 className="text-xl md:text-2xl text-m-pink uppercase mb-6 tracking-widest">Внесение данных</h2>

        {error && <div className="text-m-pink text-sm mb-4 border border-m-pink/50 p-2">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <select
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            className="bg-black border border-m-cyan/50 text-m-acid p-2 focus:outline-none focus:border-m-pink uppercase text-sm"
          >
            <option value="UESC">UESC</option>
            <option value="Runners">Бегуны</option>
            <option value="Artifacts">Артефакты</option>
            <option value="Locations">Локации</option>
          </select>

          <input
            type="text"
            placeholder="ЗАГОЛОВОК УЗЛА"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="bg-black border border-m-cyan/50 text-white p-2 focus:outline-none focus:border-m-pink"
            required
          />

          <input
            type="text"
            placeholder="URL ИЗОБРАЖЕНИЯ (ОПЦИОНАЛЬНО)"
            value={formData.image_url}
            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
            className="bg-black border border-m-cyan/50 text-gray-400 p-2 focus:outline-none focus:border-m-pink text-sm"
          />

          <textarea
            placeholder="СОДЕРЖИМОЕ АРХИВА..."
            value={formData.content}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            className="bg-black border border-m-cyan/50 text-white p-2 focus:outline-none focus:border-m-pink min-h-[150px] md:min-h-[200px] resize-y text-sm md:text-base"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-m-pink/20 border border-m-pink text-m-pink py-3 hover:bg-m-pink hover:text-black uppercase tracking-widest transition-colors disabled:opacity-50 text-sm md:text-base"
          >
            {loading ? 'Синхронизация...' : 'Записать в архив'}
          </button>
        </form>
      </div>
    </div>
  );
}