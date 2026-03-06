const approvalService = require('../services/approvalService');
const { HTTP_STATUS } = require('../utils/constants');

class ApprovalController {
  async createApprovalRequest(req, res) {
    try {
      const { organisation_id, id: userId } = req.user;
      const approvalData = {
        ...req.body,
        organisation_id,
        user_id: userId
      };

      const approval = await approvalService.createApprovalRequest(approvalData);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: approval
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }

  async approveRequest(req, res) {
    try {
      const { id } = req.params;
      const { id: approvedBy } = req.user;

      const approval = await approvalService.approveRequest(id, approvedBy, req.body);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: approval,
        message: 'Request approved successfully'
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }

  async rejectRequest(req, res) {
    try {
      const { id } = req.params;
      const { id: rejectedBy } = req.user;
      const { rejection_reason } = req.body;

      if (!rejection_reason) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Rejection reason is required'
        });
      }

      const approval = await approvalService.rejectRequest(id, rejectedBy, rejection_reason);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: approval,
        message: 'Request rejected successfully'
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }

  async getApprovalHistory(req, res) {
    try {
      const { organisation_id } = req.user;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        user_id: req.query.user_id,
        type: req.query.type,
        status: req.query.status,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const result = await approvalService.getApprovalHistory(organisation_id, options);

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

  async getPendingApprovals(req, res) {
    try {
      const { organisation_id } = req.user;
      const approvals = await approvalService.getPendingApprovals(organisation_id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: approvals
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async getApprovalById(req, res) {
    try {
      const { id } = req.params;
      const approval = await approvalService.getApprovalById(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: approval
      });
    } catch (error) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ApprovalController();
