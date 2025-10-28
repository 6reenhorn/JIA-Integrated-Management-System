import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db/postgres';

const router = express.Router();

// Example login route
router.post('/login', async (req, res): Promise<void> => {
  const { username, password } = req.body;

  try {
    // Example query - adjust based on your user table
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];

    // In a real app, you'd hash and compare passwords
    if (password !== user.password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example protected route
router.get('/protected', (req, res) => {
  // In a real app, you'd verify JWT here
  res.json({ message: 'This is a protected route' });
});

export default router;
