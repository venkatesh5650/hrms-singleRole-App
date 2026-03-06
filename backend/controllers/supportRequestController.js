const supportRequestService = require('../services/supportRequestService');
const { HTTP_STATUS } = require('../utils/constants');

class SupportRequestController {
  async createSupportRequest(req, res) {
    try {
      const { employee_id, message } = req.body;

      if (!employee_id || !message) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Employee ID and message are required'
        });
      }

      const supportRequest = await supportRequestService.createSupportRequest({
        employee_id,
        message
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: supportRequest
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }

  async resolveSupportRequest(req, res) {
    try {
      const { id } = req.params;
      const { id: resolvedBy } = req.user;

      const supportRequest = await supportRequestService.resolveSupportRequest(id, resolvedBy);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: supportRequest,
        message: 'Support request resolved successfully'
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }

  async fetchSupportRequests(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        employee_id: req.query.employee_id,
        status: req.query.status,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const result = await supportRequestService.fetchSupportRequests(options);

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

  async getOpenSupportRequests(req, res) {
    try {
      const requests = await supportRequestService.getOpenSupportRequests();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: requests
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async getSupportRequestById(req, res) {
    try {
      const { id } = req.params;
      const supportRequest = await supportRequestService.getSupportRequestById(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: supportRequest
      });
    } catch (error) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteSupportRequest(req, res) {
    try {
      const { id } = req.params;
      await supportRequestService.deleteSupportRequest(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Support request deleted successfully'
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new SupportRequestController();
