const { Approval, User, Employee } = require('../models');
const { Op } = require('sequelize');

class ApprovalService {
  async createApprovalRequest(approvalData) {
    try {
      const approval = await Approval.create(approvalData);

      return await Approval.findByPk(approval.id, {
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }]
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async approveRequest(id, approvedBy, data = {}) {
    try {
      const approval = await Approval.findByPk(id);

      if (!approval) {
        throw new Error('Approval request not found');
      }

      if (approval.status !== 'PENDING') {
        throw new Error('Approval request is not pending');
      }

      await approval.update({
        status: 'APPROVED',
        approved_by: approvedBy,
        approved_at: new Date(),
        ...data
      });

      return await Approval.findByPk(id, {
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }]
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async rejectRequest(id, rejectedBy, rejectionReason) {
    try {
      const approval = await Approval.findByPk(id);

      if (!approval) {
        throw new Error('Approval request not found');
      }

      if (approval.status !== 'PENDING') {
        throw new Error('Approval request is not pending');
      }

      await approval.update({
        status: 'REJECTED',
        rejected_by: rejectedBy,
        rejected_at: new Date(),
        rejection_reason: rejectionReason
      });

      return await Approval.findByPk(id, {
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }]
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getApprovalHistory(organisationId, options = {}) {
    try {
      const { page = 1, limit = 10, user_id, type, status, start_date, end_date } = options;
      const offset = (page - 1) * limit;

      const where = { organisation_id: organisationId };

      if (user_id) {
        where.user_id = user_id;
      }

      if (type) {
        where.type = type;
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

      const { count, rows } = await Approval.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }
        ],
        order: [['created_at', 'DESC']]
      });

      return {
        approvals: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getPendingApprovals(organisationId) {
    try {
      const approvals = await Approval.findAll({
        where: {
          organisation_id: organisationId,
          status: 'PENDING'
        },
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }
        ],
        order: [['created_at', 'ASC']]
      });

      return approvals;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getApprovalById(id) {
    try {
      const approval = await Approval.findByPk(id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }
        ]
      });

      if (!approval) {
        throw new Error('Approval request not found');
      }

      return approval;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new ApprovalService();
