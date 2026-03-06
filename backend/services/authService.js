const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Employee } = require('../models');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../utils/constants');

class AuthService {
  async login(email, password) {
    try {
      const user = await User.findOne({ 
        where: { email },
        include: [{ model: Employee, as: 'employee' }]
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          organisation_id: user.organisation_id
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organisation_id: user.organisation_id,
          employee: user.employee ? {
            id: user.employee.id,
            first_name: user.employee.first_name,
            last_name: user.employee.last_name
          } : null
        }
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async register(userData) {
    try {
      const existingUser = await User.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('Email already registered');
      }

      const password_hash = await bcrypt.hash(userData.password, 10);

      const user = await User.create({
        ...userData,
        password_hash
      });

      const { password_hash: _, ...userWithoutPassword } = user.toJSON();
      return userWithoutPassword;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        throw new Error('User not found');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

module.exports = new AuthService();
