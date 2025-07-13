import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import axiosInstance from '../../utils/axios';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, firstname: '', name: '', email: '', password: '' });

  // Fetch users using axios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Erreur de chargement des utilisateurs :', error);
      }
    };

    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setFormData({ id: null, firstname: '', name: '', email: '', password: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setFormData({ ...user, password: '' });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        // Update user
        await axiosInstance.put(`/users/${formData.id}`, formData);
        setUsers((prev) =>
          prev.map((u) => (u.id === formData.id ? { ...formData, password: undefined } : u))
        );
      } else {
        // Create user
        const response = await axiosInstance.post('/users', formData);
        setUsers((prev) => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire :', error);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return;
  
    try {
      await axiosInstance.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Erreur lors de la suppression :', error);
    }
  };
  

  return (
    <Container>
      <Header>
        <h3>Liste des utilisateurs</h3>
        <Button onClick={openCreateModal}>Créer un utilisateur</Button>
      </Header>

      <Table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.firstname}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td style={{display: 'flex', alignItems: 'center', gap: 4
              }} >
                <ActionButton onClick={() => openEditModal(user)}>Modifier</ActionButton>
                <CancelButton style={{ marginLeft: '10px' }} onClick={() => handleDelete(user.id)}>
                    Supprimer
                </CancelButton>
              </td>

            </tr>
          ))}
        </tbody>
      </Table>

      {isModalOpen && (
        <ModalOverlay>
          <Modal>
            <h3>{formData.id ? 'Modifier' : 'Créer'} un utilisateur</h3>
            <form onSubmit={handleSubmit}>
              <Input
                name="firstname"
                placeholder="Nom"
                value={formData.firstname}
                onChange={handleChange}
                required
              />
              <Input
                name="name"
                placeholder="Prénom"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
                required={!formData.id}
              />
              <ModalButtons>
                <Button type="submit">Enregistrer</Button>
                <CancelButton type="button" onClick={() => setIsModalOpen(false)}>Annuler</CancelButton>
              </ModalButtons>
            </form>
          </Modal>
        </ModalOverlay>
      )}
    </Container>
  );
};

// Styled Components (same as before)

const Container = styled.div`
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);

  th, td {
    padding: 12px;
    border: 1px solid #ccc;
    text-align: left;
  }

  th {
    background-color: #f4f4f4;
  }
`;

const Button = styled.button`
  background-color: #2b6cb0;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #2c5282;
  }
`;

const ActionButton = styled(Button)`
  background-color: #4a5568;

  &:hover {
    background-color: #2d3748;
  }
`;

const CancelButton = styled(Button)`
  background-color: #e53e3e;

  &:hover {
    background-color: #c53030;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const Modal = styled.div`
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-top: 12px;
  margin-bottom: 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

export default UsersPage;
