const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EmployeeTeam = sequelize.define('EmployeeTeam', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    team_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'employee_teams',
    timestamps: true,
    underscored: true
  });

  return EmployeeTeam;
};
