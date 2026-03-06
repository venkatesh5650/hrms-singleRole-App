const Sequelize = require("sequelize")
const sequelize = require("../config/database")

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

// Import models
db.User = require("./User")(sequelize, Sequelize)
db.Employee = require("./Employee")(sequelize, Sequelize)
db.Team = require("./Team")(sequelize, Sequelize)
db.Approval = require("./Approval")(sequelize, Sequelize)
db.AuditLog = require("./AuditLog")(sequelize, Sequelize)
db.SupportRequest = require("./SupportRequest")(sequelize, Sequelize)


// Associations (if defined)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

module.exports = db
