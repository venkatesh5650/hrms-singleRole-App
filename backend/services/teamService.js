const { Op } = require('sequelize');
const { User, Employee, Team, EmployeeTeam } = require('../models');

class TeamService {
  async createTeam(teamData) {
    try {
      const team = await Team.create(teamData);
      return await Team.findByPk(team.id);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateTeam(id, teamData) {
    try {
      const team = await Team.findByPk(id);

      if (!team) {
        throw new Error('Team not found');
      }

      await team.update(teamData);

      return await Team.findByPk(id);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getTeams(organisationId, options = {}) {
    try {
      const { page = 1, limit = 10, search, is_active } = options;
      const offset = (page - 1) * limit;

      const where = { organisation_id: organisationId };

      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      if (is_active !== undefined) {
        where.is_active = is_active;
      }

      // Get total count separately to avoid duplicate rows from joins
      const total = await Team.count({ where });

      // Get rows without include for accurate pagination
      const rows = await Team.findAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [{ model: Employee, as: 'members', required: false }],
        order: [['created_at', 'DESC']]
      });

      return {
        teams: rows,
        total: total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getTeamById(id) {
    try {
      const team = await Team.findByPk(id, {
        include: [{ model: Employee, as: 'members' }]
      });

      if (!team) {
        throw new Error('Team not found');
      }

      return team;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async assignEmployeeToTeam(teamId, employeeId) {
    try {
      const { EmployeeTeam } = require("../models");

      const team = await Team.findByPk(teamId);
      if (!team) {
        throw new Error('Team not found');
      }

      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Check if the relationship already exists in EmployeeTeam join table
      const exists = await EmployeeTeam.findOne({
        where: { team_id: teamId, employee_id: employeeId }
      });

      // If not exists, create the relationship
      if (!exists) {
        await EmployeeTeam.create({ team_id: teamId, employee_id: employeeId });
      }

      // Update employee team_id for quick reference
      await employee.update({ team_id: teamId });

      return await Employee.findByPk(employeeId, {
        include: [
          { model: User, as: "user" },
          { model: Team, as: "teams" }
        ]
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async removeEmployeeFromTeam(employeeId) {
    try {
      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Remove from EmployeeTeam join table
      await EmployeeTeam.destroy({
        where: { employee_id: employeeId }
      });

      // Clear team_id reference
      await employee.update({ team_id: null });

      return { message: 'Employee removed from team successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async assignManager(teamId, managerId) {
    try {
      const team = await Team.findByPk(teamId);
      if (!team) {
        throw new Error('Team not found');
      }

      const manager = await Employee.findByPk(managerId);
      if (!manager) {
        throw new Error('Manager not found');
      }

      await team.update({ manager_id: managerId });

      return await Team.findByPk(teamId);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteTeam(id) {
    try {
      const team = await Team.findByPk(id);

      if (!team) {
        throw new Error('Team not found');
      }

      // Remove all employee-team associations
      await EmployeeTeam.destroy({ where: { team_id: id } });

      // Clear team_id from all employees
      await Employee.update({ team_id: null }, { where: { team_id: id } });

      await team.destroy();

      return { message: 'Team deleted successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new TeamService();
