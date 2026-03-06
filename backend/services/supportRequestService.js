const { SupportRequest, Employee, User, Team } = require('../models');
const { Op } = require('sequelize');

class SupportRequestService {
  async createSupportRequest(requestData) {
    try {
      const employee = await Employee.findByPk(requestData.employee_id);

      if (!employee) {
        throw new Error('Employee not found');
      }

      const supportRequest = await SupportRequest.create(requestData);

      return await SupportRequest.findByPk(supportRequest.id, {
        include: [
          { 
            model: Employee, 
            as: 'employee',
            include: [{ model: User, as: 'user' }]
          }
        ]
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async resolveSupportRequest(id, resolvedBy) {
    try {
      const supportRequest = await SupportRequest.findByPk(id);

      if (!supportRequest) {
        throw new Error('Support request not found');
      }

      if (supportRequest.status === 'RESOLVED') {
        throw new Error('Support request is already resolved');
      }

      await supportRequest.update({
        status: 'RESOLVED',
        resolved_by: resolvedBy,
        resolved_at: new Date()
      });

      return await SupportRequest.findByPk(id, {
        include: [
          { 
            model: Employee, 
            as: 'employee',
            include: [{ model: User, as: 'user' }]
          }
        ]
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async fetchSupportRequests(options = {}) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        employee_id, 
        status, 
        start_date, 
        end_date 
      } = options;
      const offset = (page - 1) * limit;

      const where = {};

      if (employee_id) {
        where.employee_id = employee_id;
      }

      if (status) {
        where.status = status;
      }

      if (start_date || end_date) {
        where.created_at = {};
        if (start_date) {
          where.created_at[Op.gte] = new Date(start_date);
        }
        if (end_date) {
          where.created_at[Op.lte] = new Date(end_date);
        }
      }

      const { count, rows } = await SupportRequest.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          { 
            model: Employee, 
            as: 'employee',
            include: [
              { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
              { model: Team, as: 'team', attributes: ['id', 'name'] }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return {
        supportRequests: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getOpenSupportRequests() {
    try {
      const requests = await SupportRequest.findAll({
        where: { status: 'OPEN' },
        include: [
          { 
            model: Employee, 
            as: 'employee',
            include: [
              { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
              { model: Team, as: 'team', attributes: ['id', 'name'] }
            ]
          }
        ],
        order: [['created_at', 'ASC']]
      });

      return requests;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getSupportRequestById(id) {
    try {
      const supportRequest = await SupportRequest.findByPk(id, {
        include: [
          { 
            model: Employee, 
            as: 'employee',
            include: [
              { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
              { model: Team, as: 'team', attributes: ['id', 'name'] }
            ]
          }
        ]
      });

      if (!supportRequest) {
        throw new Error('Support request not found');
      }

      return supportRequest;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteSupportRequest(id) {
    try {
      const supportRequest = await SupportRequest.findByPk(id);

      if (!supportRequest) {
        throw new Error('Support request not found');
      }

      await supportRequest.destroy();

      return { message: 'Support request deleted successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new SupportRequestService();
