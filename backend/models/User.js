const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    organisation_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'),
      allowNull: false,
      defaultValue: 'EMPLOYEE'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true
  });
    User.associate = (models) => {
  User.hasOne(models.Employee, {
    foreignKey: "user_id",
    as: "employee"
  });

  User.hasMany(models.AuditLog, {
    foreignKey: "user_id",
    as: "auditLogs"
  });

  User.hasMany(models.Approval, {
    foreignKey: "user_id",
    as: "approvals"
  });
};

  return User;
};
