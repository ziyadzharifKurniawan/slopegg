import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { Navbar, Container, Nav } from 'react-bootstrap'
import Login from './components/Login'
import Register from './components/Register'
import Items from './components/Items'
import Transactions from './components/Transactions'
import Reports from './components/Reports'
import Profile from './components/Profile'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return null

      const response = await axios.get('/api/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const currentUser = response.data.payload
      if (currentUser) {
        setUser(currentUser)
        localStorage.setItem('user', JSON.stringify(currentUser))
      }
      return currentUser
    } catch (err) {
      console.error('Failed to refresh user profile:', err)
      return null
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token) {
      fetchCurrentUser().then((currentUser) => {
        if (!currentUser && userData) {
          setUser(JSON.parse(userData))
        }
        setLoading(false)
      })
    } else {
      if (userData) {
        setUser(JSON.parse(userData))
      }
      setLoading(false)
    }
  }, [])

  const handleLogin = (userData, token) => {
    setUser(userData)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const navigate = useNavigate()

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>
  }

  return (
    <div>
      <Navbar expand="lg" className="navbar-slopegg shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/" className="brand-logo">
            <span className="brand-mark">S</span>slopegg<span className="brand-dot">.com</span>
            <div className="brand-tagline">Official Electronics Store</div>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto nav-pill-group">
              {user ? (
                <>
                  <Nav.Link as={Link} to="/items">Store</Nav.Link>
                  <Nav.Link as={Link} to="/transactions">Orders</Nav.Link>
                  <Nav.Link as={Link} to="/reports">Reports</Nav.Link>
                  <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                  <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">Login</Nav.Link>
                  <Nav.Link as={Link} to="/register">Register</Nav.Link>
                </>
              )}
            </Nav>
            {user && (
              <Navbar.Text className="navbar-user-info">
                <strong>Hi, {user.name}</strong> · Balance: Rp {user.balance?.toLocaleString()}
              </Navbar.Text>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<Navigate to={user ? "/items" : "/login"} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/items" element={user ? <Items user={user} refreshUser={fetchCurrentUser} /> : <Navigate to="/login" />} />
          <Route path="/transactions" element={user ? <Transactions user={user} refreshUser={fetchCurrentUser} /> : <Navigate to="/login" />} />
          <Route path="/reports" element={user ? <Reports /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        </Routes>
      </Container>
    </div>
  )
}

export default App