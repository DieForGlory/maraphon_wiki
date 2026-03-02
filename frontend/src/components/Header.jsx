import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import AuthModal from './AuthModal';

const CATEGORIES = [
  { path: 'shells', label: 'Оболочки' },
  { path: 'weapons', label: 'Оружие' },
  { path: 'ammo', label: 'Патроны' },
  { path: 'backpacks', label: 'Рюкзаки' },
  { path: 'consumables', label: 'Расходники' },
  { path: 'cores', label: 'Ядра' },
  { path: 'implanty', label: 'Импланты' },
  { path: 'mods', label: 'Модификации' },
  { path: 'valuables', label: 'Ценности' }
];

export default function Header() {
  const loc = useLocation();
  const { user, role, logout } = useAuthStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const mainNav = [
    { path: '/', label: 'Конструктор' },
    { path: '/compare', label: 'Сравнение' },
    { path: '/lore', label: 'ЛОР' },
    { path: '/highlights', label: 'Хайлайты' },
    { path: '/factions', label: 'Фракции' } // ДОБАВИТЬ
  ];

  if (role === 'архитектор') {
    mainNav.push({ path: '/admin', label: 'Терминал' });
  }

  return (
    <>
      <header className="border-b border-m-pink pb-4 mb-4 md:mb-8 flex flex-col gap-4 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl md:text-4xl uppercase tracking-widest text-m-cyan truncate">Marathon Core</h1>
          <p className="text-[10px] md:text-sm opacity-70 truncate">v0.7.1 // Системы синхронизированы</p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto overflow-hidden">
          <div className="text-[10px] md:text-xs border border-m-acid/30 px-2 py-1 flex items-center justify-between w-full md:w-auto gap-2">
            {user ? (
              <>
                <span className="text-m-acid truncate max-w-[100px] md:max-w-[200px]">USER: {user}</span>
                <span className="text-m-cyan border-l border-m-acid/30 pl-2">ROLE: {role}</span>
                <button onClick={logout} className="text-m-pink uppercase ml-auto">[Отключение]</button>
              </>
            ) : (
              <>
                <span className="text-gray-500">СТАТУС: РУК</span>
                <button onClick={() => setIsAuthOpen(true)} className="text-m-cyan uppercase ml-auto">[Авторизация]</button>
              </>
            )}
          </div>

          <nav className="flex gap-4 md:gap-6 mt-1 overflow-x-auto w-full pb-2 custom-scrollbar">
            {mainNav.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`uppercase tracking-wider text-xs md:text-sm pb-1 border-b-2 whitespace-nowrap ${
                  loc.pathname === link.path
                  ? 'border-m-acid text-m-acid'
                  : 'border-transparent text-m-cyan hover:border-m-cyan'
                }`}
              >
                [{link.label}]
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="w-full overflow-x-auto custom-scrollbar pb-2 border-t border-m-cyan/20 pt-2">
        <nav className="flex gap-4 w-max px-2">
          {CATEGORIES.map(cat => {
            const fullPath = `/db/${cat.path}`;
            const isActive = loc.pathname === fullPath;
            return (
              <Link
                key={cat.path}
                to={fullPath}
                className={`uppercase text-[11px] px-2 py-1 border transition-colors whitespace-nowrap ${
                  isActive
                  ? 'bg-m-pink/20 border-m-pink text-m-pink'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>

      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
    </>
  );
}