const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const EmployeeTeam = sequelize.define('EmployeeTeam', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id'
      }
    },
    team_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id'
      }
    }
  }, {
    tableName: 'employee_teams',
    timestamps: true,
    underscored: true
  });

  return EmployeeTeam;
};
