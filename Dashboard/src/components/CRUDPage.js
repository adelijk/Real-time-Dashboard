import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CRUDPage.css';  // Import the CSS file

const CRUDPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    transaction_id: '',
    customer_name: '',
    product_name: '',
    category: '',
    quantity: 0,
    total_price: 0,
    payment_method: '',
    location: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:3000/transactions');
      setTransactions(response.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/transactions', formData);
      fetchTransactions();
      setFormData({
        transaction_id: '',
        customer_name: '',
        product_name: '',
        category: '',
        quantity: 0,
        total_price: 0,
        payment_method: '',
        location: ''
      });
    } catch (err) {
      console.error('Error creating transaction:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  return (
    <div className="crud-container">
      <h2>CRUD Operations</h2>
      <form onSubmit={handleSubmit} className="crud-form">
        <input type="text" name="transaction_id" value={formData.transaction_id} onChange={handleChange} placeholder="Transaction ID" required />
        <input type="text" name="customer_name" value={formData.customer_name} onChange={handleChange} placeholder="Customer Name" required />
        <input type="text" name="product_name" value={formData.product_name} onChange={handleChange} placeholder="Product Name" required />
        <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Category" required />
        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Quantity" required />
        <input type="number" name="total_price" value={formData.total_price} onChange={handleChange} placeholder="Total Price" required />
        <input type="text" name="payment_method" value={formData.payment_method} onChange={handleChange} placeholder="Payment Method" required />
        <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location" required />
        <button type="submit">Add Transaction</button>
      </form>
      <table className="crud-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Total Price</th>
            <th>Payment</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>{transaction.transaction_id}</td>
              <td>{transaction.customer_name}</td>
              <td>{transaction.product_name}</td>
              <td>{transaction.category}</td>
              <td>{transaction.quantity}</td>
              <td>{transaction.total_price}</td>
              <td>{transaction.payment_method}</td>
              <td>{transaction.location}</td>
              <td>
                <button onClick={() => handleDelete(transaction._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CRUDPage;
