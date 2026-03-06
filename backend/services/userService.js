const bcrypt = require('bcryptjs');
const { User, Employee } = require('../models');
const { Op } = require('sequelize');

class UserService {
  async create(userData) {
    try {
      const existingUser = await User.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('Email already exists');
      }

      if (userData.password) {
        userData.password_hash = await bcrypt.hash(userData.password, 10);
        delete userData.password;
      }

      const user = await User.create(userData);
      
      const { password_hash, ...userWithoutPassword } = user.toJSON();
      return userWithoutPassword;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async update(id, userData) {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        throw new Error('User not found');
      }

      if (userData.password) {
        userData.password_hash = await bcrypt.hash(userData.password, 10);
        delete userData.password;
      }

      await user.update(userData);

      const { password_hash, ...userWithoutPassword } = user.toJSON();
      return userWithoutPassword;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getUsers(organisationId, options = {}) {
    try {
      const { page = 1, limit = 10, search, role } = options;
      const offset = (page - 1) * limit;

      const where = { organisation_id: organisationId };

      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      if (role) {
        where.role = role;
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [{ model: Employee, as: 'employee' }],
        order: [['created_at', 'DESC']]
      });

      const users = rows.map(user => {
        const { password_hash, ...userWithoutPassword } = user.toJSON();
        return userWithoutPassword;
      });

      return {
        users,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getUserById(id) {
    try {
      const user = await User.findByPk(id, {
        include: [{ model: Employee, as: 'employee' }]
      });

      if (!user) {
        throw new Error('User not found');
      }

      const { password_hash, ...userWithoutPassword } = user.toJSON();
      return userWithoutPassword;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async delete(id) {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        throw new Error('User not found');
      }

      await user.destroy();
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new UserService();
