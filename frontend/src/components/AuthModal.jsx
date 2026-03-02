import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export default function AuthModal({ onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(`https://5mpxwrp0-5000.euw.devtunnels.ms${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Ошибка запроса');

      if (isLogin) {
        setAuth(data.access_token, data.role, data.username);
        onClose();
      } else {
        setIsLogin(true);
        setError('Регистрация успешна. Выполните вход.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-m-black border border-m-cyan p-4 md:p-6 w-[95%] sm:w-96 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-m-pink hover:text-white">
          [X]
        </button>
        <h2 className="text-xl text-m-cyan uppercase mb-4">
          {isLogin ? 'Авторизация' : 'Регистрация'}
        </h2>

        {error && <div className="text-m-pink text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="ИДЕНТИФИКАТОР (USERNAME)"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="bg-black border border-m-cyan/50 text-m-acid p-2 focus:outline-none focus:border-m-acid"
            required
          />
          <input
            type="password"
            placeholder="КЛЮЧ ДОСТУПА (PASSWORD)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-black border border-m-cyan/50 text-m-acid p-2 focus:outline-none focus:border-m-acid"
            required
          />
          <button type="submit" className="bg-m-cyan/20 border border-m-cyan text-m-cyan py-2 hover:bg-m-cyan hover:text-black uppercase tracking-wider transition-colors">
            {isLogin ? 'Инициировать связь' : 'Создать профиль'}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-xs text-gray-400 mt-4 hover:text-m-acid w-full text-center uppercase"
        >
          {isLogin ? 'Нет доступа? Создать профиль' : 'Уже есть профиль? Войти'}
        </button>
      </div>
    </div>
  );
}