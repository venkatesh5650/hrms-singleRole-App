const { Op } = require('sequelize');
const { User, Employee, Team, Approval, AuditLog, SupportRequest, EmployeeTeam } = require('../models');

class EmployeeService {
  async listEmployees(organisationId, options = {}) {
    try {
      const { page = 1, limit = 10, search, is_active, team_id } = options;
      const offset = (page - 1) * limit;

      const where = { organisation_id: organisationId };

      if (search) {
        where[Op.or] = [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      if (is_active !== undefined) {
        where.is_active = is_active;
      }

      if (team_id) {
        where.team_id = team_id;
      }

      // Get total count separately to avoid duplicate rows from joins
      const total = await Employee.count({ where });

      // Get rows with include for data, but count separately
      const rows = await Employee.findAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
          { model: Team, as: 'teams', attributes: ['id', 'name'] }
        ],
        order: [['created_at', 'DESC']]
      });

      // Get all team managers to determine if employee is a manager
      const teams = await Team.findAll({
        attributes: ['manager_id'],
        where: { manager_id: { [Op.ne]: null } }
      });
      const managerIds = new Set(teams.map(t => t.manager_id));

      // Map employees with computed role
      const employees = rows.map(emp => {
        const empData = emp.toJSON();
        // If employee is a manager of any team, set role to Manager
        if (managerIds.has(empData.id)) {
          empData.role = 'Manager';
        } else if (!empData.role) {
          empData.role = 'Employee';
        }
        return empData;
      });

      return {
        employees: employees,
        total: total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createEmployee(employeeData) {
    try {
      const existingEmployee = await Employee.findOne({
        where: { email: employeeData.email }
      });

      if (existingEmployee) {
        throw new Error('Employee with this email already exists');
      }

      // Set default role if not provided
      if (!employeeData.role) {
        employeeData.role = 'Employee';
      }

      const employee = await Employee.create(employeeData);

      return await Employee.findByPk(employee.id, {
        include: [
          { model: User, as: 'user' },
          { model: Team, as: 'teams' }
        ]
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getEmployeeById(id) {
    try {
      const employee = await Employee.findByPk(id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
          { model: Team, as: 'teams', attributes: ['id', 'name'] }
        ]
      });

      if (!employee) {
        throw new Error('Employee not found');
      }

      return employee;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateEmployee(id, employeeData) {
    try {
      const employee = await Employee.findByPk(id);

      if (!employee) {
        throw new Error('Employee not found');
      }

      await employee.update(employeeData);

      return await Employee.findByPk(id, {
        include: [
          { model: User, as: 'user' },
          { model: Team, as: 'teams' }
        ]
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deactivateEmployee(id) {
    try {
      const employee = await Employee.findByPk(id);

      if (!employee) {
        throw new Error('Employee not found');
      }

      await employee.update({ is_active: false });

      return { message: 'Employee deactivated successfully', employee };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async restoreEmployee(id) {
    try {
      const employee = await Employee.findByPk(id);

      if (!employee) {
        throw new Error('Employee not found');
      }

      await employee.update({ is_active: true });

      return { message: 'Employee restored successfully', employee };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteEmployee(id) {
    try {
      const employee = await Employee.findByPk(id);

      if (!employee) {
        throw new Error('Employee not found');
      }

      await employee.destroy();

      return { message: 'Employee deleted successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new EmployeeService();
