const { Op } = require('sequelize');
const { AuditLog, User } = require('../models');

class AuditLogService {
  async createLogEntry(logData) {
    try {
      const log = await AuditLog.create(logData);
      return log;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async fetchLogs(options = {}) {
    try {
      const { page = 1, limit = 50, user_id, action, method, start_date, end_date, start_status, end_status } = options;
      const offset = (page - 1) * limit;

      const where = {};

      if (user_id) {
        where.user_id = user_id;
      }

      if (action) {
        where.action = { [Op.like]: `%${action}%` };
      }

      if (method) {
        where.method = method;
      }

      if (start_date || end_date) {
        where.timestamp = {};
        if (start_date) {
          where.timestamp[Op.gte] = new Date(start_date);
        }
        if (end_date) {
          where.timestamp[Op.lte] = new Date(end_date);
        }
      }

      if (start_status !== undefined && !isNaN(start_status) && end_status !== undefined && !isNaN(end_status)) {
        where.status = {
          [Op.between]: [start_status, end_status]
        };
      } else if (start_status !== undefined && !isNaN(start_status)) {
        where.status = start_status;
      } else if (end_status !== undefined && !isNaN(end_status)) {
        where.status = end_status;
      }

      const { count, rows } = await AuditLog.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['timestamp', 'DESC']]
      });

      return {
        logs: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async filterLogs(filters) {
    try {
      const where = {};

      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          if (key === 'start_date' || key === 'end_date') {
            if (!where.timestamp) where.timestamp = {};
            where.timestamp[Op.gte] = new Date(filters[key]);
          } else if (key === 'search') {
            where[Op.or] = [
              { action: { [Op.like]: `%${filters[key]}%` } },
              { path: { [Op.like]: `%${filters[key]}%` } }
            ];
          } else {
            where[key] = filters[key];
          }
        }
      });

      const logs = await AuditLog.findAll({
        where,
        order: [['timestamp', 'DESC']],
        limit: 100
      });

      return logs;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getLogsByUserId(userId, options = {}) {
    try {
      const { page = 1, limit = 50 } = options;
      const offset = (page - 1) * limit;

      const { count, rows } = await AuditLog.findAndCountAll({
        where: { user_id: userId },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['timestamp', 'DESC']]
      });

      return {
        logs: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getRecentActivity(organisationId, limit = 20) {
    try {
      const logs = await AuditLog.findAll({
        where: { user_id: { [Op.ne]: null } },
        limit: parseInt(limit),
        order: [['timestamp', 'DESC']]
      });

      return logs;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new AuditLogService();
