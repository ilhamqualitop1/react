// components/AdminUserTable.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminUserTable() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ nom: '', email: '', password: '', role: 'user' });
  const [editId, setEditId] = useState(null);

  const fetchUsers = async () => {
    const res = await axios.get('/api/admin/users');
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await axios.put(`/api/admin/users/${editId}`, formData);
    } else {
      await axios.post('/api/admin/users', formData);
    }
    setFormData({ nom: '', email: '', password: '', role: 'user' });
    setEditId(null);
    fetchUsers();
  };

  const handleEdit = (user) => {
    setEditId(user.id);
    setFormData({ nom: user.nom, email: user.email, role: user.role });
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/admin/users/${id}`);
    fetchUsers();
  };

  return (
    <div>
      <h2>Gestion des utilisateurs</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nom" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required />
        <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
        {!editId && (
          <input type="password" placeholder="Mot de passe" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
        )}
        <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
          <option value="user">Utilisateur</option>
          <option value="admin">Administrateur</option>
        </select>
        <button type="submit">{editId ? 'Modifier' : 'Ajouter'}</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Nom</th><th>Email</th><th>Rôle</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.nom}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => handleEdit(u)}>Modifier</button>
                <button onClick={() => handleDelete(u.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUserTable;
