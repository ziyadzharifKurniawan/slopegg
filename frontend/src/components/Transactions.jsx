import React, { useState, useEffect } from 'react'
import { Card, Button, Table, Alert, Badge } from 'react-bootstrap'
import axios from 'axios'

function Transactions({ refreshUser }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/user/history', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTransactions(response.data.payload || response.data)
    } catch (err) {
      setError('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async (transactionId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(`/api/transaction/pay/${transactionId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (refreshUser) {
        await refreshUser()
      }
      alert('Payment successful!')
      fetchTransactions()
    } catch (err) {
      alert('Payment failed: ' + (err.response?.data?.message || 'Unknown error'))
    }
  }

  const handleDelete = async (transactionId) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/transaction/${transactionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Transaction deleted!')
      fetchTransactions()
    } catch (err) {
      alert('Failed to delete transaction: ' + (err.response?.data?.message || 'Unknown error'))
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge bg="success">Paid</Badge>
      case 'pending':
        return <Badge bg="warning">Pending</Badge>
      default:
        return <Badge bg="secondary">{status}</Badge>
    }
  }

  if (loading) return <div className="text-center">Loading transactions...</div>
  if (error) return <Alert variant="danger">{error}</Alert>

  return (
    <div>
      <h2>My Transactions</h2>
      {transactions.length === 0 ? (
        <Alert variant="info">No transactions found.</Alert>
      ) : (
        <Card>
          <Card.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>{transaction.id}</td>
                    <td>{transaction.item_name}</td>
                    <td>{transaction.quantity}</td>
                    <td>Rp {transaction.total?.toLocaleString()}</td>
                    <td>{getStatusBadge(transaction.status)}</td>
                    <td>{new Date(transaction.created_at).toLocaleDateString()}</td>
                    <td>
                      {transaction.status === 'pending' && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handlePay(transaction.id)}
                            className="me-2"
                          >
                            Pay
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  )
}

export default Transactions