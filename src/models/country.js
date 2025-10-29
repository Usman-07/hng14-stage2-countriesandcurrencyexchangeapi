const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Country extends Model {}

Country.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  capital: { type: DataTypes.STRING, allowNull: true },
  region: { type: DataTypes.STRING, allowNull: true },
  population: { type: DataTypes.BIGINT, allowNull: false },
  currency_code: { type: DataTypes.STRING, allowNull: true },
  exchange_rate: { type: DataTypes.FLOAT, allowNull: true },
  estimated_gdp: { type: DataTypes.DOUBLE, allowNull: true },
  flag_url: { type: DataTypes.STRING, allowNull: true },
  last_refreshed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  sequelize,
  modelName: 'Country',
  tableName: 'countries',
  timestamps: false,
  indexes: [{ fields: ['name'] }]
});

module.exports = Country;
