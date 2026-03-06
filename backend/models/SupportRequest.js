const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SupportRequest = sequelize.define('SupportRequest', {
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
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    status: {
      type: DataTypes.ENUM('OPEN', 'RESOLVED'),
      defaultValue: 'OPEN'
    }
  }, {
    tableName: 'support_requests',
    timestamps: true,
    underscored: true
  });

  return SupportRequest;
};
