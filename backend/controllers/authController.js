const authService = require('../services/authService');
const { HTTP_STATUS } = require('../utils/constants');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const result = await authService.login(email, password);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: error.message
      });
    }
  }

  async register(req, res) {
    try {
      const { name, email, password, role, organisation_id } = req.body;

      if (!name || !email || !password) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Name, email and password are required'
        });
      }

      const user = await authService.register({
        name,
        email,
        password,
        role,
        organisation_id
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }

  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'No token provided'
        });
      }

      const decoded = await authService.verifyToken(token);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: decoded
      });
    } catch (error) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();
