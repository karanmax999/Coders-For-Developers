require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files with caching
app.use(express.static(path.join(__dirname), {
  maxAge: '1d', // Cache static assets for 1 day
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache'); // Don't cache HTML files
    }
  }
}));

// API routes
app.post('/api/auth/google', (req, res) => {
  // Handle Google authentication
  const { token } = req.body;
  // Verify token and create session
  // This is a placeholder for actual implementation
  res.json({ success: true, message: 'Authentication successful' });
});

// Page routes
const sendPage = (page) => (req, res) => {
  res.sendFile(path.join(__dirname, `${page}.html`));
};

app.get('/', sendPage('home'));
app.get('/discover', sendPage('discover'));
app.get('/jobs', sendPage('jobs'));
app.get('/internships', sendPage('internships'));
app.get('/faq', sendPage('faq'));
app.get('/contact', sendPage('contact'));

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(__dirname, '500.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
