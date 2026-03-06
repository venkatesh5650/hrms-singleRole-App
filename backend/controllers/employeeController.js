const employeeService = require('../services/employeeService');
const { HTTP_STATUS } = require('../utils/constants');

class EmployeeController {
  async listEmployees(req, res) {
    try {
      const { organisation_id } = req.user;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search,
        is_active: req.query.is_active,
        team_id: req.query.team_id
      };

      const result = await employeeService.listEmployees(organisation_id, options);

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

  async createEmployee(req, res) {
    try {
      const { organisation_id } = req.user;
      const employeeData = {
        ...req.body,
        organisation_id
      };

      const employee = await employeeService.createEmployee(employeeData);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: employee
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }

  async getEmployeeById(req, res) {
    try {
      const { id } = req.params;
      const employee = await employeeService.getEmployeeById(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: employee
      });
    } catch (error) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateEmployee(req, res) {
    try {
      const { id } = req.params;
      const employee = await employeeService.updateEmployee(id, req.body);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: employee
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }

  async deactivateEmployee(req, res) {
    try {
      const { id } = req.params;
      const result = await employeeService.deactivateEmployee(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message,
        data: result.employee
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }

  async restoreEmployee(req, res) {
    try {
      const { id } = req.params;
      const result = await employeeService.restoreEmployee(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message,
        data: result.employee
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteEmployee(req, res) {
    try {
      const { id } = req.params;
      await employeeService.deleteEmployee(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Employee deleted successfully'
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new EmployeeController();
