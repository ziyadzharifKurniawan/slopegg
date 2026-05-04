import React, { useState, useEffect } from 'react'
import { Card, Button, Row, Col, Alert, Modal, Form, Badge, InputGroup } from 'react-bootstrap'
import axios from 'axios'

const itemImages = {
  Laptop: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
  Mouse: 'https://images.unsplash.com/photo-1580894908361-5db36a9289a1?auto=format&fit=crop&w=900&q=80',
  Keyboard: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80',
  Monitor: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
  Headset: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=900&q=80',
  Webcam: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
  'Gaming Chair': 'https://images.unsplash.com/photo-1587202372775-9d3de4dcef16?auto=format&fit=crop&w=900&q=80',
  'External SSD': 'https://images.unsplash.com/photo-1510950297115-3be1b48f1c1a?auto=format&fit=crop&w=900&q=80',
  Router: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
  Smartphone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
}

const itemCatalog = {
  Laptop: {
    category: 'Workstation',
    description: 'Powerful performance for office, content, and gaming.',
    rating: 4.8,
    badge: 'Best Seller',
  },
  Mouse: {
    category: 'Peripherals',
    description: 'Precision wireless mouse with ergonomic comfort.',
    rating: 4.7,
    badge: 'Top Rated',
  },
  Keyboard: {
    category: 'Peripherals',
    description: 'Mechanical keyboard with customizable backlight.',
    rating: 4.6,
    badge: 'Editor Choice',
  },
  Monitor: {
    category: 'Displays',
    description: '27" QHD display for crisp visuals and smooth refresh.',
    rating: 4.9,
    badge: 'Premium',
  },
  Headset: {
    category: 'Audio',
    description: 'Surround sound headset with noise cancellation.',
    rating: 4.5,
    badge: 'Popular',
  },
  Webcam: {
    category: 'Streaming',
    description: 'Full HD webcam perfect for live streaming and meetings.',
    rating: 4.4,
    badge: 'New',
  },
  'Gaming Chair': {
    category: 'Comfort',
    description: 'Ergonomic chair built for long sessions and style.',
    rating: 4.6,
    badge: 'Hot',
  },
  'External SSD': {
    category: 'Storage',
    description: 'Fast portable storage for massive media libraries.',
    rating: 4.7,
    badge: 'Fast',
  },
  Router: {
    category: 'Networking',
    description: 'High-speed router for reliable home and office Wi-Fi.',
    rating: 4.3,
    badge: 'Stable',
  },
  Smartphone: {
    category: 'Mobile',
    description: 'Flagship smartphone with premium camera and battery life.',
    rating: 4.8,
    badge: 'Featured',
  },
}

const categories = ['All', ...new Set(Object.values(itemCatalog).map((item) => item.category))]

const getItemImage = (name) => itemImages[name] || `https://via.placeholder.com/900x500/ffd43b/000000?text=${encodeURIComponent(name || 'slopegg')}`
const getItemMeta = (name) => itemCatalog[name] || {
  category: 'Featured',
  description: 'High-quality electronics and accessories for every setup.',
  rating: 4.2,
  badge: 'Trending',
}

