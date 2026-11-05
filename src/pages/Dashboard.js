import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const API_BASE = "https://mern-crm-backend-guts.onrender.com";

const Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', status: 'Lead' });
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/customers', config);
      setCustomers(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  }, [navigate, token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchCustomers();
    }
  }, [token, navigate, fetchCustomers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/customers/${editId}`, formData, config);
        alert('Customer updated successfully!');
        setEditId(null);
      } else {
        await axios.post('http://localhost:5000/api/customers', formData, config);
        alert('Customer added successfully!');
      }
      setFormData({ name: '', email: '', phone: '', company: '', status: 'Lead' });
      fetchCustomers();
    } catch (err) {
      alert('Operation failed');
    }
  };

  const handleEdit = (customer) => {
    setEditId(customer._id);
    setFormData({ name: customer.name, email: customer.email, phone: customer.phone, company: customer.company, status: customer.status });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await axios.delete(`http://localhost:5000/api/customers/${id}`, config);
        fetchCustomers();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>Customer Relationship Management (CRM) Dashboard</h2>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </header>

      <div style={styles.content}>
        <form onSubmit={handleSubmit} style={styles.formCard}>
          <h3>{editId ? 'Edit Customer' : 'Add New Customer'}</h3>
          <div style={styles.formGrid}>
            <input placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={styles.input} required />
            <input placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={styles.input} required />
            <input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={styles.input} required />
            <input placeholder="Company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} style={styles.input} required />
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={styles.input}>
              <option value="Lead">Lead</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <button type="submit" style={styles.submitBtn}>{editId ? 'Update Customer' : 'Add Customer'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setFormData({ name: '', email: '', phone: '', company: '', status: 'Lead' }); }} style={styles.cancelBtn}>Cancel</button>}
        </form>

        <h3>Customer Directory ({customers.length})</h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tr}>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c._id} style={styles.tr}>
                <td style={styles.td}>{c.name}</td>
                <td style={styles.td}>{c.email}</td>
                <td style={styles.td}>{c.phone}</td>
                <td style={styles.td}>{c.company}</td>
                <td style={styles.td}><span style={{...styles.badge, background: c.status === 'Active' ? '#d4edda' : '#fff3cd'}}>{c.status}</span></td>
                <td style={styles.td}>
                  <button onClick={() => handleEdit(c)} style={styles.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(c._id)} style={styles.deleteBtn}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1100px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eaeaea', paddingBottom: '10px' },
  logoutBtn: { padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  content: { marginTop: '20px' },
  formCard: { background: '#f9f9f9', padding: '20px', borderRadius: '6px', marginBottom: '30px', border: '1px solid #ddd' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '15px' },
  input: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc' },
  submitBtn: { padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  cancelBtn: { padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px', background: 'white' },
  th: { background: '#343a40', color: 'white', padding: '12px', textAlign: 'left' },
  td: { padding: '12px', borderBottom: '1px solid #ddd' },
  tr: { ':hover': { background: '#f1f1f1' } },
  badge: { padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  editBtn: { padding: '6px 12px', background: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
  deleteBtn: { padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default Dashboard;