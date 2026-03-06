const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Approval = sequelize.define('Approval', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    organisation_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN_ACCESS'),
      allowNull: false
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING'
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'approvals',
    timestamps: true,
    underscored: true
  });

   Approval.associate = (models) => {
  Approval.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user"
  });
};

  return Approval;
};
