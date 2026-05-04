import React, { useState, useEffect } from 'react'
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap'
import axios from 'axios'

function Profile({ user, setUser }) {
  const [formData, setFormData] = useState({
    id: user.id,
    name: user.name || '',
    username: user.username || '',
    email: user.email || '',
    phone: user.phone || ''
  })
  const [topUpAmount, setTopUpAmount] = useState('')
  const [topUpError, setTopUpError] = useState('')
  const [topUpSuccess, setTopUpSuccess] = useState('')
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchTotalSpent()
  }, [])

  const fetchTotalSpent = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/user/total-spent', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTotalSpent(response.data.payload?.total_spent || 0)
    } catch (err) {
      console.error('Failed to fetch total spent:', err)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const response = await axios.put('/api/user/update', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const updatedUser = response.data.payload
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleTopUpChange = (e) => {
    setTopUpAmount(e.target.value)
    setTopUpError('')
    setTopUpSuccess('')
  }

  const handleTopUpSubmit = async (e) => {
    e.preventDefault()
    const amount = parseInt(topUpAmount, 10)
    if (Number.isNaN(amount) || amount <= 0) {
      setTopUpError('Enter a valid amount to add to your balance')
      return
    }

    setLoading(true)
    setTopUpError('')
    setTopUpSuccess('')

    try {
      const token = localStorage.getItem('token')
      const updatedBalance = (user.balance || 0) + amount
      const response = await axios.put('/api/user/update', {
        ...formData,
        balance: updatedBalance
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const updatedUser = response.data.payload
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setTopUpAmount('')
      setTopUpSuccess(`Balance updated successfully. New balance: Rp ${updatedUser.balance?.toLocaleString()}`)
    } catch (err) {
      setTopUpError(err.response?.data?.message || 'Failed to add balance')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>My Profile</h2>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5>Update Profile</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-3">
            <Card.Header>
              <h5>Account Summary</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Current Balance:</strong></p>
              <h4 className="text-success">Rp {user.balance?.toLocaleString()}</h4>

              <p><strong>Total Spent:</strong></p>
              <h4 className="text-info">Rp {totalSpent?.toLocaleString()}</h4>

              <p><strong>Member Since:</strong></p>
              <p>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5>Add Balance</h5>
            </Card.Header>
            <Card.Body>
              {topUpError && <Alert variant="danger">{topUpError}</Alert>}
              {topUpSuccess && <Alert variant="success">{topUpSuccess}</Alert>}

              <Form onSubmit={handleTopUpSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount to Add</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    name="topUp"
                    value={topUpAmount}
                    onChange={handleTopUpChange}
                    placeholder="Enter amount"
                    required
                  />
                </Form.Group>
                <Button variant="success" type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Add Balance'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Profile