import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const { token } = useAuthStore();

  useEffect(() => {
    fetch('https://5mpxwrp0-5000.euw.devtunnels.ms/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(console.error);
  }, [token]);

  const updateRole = async (userId, newRole) => {
    await fetch(`https://5mpxwrp0-5000.euw.devtunnels.ms/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role: newRole })
    });
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  return (
    <div className="p-4 border border-m-acid mt-8">
      <h2 className="text-2xl mb-4 text-m-acid">Архитектурный Терминал</h2>
      <div className="space-y-2">
        {users.map(user => (
          <div key={user.id} className="flex justify-between items-center bg-gray-900 p-2">
            <span>{user.username} - Роль: {user.role}</span>
            <select
              value={user.role}
              onChange={(e) => updateRole(user.id, e.target.value)}
              className="bg-black text-m-acid border border-m-acid p-1"
            >
              <option value="бегун">Бегун</option>
              <option value="летописец">Летописец</option>
              <option value="архитектор">Архитектор</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPanel;