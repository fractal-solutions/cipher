const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const config = require('./config');
const User = require('./user');
const users = require('./db');

const app = express();
const PORT = 3333;

app.use(cors());
app.use(bodyParser.json());

// Registration route
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username !== '' && password !== '') {
        const existingUser = users.find(user => user.username === username);

        if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User(username, hashedPassword);
        users.push(newUser);

        res.status(201).json({ message: 'User registered successfully' });
    }
    res.status(400).json() //empty input error
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username !== '' && password !== '') {
      const user = users.find(user => user.username === username);

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ username: user.username }, config.secretKey, { expiresIn: '1h' });

      res.json({ token });
    }
    res.status(400).json() //empty input error
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Student route
app.get('/student', (req, res) => {
  console.log('Student Router Working');
  res.end();
});

app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});
