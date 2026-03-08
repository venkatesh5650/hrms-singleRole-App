require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

async function startServer() {
  try {

    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Sync models
    await sequelize.sync({ alter: true });
    logger.info('Database models synchronized');

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`API endpoint: /api/v1`);
    });

  } catch (error) {

    console.log("SERVER START ERROR");
    console.log(error);
    console.log("STACK:", error.stack);

    process.exit(1);

  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Closing HTTP server...');
  await sequelize.close();
  process.exit(0);
});

startServer();
