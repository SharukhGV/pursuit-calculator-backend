require("dotenv").config(); // Load environment variables

const { Sequelize, DataTypes } = require("sequelize");

// Validate the presence of the connection string
if (!process.env.DATABASE_URL) {
  console.error("Missing DATABASE_URL in environment variables. Check your .env file.");
  process.exit(1);
}

// Connect to PostgreSQL using the connection string
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});


// Test connection
sequelize.authenticate()
  .then(() => console.log("PostgreSQL connected"))
  .catch((err) => console.error("Unable to connect to PostgreSQL:", err));

// Define User model
const User = sequelize.define("User", {
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  isVerified: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  }
});


// Sync models with the database
sequelize.sync()
  .then(() => console.log("Database synced"))
  .catch((err) => console.error("Error syncing database:", err));


  const PendingUsers = sequelize.define("PendingUsers", {
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    verificationCode: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });
  const Calculation = sequelize.define(
    'Calculation',
    {
      number1: {
        type: DataTypes.NUMERIC,
      },
      number2: {
        type: DataTypes.NUMERIC,
      },
      operation: {
        type: DataTypes.STRING(1),
      },
      result: {
        type: DataTypes.NUMERIC,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'calculation', // Specify your table name
      timestamps: true, // Enable createdAt and updatedAt
      createdAt: 'created_at', // Map to `created_at`
      updatedAt: 'updated_at', // Map to `updated_at`
      underscored: true, // Use snake_case column names
    }
  );
  

module.exports = { sequelize, User,PendingUsers,Calculation };
