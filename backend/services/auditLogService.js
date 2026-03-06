const { AuditLog, User } = require('../models');
const { Op } = require('sequelize');

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
    let { page = 1, limit = 50, user_id, action, method, start_date, end_date } = options;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 50;

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

      

      const { count, rows } = await AuditLog.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }
        ],
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
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }
        ],
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
        where: { organisation_id: organisationId },
        limit: parseInt(limit),
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }
        ],
        order: [['timestamp', 'DESC']]
      });

      return logs;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new AuditLogService();
