const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function updatePasswords() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    const hash = '$2b$10$tW6eOcyS48Z8r0rDqH0TOuhjQ0F.TTl801dRf2UveXYj195iji1MO';
    await client.query(
      "UPDATE users SET password = $1 WHERE email IN ('alice@example.com', 'bob@example.com', 'charlie@example.com')",
      [hash]
    );

    console.log('Passwords updated successfully');
  } catch (err) {
    console.error('Error updating passwords:', err);
  } finally {
    await client.end();
  }
}

updatePasswords();