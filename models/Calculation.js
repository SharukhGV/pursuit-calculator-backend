const Calculation = sequelize.define(
  "Calculation",
  {
    number1: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    number2: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    operation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    result: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "calculations", // explicitly define table name
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Calculation;
