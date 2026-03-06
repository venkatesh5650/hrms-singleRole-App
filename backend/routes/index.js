const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const employeeController = require('../controllers/employeeController');
const teamController = require('../controllers/teamController');
const approvalController = require('../controllers/approvalController');
const auditLogController = require('../controllers/auditLogController');
const supportRequestController = require('../controllers/supportRequestController');

// Import middleware
const { auth, authorize } = require('../middleware/auth');

// Public routes
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/auth/verify', auth, authController.verifyToken);

// User routes (protected)
router.get('/users', auth, authorize('ADMIN', 'HR'), userController.getUsers);
router.get('/users/:id', auth, userController.getUserById);
router.post('/users', auth, authorize('ADMIN', 'HR'), userController.create);
router.put('/users/:id', auth, authorize('ADMIN', 'HR'), userController.update);
router.delete('/users/:id', auth, authorize('ADMIN'), userController.delete);

// Employee routes (protected)
router.get('/employees', auth, employeeController.listEmployees);
router.get('/employees/:id', auth, employeeController.getEmployeeById);
router.post('/employees', auth, authorize('ADMIN', 'HR'), employeeController.createEmployee);
router.put('/employees/:id', auth, authorize('ADMIN', 'HR', 'MANAGER'), employeeController.updateEmployee);
router.patch('/employees/:id/deactivate', auth, authorize('ADMIN', 'HR'), employeeController.deactivateEmployee);
router.patch('/employees/:id/restore', auth, authorize('ADMIN', 'HR'), employeeController.restoreEmployee);
router.delete('/employees/:id', auth, authorize('ADMIN'), employeeController.deleteEmployee);

// Team routes (protected)
router.get('/teams', auth, teamController.getTeams);
router.get('/teams/:id', auth, teamController.getTeamById);
router.post('/teams', auth, authorize('ADMIN', 'HR', 'MANAGER'), teamController.createTeam);
router.put('/teams/:id', auth, authorize('ADMIN', 'HR', 'MANAGER'), teamController.updateTeam);
router.post('/teams/:teamId/employees/:employeeId', auth, authorize('ADMIN', 'HR', 'MANAGER'), teamController.assignEmployeeToTeam);
router.delete('/teams/:teamId/employees/:employeeId',
  auth,
  authorize('ADMIN', 'HR', 'MANAGER'),
  teamController.removeEmployeeFromTeam
);
router.post('/teams/:teamId/manager/:managerId', auth, authorize('ADMIN', 'HR'), teamController.assignManager);
router.delete('/teams/:id', auth, authorize('ADMIN', 'HR'), teamController.deleteTeam);

// Approval routes (protected)
router.get('/approvals', auth, approvalController.getApprovalHistory);
router.get('/approvals/pending', auth, authorize('ADMIN', 'HR', 'MANAGER'), approvalController.getPendingApprovals);
router.get('/approvals/:id', auth, approvalController.getApprovalById);
router.post('/approvals', auth, approvalController.createApprovalRequest);
router.patch('/approvals/:id/approve', auth, authorize('ADMIN', 'HR', 'MANAGER'), approvalController.approveRequest);
router.patch('/approvals/:id/reject', auth, authorize('ADMIN', 'HR', 'MANAGER'), approvalController.rejectRequest);

// Audit log routes (protected)
router.get('/logs', auth, authorize('ADMIN', 'HR'), auditLogController.fetchLogs);
router.get('/logs/filter', auth, authorize('ADMIN', 'HR'), auditLogController.filterLogs);
router.get('/logs/recent', auth, authorize('ADMIN', 'HR'), auditLogController.getRecentActivity);
router.get('/logs/user/:userId', auth, authorize('ADMIN', 'HR'), auditLogController.getLogsByUserId);

// Support request routes (protected)
router.get('/support-requests', auth, supportRequestController.fetchSupportRequests);
router.get('/support-requests/open', auth, supportRequestController.getOpenSupportRequests);
router.get('/support-requests/:id', auth, supportRequestController.getSupportRequestById);
router.post('/support-requests', auth, supportRequestController.createSupportRequest);
router.patch('/support-requests/:id/resolve', auth, authorize('ADMIN', 'HR'), supportRequestController.resolveSupportRequest);
router.delete('/support-requests/:id', auth, authorize('ADMIN'), supportRequestController.deleteSupportRequest);

module.exports = router;
