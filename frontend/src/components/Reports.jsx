import React, { useState, useEffect } from 'react'
import { Card, Table, Alert, Row, Col } from 'react-bootstrap'
import axios from 'axios'

function Reports() {
  const [topUsers, setTopUsers] = useState([])
  const [itemsSold, setItemsSold] = useState([])
  const [monthlySales, setMonthlySales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const [topUsersRes, itemsSoldRes, monthlySalesRes] = await Promise.all([
        axios.get('/api/reports/top-users'),
        axios.get('/api/reports/items-sold'),
        axios.get('/api/reports/monthly-sales')
      ])

      setTopUsers(topUsersRes.data.payload || topUsersRes.data)
      setItemsSold(itemsSoldRes.data.payload || itemsSoldRes.data)
      setMonthlySales(monthlySalesRes.data.payload || monthlySalesRes.data)
    } catch (err) {
      setError('Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center">Loading reports...</div>
  if (error) return <Alert variant="danger">{error}</Alert>

  return (
    <div>
      <h2>Reports & Analytics</h2>

      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Top Users by Spending</h5>
            </Card.Header>
            <Card.Body>
              {topUsers.length === 0 ? (
                <p>No data available</p>
              ) : (
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUsers.map(user => (
                      <tr key={user.user_id}>
                        <td>{user.name}</td>
                        <td>Rp {user.total_spent?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Items Sold</h5>
            </Card.Header>
            <Card.Body>
              {itemsSold.length === 0 ? (
                <p>No data available</p>
              ) : (
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsSold.map(item => (
                      <tr key={item.item_id}>
                        <td>{item.name}</td>
                        <td>{item.total_sold}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5>Monthly Sales</h5>
        </Card.Header>
        <Card.Body>
          {monthlySales.length === 0 ? (
            <p>No data available</p>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total Sales</th>
                  <th>Transaction Count</th>
                </tr>
              </thead>
              <tbody>
                {monthlySales.map(sale => (
                  <tr key={sale.month}>
                    <td>{sale.month}</td>
                    <td>Rp {sale.total_sales?.toLocaleString()}</td>
                    <td>{sale.transaction_count}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default Reports