const auditLogService = require('../services/auditLogService');

const auditLogger = async (req, res, next) => {
  // Store original end function
  const originalEnd = res.end;

  // Override end function to capture response
  res.end = async function (chunk, encoding) {
    res.end = originalEnd;
    res.end(chunk, encoding);

    // Skip logging for certain paths
    const skipPaths = ['/health', '/api/v1/auth/login'];
    if (skipPaths.includes(req.path)) {
      return;
    }

    // Extract resource from path (e.g., /api/v1/employees -> employees)
    const pathParts = req.originalUrl.split('/');
    const resource = pathParts[3] || pathParts[2] || 'system';

    // Determine action based on method
    const action = req.method;

    // Create log entry with industry-standard fields
    try {
      const logEntry = {
        user_id: req.user?.id || null,
        user_name: req.user?.name || req.user?.email || 'Anonymous',
        action: action,
        resource: resource,
        method: req.method,
        path: req.originalUrl,
        status_code: res.statusCode,
        status: res.statusCode, // For frontend compatibility
        ip_address: req.ip || req.connection?.remoteAddress || 'unknown',
        user_agent: req.headers['user-agent'] || 'unknown',
        timestamp: new Date()
      };

      // Don't await - fire and forget
      auditLogService.createLogEntry(logEntry).catch(err => {
        console.error('Audit log error:', err);
      });
    } catch (error) {
      console.error('Audit middleware error:', error);
    }
  };

  next();
};

module.exports = { auditLogger };