function Items({ user, refreshUser }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortOption, setSortOption] = useState('featured')

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await axios.get('/api/items')
      setItems(response.data.payload || response.data)
    } catch (err) {
      setError('Failed to fetch items')
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = (item) => {
    setSelectedItem(item)
    setQuantity(1)
    setShowModal(true)
  }

  const handlePurchase = async () => {
    if (!selectedItem) return

    const total = selectedItem.price * quantity
    if (total > user.balance) {
      alert('Insufficient balance!')
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/transaction/create', {
        item_id: selectedItem.id,
        quantity: quantity,
        total: total,
        description: `Purchase ${quantity}x ${selectedItem.name}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      alert('Transaction created successfully!')
      setShowModal(false)
      if (refreshUser) {
        await refreshUser()
      }
    } catch (err) {
      alert('Failed to create transaction: ' + (err.response?.data?.message || 'Unknown error'))
    }
  }

  const filteredItems = items
    .map((item) => ({ ...item, meta: getItemMeta(item.name) }))
    .filter((item) => {
      const query = searchTerm.trim().toLowerCase()
      return (
        item.name.toLowerCase().includes(query) ||
        item.meta.category.toLowerCase().includes(query) ||
        item.meta.description.toLowerCase().includes(query)
      )
    })
    .filter((item) => selectedCategory === 'All' || item.meta.category === selectedCategory)
    .sort((a, b) => {
      if (sortOption === 'low') return a.price - b.price
      if (sortOption === 'high') return b.price - a.price
      if (sortOption === 'rating') return b.meta.rating - a.meta.rating
      return b.meta.rating - a.meta.rating
    })

  if (loading) return <div className="text-center">Loading items...</div>
  if (error) return <Alert variant="danger">{error}</Alert>

  return (
    <div className="items-page">
      <div className="hero-banner p-5 mb-4 rounded-4 text-white position-relative overflow-hidden">
        <div className="hero-badge">Official Store</div>
        <h1 className="display-5 fw-bold mb-3">Slopegg — Premium Tech Marketplace</h1>
        <p className="lead mb-4">Discover premium electronics, gaming accessories, and official devices with fast delivery and secure checkout.</p>
        <div className="d-flex flex-wrap gap-2 align-items-center hero-pill-row mb-4">
          <span className="feature-pill">Free shipping over Rp 300k</span>
          <span className="feature-pill">Secure checkout</span>
          <span className="feature-pill">Official warranty</span>
          <span className="feature-pill">24/7 support</span>
        </div>
        <Row className="g-3 hero-stats-row">
          <Col md={4} className="hero-stat-card">
            <div className="stat-number">{items.length}</div>
            <div className="stat-label">Products available</div>
          </Col>
          <Col md={4} className="hero-stat-card">
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Customer satisfaction</div>
          </Col>
          <Col md={4} className="hero-stat-card">
            <div className="stat-number">Fast</div>
            <div className="stat-label">Checkout experience</div>
          </Col>
        </Row>
      </div>

      <div className="store-toolbar align-items-center gap-3 mb-4">
        <InputGroup className="search-input flex-grow-1">
          <InputGroup.Text className="search-icon">🔎</InputGroup.Text>
          <Form.Control
            placeholder="Search by name, category, or feature"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <div className="filter-pills d-flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'warning' : 'outline-secondary'}
              onClick={() => setSelectedCategory(category)}
              className="filter-pill"
            >
              {category}
            </Button>
          ))}
        </div>

        <Form.Select className="sort-select" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="featured">Featured</option>
          <option value="rating">Top Rated</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </Form.Select>
      </div>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4 gap-3 store-summary">
        <div>
          <h2 className="mb-1">Featured Products</h2>
          <p className="text-muted mb-0">Your current balance: <strong>Rp {user.balance?.toLocaleString()}</strong></p>
        </div>
        <div className="category-chips d-flex flex-wrap gap-2">
          {categories.slice(1, 6).map((category) => (
            <span key={category}>{category}</span>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 && (
        <Alert variant="info">No items match your search. Try another keyword or category.</Alert>
      )}

      <Row>
        {filteredItems.map((item) => (
          <Col key={item.id} md={4} className="mb-4">
            <Card className="item-card h-100 shadow-sm border-0">
              <div className="item-image-wrap position-relative">
                <Card.Img variant="top" src={getItemImage(item.name)} className="product-image" />
                <Badge bg="warning" className="item-badge text-dark">{item.meta.badge}</Badge>
              </div>
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <Card.Title className="h5 mb-0">{item.name}</Card.Title>
                  <span className="product-tag">{item.meta.category}</span>
                </div>
                <div className="item-meta mb-2 d-flex align-items-center gap-2">
                  <div className="item-rating">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <span key={idx} className={idx < Math.round(item.meta.rating) ? 'star filled' : 'star'}>★</span>
                    ))}
                  </div>
                  <div className="item-score">{item.meta.rating.toFixed(1)}</div>
                </div>
                <Card.Text className="mb-3 text-muted item-description">
                  {item.meta.description}
                </Card.Text>
                <div className="mb-3 item-stat-row d-flex justify-content-between gap-3">
                  <div>
                    <div className="item-stat">Rp {item.price?.toLocaleString()}</div>
                    <div className="text-muted small">Price</div>
                  </div>
                  <div>
                    <div className="item-stat">{item.stock}</div>
                    <div className="text-muted small">Stock</div>
                  </div>
                </div>
                <Button
                  variant="warning"
                  className="mt-auto text-dark"
                  onClick={() => handleBuy(item)}
                  disabled={item.stock === 0}
                >
                  {item.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Purchase {selectedItem?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <span className="badge bg-secondary mb-2">PRICE</span>
            <p className="mb-1 display-6">Rp {selectedItem?.price?.toLocaleString()}</p>
            <p className="text-muted">Your balance: Rp {user.balance?.toLocaleString()}</p>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max={selectedItem?.stock}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </Form.Group>
          <div className="d-flex justify-content-between align-items-center">
            <strong>Total:</strong>
            <span className="fs-5">Rp {(selectedItem?.price * quantity)?.toLocaleString()}</span>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" className="text-dark" onClick={handlePurchase}>
            Confirm Purchase
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Items