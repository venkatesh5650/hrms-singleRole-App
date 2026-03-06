const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'app.log');

const logger = {
  info: (message, ...args) => {
    const log = `[${new Date().toISOString()}] INFO: ${message} ${args.length ? JSON.stringify(args) : ''}`;
    console.log(log);
    fs.appendFileSync(logFile, log + '\n');
  },

  error: (message, ...args) => {
    const log = `[${new Date().toISOString()}] ERROR: ${message} ${args.length ? JSON.stringify(args) : ''}`;
    console.error(log);
    fs.appendFileSync(logFile, log + '\n');
  },

  warn: (message, ...args) => {
    const log = `[${new Date().toISOString()}] WARN: ${message} ${args.length ? JSON.stringify(args) : ''}`;
    console.warn(log);
    fs.appendFileSync(logFile, log + '\n');
  },

  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      const log = `[${new Date().toISOString()}] DEBUG: ${message} ${args.length ? JSON.stringify(args) : ''}`;
      console.log(log);
      fs.appendFileSync(logFile, log + '\n');
    }
  }
};

module.exports = logger;
