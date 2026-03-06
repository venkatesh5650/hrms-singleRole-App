const { Team, Employee, User } = require('../models');
const { Op } = require('sequelize');

class TeamService {
  async createTeam(teamData) {
    try {
      const team = await Team.create(teamData);

      return await Team.findByPk(team.id, {
        include: [{ model: Employee, as: 'employees' }]
      });
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

      return await Team.findByPk(id, {
        include: [
          { model: Employee, as: 'employees', include: [{ model: User, as: 'user' }] }
        ]
      });
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

      const { count, rows } = await Team.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          { 
            model: Employee, 
            as: 'employees',
            where: { is_active: true },
            required: false
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return {
        teams: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getTeamById(id) {
    try {
      const team = await Team.findByPk(id, {
        include: [
          { model: Employee, as: 'employees', include: [{ model: User, as: 'user' }] }
        ]
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
      const team = await Team.findByPk(teamId);
      if (!team) {
        throw new Error('Team not found');
      }

      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      await employee.update({ team_id: teamId });

      return await Employee.findByPk(employeeId, {
        include: [
          { model: User, as: 'user' },
          { model: Team, as: 'team' }
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

      return await Team.findByPk(teamId, {
        include: [{ model: Employee, as: 'employees' }]
      });
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

      await Employee.update(
        { team_id: null },
        { where: { team_id: id } }
      );

      await team.destroy();

      return { message: 'Team deleted successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new TeamService();
