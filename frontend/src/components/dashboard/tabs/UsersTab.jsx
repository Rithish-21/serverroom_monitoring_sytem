import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import api from '../../../services/api.js';

export const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/users/${user.id}`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) return <p style={{ color: 'var(--text-dim)' }}>Loading users...</p>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#fff' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: 'var(--text-muted)' }}>
          <th style={{ padding: '8px' }}>User</th>
          <th style={{ padding: '8px' }}>Phone</th>
          <th style={{ padding: '8px' }}>Role</th>
          <th style={{ padding: '8px', textAlign: 'right' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <td style={{ padding: '10px 8px' }}>
              <div style={{ fontWeight: '600' }}>{u.full_name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{u.email}</div>
            </td>
            <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)' }}>{u.phone}</td>
            <td style={{ padding: '10px 8px' }}>
              <span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-normal'}`}>{u.role}</span>
            </td>
            <td style={{ padding: '10px 8px', textAlign: 'right' }}>
              <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', marginRight: '6px' }} onClick={() => handleToggleRole(u)}>Toggle Role</button>
              <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleDelete(u.id)}><Trash2 size={12} /></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
