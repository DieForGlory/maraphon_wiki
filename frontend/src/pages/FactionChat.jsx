import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_BASE = "";

export default function FactionChat() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/factions/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faction_id: id, message: userText })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'faction', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'system', text: `ОШИБКА: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] border border-m-cyan/30 bg-m-black/40 relative">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

      <div className="border-b border-m-cyan/30 p-4 flex justify-between items-center bg-black/50 relative z-10">
        <h2 className="text-xl text-m-cyan uppercase tracking-widest font-bold">
          Канал: {id.toUpperCase()}
        </h2>
        <Link to="/factions" className="text-xs text-m-pink hover:text-white uppercase border border-m-pink/30 px-2 py-1">
          [ Разорвать связь ]
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar relative z-10">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 text-xs uppercase tracking-widest mt-10">
            Соединение установлено. Терминал готов к передаче.
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className={`text-[10px] uppercase tracking-widest mb-1 ${msg.role === 'user' ? 'text-m-acid' : msg.role === 'system' ? 'text-red-500' : 'text-m-cyan'}`}>
              {msg.role === 'user' ? 'ВЫ' : msg.role === 'system' ? 'СИСТЕМА' : id.toUpperCase()}
            </span>
            <div className={`max-w-[85%] md:max-w-[70%] p-3 md:p-4 text-sm whitespace-pre-wrap border ${
              msg.role === 'user'
                ? 'bg-m-acid/10 border-m-acid/30 text-white'
                : msg.role === 'system'
                  ? 'bg-red-500/10 border-red-500/30 text-red-500'
                  : 'bg-m-cyan/5 border-m-cyan/30 text-gray-300 font-light'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex flex-col items-start animate-pulse">
            <span className="text-[10px] uppercase tracking-widest mb-1 text-m-cyan">{id.toUpperCase()}</span>
            <div className="p-4 border border-m-cyan/30 bg-m-cyan/5">
              <span className="inline-block w-2 h-4 bg-m-cyan animate-ping"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="border-t border-m-cyan/30 p-4 bg-black/50 relative z-10 flex gap-4">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="ВВЕДИТЕ СООБЩЕНИЕ..."
          className="flex-1 bg-transparent border border-m-cyan/50 text-white p-3 focus:outline-none focus:border-m-acid text-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-m-cyan/20 border border-m-cyan text-m-cyan px-6 hover:bg-m-cyan hover:text-black uppercase tracking-widest transition-colors disabled:opacity-50 text-sm"
        >
          Tx
        </button>
      </form>
    </div>
  );
}