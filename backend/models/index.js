const sequelize = require('../config/database');

const db = {
  sequelize,
  Sequelize: require('sequelize'),
  User: require('./User')(sequelize),
  Employee: require('./Employee')(sequelize),
  Team: require('./Team')(sequelize),
  EmployeeTeam: require('./EmployeeTeam')(sequelize),
  Approval: require('./Approval')(sequelize),
  AuditLog: require('./AuditLog')(sequelize),
  SupportRequest: require('./SupportRequest')(sequelize)
};

// User - Employee associations
db.User.hasOne(db.Employee, { foreignKey: 'user_id', as: 'employee' });
db.Employee.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

// User - Approval associations
db.User.hasMany(db.Approval, { foreignKey: 'user_id', as: 'approvals' });
db.Approval.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

// Employee - SupportRequest associations
db.Employee.hasMany(db.SupportRequest, { foreignKey: 'employee_id', as: 'supportRequests' });
db.SupportRequest.belongsTo(db.Employee, { foreignKey: 'employee_id', as: 'employee' });

// Employee - Team many-to-many via EmployeeTeam
db.Employee.belongsToMany(db.Team, { 
  through: db.EmployeeTeam, 
  foreignKey: 'employee_id', 
  as: 'teams' 
});
db.Team.belongsToMany(db.Employee, { 
  through: db.EmployeeTeam, 
  foreignKey: 'team_id', 
  as: 'members' 
});

module.exports = db;
