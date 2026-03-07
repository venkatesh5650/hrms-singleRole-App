const teamService = require('../services/teamService');
const { HTTP_STATUS } = require('../utils/constants');

class TeamController {
  async createTeam(req, res) {
    try {
      const { organisation_id } = req.user;
      const teamData = {
        ...req.body,
        organisation_id
      };

      const team = await teamService.createTeam(teamData);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: team
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateTeam(req, res) {
    try {
      const { id } = req.params;
      const team = await teamService.updateTeam(id, req.body);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: team
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }

  async getTeams(req, res) {
    try {
      const { organisation_id } = req.user;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search,
        is_active: req.query.is_active
      };

      const result = await teamService.getTeams(organisation_id, options);

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

  async getTeamById(req, res) {
    try {
      const { id } = req.params;
      const team = await teamService.getTeamById(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: team
      });
    } catch (error) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
  }

  async assignEmployeeToTeam(req, res) {
    try {
      const { teamId, employeeId } = req.params;
      const employee = await teamService.assignEmployeeToTeam(teamId, employeeId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: employee,
        message: 'Employee assigned to team successfully'
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }

  async removeEmployeeFromTeam(req, res) {
    try {
      const { teamId, employeeId } = req.params;
      await teamService.removeEmployeeFromTeam(teamId, employeeId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Employee removed from team successfully'
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }

  async assignManager(req, res) {
    try {
      const { teamId, managerId } = req.params;
      const team = await teamService.assignManager(teamId, managerId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: team,
        message: 'Manager assigned to team successfully'
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteTeam(req, res) {
    try {
      const { id } = req.params;
      await teamService.deleteTeam(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Team deleted successfully'
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new TeamController();
