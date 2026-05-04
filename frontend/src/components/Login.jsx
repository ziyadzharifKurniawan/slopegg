import React, { useState } from 'react'
import { Form, Button, Alert, Card } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

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

    try {
      const response = await axios.post('/api/auth/login', formData)
      const { token, user } = response.data.payload
      onLogin(user, token)
      navigate('/items')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex justify-content-center">
      <Card style={{ width: '400px' }}>
        <Card.Header>
          <h3 className="text-center">Login</h3>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
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

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading} className="w-100">
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default Login