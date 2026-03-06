const auditLogService = require('../services/auditLogService');
const { HTTP_STATUS } = require('../utils/constants');

class AuditLogController {
  async fetchLogs(req, res) {
    try {
      const options = {
  page: parseInt(req.query.page) || 1,
  limit: parseInt(req.query.limit) || 50,
  user_id: req.query.user_id,
  action: req.query.action,
  method: req.query.method,
  start_date: req.query.start_date,
  end_date: req.query.end_date,
  start_status: parseInt(req.query.start_status),
  end_status: parseInt(req.query.end_status),

  // ensure newest logs appear first
  order: [['timestamp', 'DESC']]
};

      const result = await auditLogService.fetchLogs(options);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async filterLogs(req, res) {
    try {
      const filters = {
        user_id: req.query.user_id,
        action: req.query.action,
        method: req.query.method,
        path: req.query.path,
        status: parseInt(req.query.status),
        search: req.query.search,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const logs = await auditLogService.filterLogs(filters);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: logs
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async getRecentActivity(req, res) {
    try {
      const { organisation_id } = req.user;
      const limit = parseInt(req.query.limit) || 20;

      const logs = await auditLogService.getRecentActivity(organisation_id, limit);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: logs
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async getLogsByUserId(req, res) {
    try {
      const { userId } = req.params;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50
      };

      const result = await auditLogService.getLogsByUserId(userId, options);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuditLogController();
