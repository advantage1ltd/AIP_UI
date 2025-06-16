const express = require('express');
const router = express.Router();

// This is a temporary solution. In production, you should:
// 1. Use a real database
// 2. Hash passwords
// 3. Use proper session management
// 4. Implement rate limiting
const users = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    displayName: 'Alice Admin',
    role: 'Administrator',
    pageAccessRole: 'administrator'
  },
  {
    id: '2',
    username: 'officer1',
    password: 'officer123',
    displayName: 'Oscar Officer',
    role: 'Advantage One Officer',
    pageAccessRole: 'advantage-officer'
  }
];

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Don't send password in response
    const { password: _, ...userInfo } = user;

    return res.status(200).json({
      success: true,
      data: userInfo
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 