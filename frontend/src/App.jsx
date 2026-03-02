import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Builder from './pages/Builder';
import CategoryDb from './pages/CategoryDb';
import Compare from './pages/Compare';
import BuildDetails from './pages/BuildDetails';
import Lore from './pages/Lore';
import Highlights from './pages/Highlights';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import Factions from './pages/Factions';
import FactionChat from './pages/FactionChat';

function App() {
  return (
    <div className="min-h-screen bg-m-black text-m-acid p-2 md:p-8 font-mono pb-24 overflow-x-hidden">
      <Header />
      <Routes>
        <Route path="/" element={<Builder />} />
        <Route path="/lore" element={<Lore />} />
        <Route path="/highlights" element={<Highlights />} />
        <Route path="/db/:category" element={<CategoryDb />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/build" element={<BuildDetails />} />
        <Route path="/factions" element={<Factions />} />
        <Route path="/factions/:id" element={<FactionChat />} />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['архитектор']}>
            <AdminPanel />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;