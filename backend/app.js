const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { auditLogger } = require('./middleware/auditLogger');
const { sequelize } = require('./models');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://hrms-single-role-app.vercel.app"
  ],
  methods: ["GET","POST","PUT","DELETE","PATCH"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Audit logging middleware
app.use(auditLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HRMS API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/v1', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to HRMS API',
    version: '1.0.0',
    documentation: '/api/v1'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
