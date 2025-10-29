const Country = require('../models/country');
const { fetchCountries, fetchExchangeRates } = require('../services/externalService');
const sequelize = require('../config/db');
const { generateSummaryImage } = require('../services/imageService');

// Utility: get first currency code if exists
function extractCurrencyCode(countryObj) {
  if (!countryObj.currencies || !Array.isArray(countryObj.currencies) || countryObj.currencies.length === 0) return null;
  
  return countryObj.currencies[0] && countryObj.currencies[0].code ? countryObj.currencies[0].code : null;
}

function randomMultiplier() {
  return Math.random() * (2000 - 1000) + 1000;
}
const { Op } = require('sequelize');

// POST /countries/refresh
async function refreshCountries(req, res, next) {
  let countriesData, exchangeData;

  try {
    countriesData = await fetchCountries();
  } catch (err) {
    console.error("Failed to fetch countries:", err);
    return res.status(503).json({ 
      error: 'External data source unavailable', 
      details: 'Could not fetch data from Countries API' 
    });
  }

  try {
    exchangeData = await fetchExchangeRates();
  } catch (err) {
    console.error("Failed to fetch exchange rates:", err);
    return res.status(503).json({ 
      error: 'External data source unavailable', 
      details: 'Could not fetch data from Exchange Rates API' 
    });
  }

  if (!exchangeData || exchangeData.result === 'error' || !exchangeData.rates) {
    console.error("Exchange data invalid:", exchangeData);
    return res.status(503).json({ 
      error: 'External data source unavailable', 
      details: 'Invalid response from Exchange Rates API' 
    });
  }

  const rates = exchangeData.rates;
  const t = await sequelize.transaction();
  const lastRefreshedAt = new Date();

  try {
    for (const c of countriesData) {
      const name = c.name;
      const capital = c.capital || null;
      const region = c.region || null;
      const population = c.population ?? 0;
      const currency_code = extractCurrencyCode(c);

      let exchange_rate = null;
      let estimated_gdp = 0;

      if (currency_code && typeof rates[currency_code] === 'number') {
        exchange_rate = rates[currency_code];
        estimated_gdp = (population * randomMultiplier()) / exchange_rate;
      }

      const payload = {
        name,
        capital,
        region,
        population,
        currency_code,
        exchange_rate,
        estimated_gdp,
        flag_url: c.flag || null,
        last_refreshed_at: lastRefreshedAt
      };

      // Upsert logic (case insensitive)
      const existing = await Country.findOne({
        where: sequelize.where(
          sequelize.fn('lower', sequelize.col('name')),
          name.toLowerCase()
        ),
        transaction: t
      });

      if (existing) {
        await existing.update(payload, { transaction: t });
      } else {
        await Country.create(payload, { transaction: t });
      }
    }

    await t.commit();

    const total = await Country.count();
  

    const top5 = await Country.findAll({
  where: { estimated_gdp: { [Op.ne]: null } },
  order: [['estimated_gdp', 'DESC']],
  limit: 5
});


    try {
      await generateSummaryImage({
        total,
        top5: top5.map(r => r.get({ plain: true })),
        timestamp: lastRefreshedAt
      });
    } catch (imgErr) {
      console.error("Image generation failed:", imgErr);
    }

    return res.status(200).json({
      message: 'Refresh successful',
      total_countries: total,
      last_refreshed_at: lastRefreshedAt.toISOString()
    });

  } catch (err) {
    console.error("Transaction failed:", err);
    if (!t.finished) {
      try {
        await t.rollback();
      } catch (rollbackErr) {
        console.error("Rollback failed:", rollbackErr);
      }
    }
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}


// GET /countries [filters + sorting]
async function getCountries(req, res, next) {
  try {
    const { region, currency, sort } = req.query;
    const where = {};
    if (region) where.region = region;
    if (currency) where.currency_code = currency;

    const order = [];
    if (sort === 'gdp_desc') order.push(['estimated_gdp', 'DESC']);
    else if (sort === 'gdp_asc') order.push(['estimated_gdp', 'ASC']);
    else if (sort === 'name_asc') order.push(['name', 'ASC']);
    else if (sort === 'name_desc') order.push(['name', 'DESC']);

    const countries = await Country.findAll({ where, order });
    return res.json(countries);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /countries/:name
async function getCountryByName(req, res) {
  try {
    const name = req.params.name;
    const country = await Country.findOne({
      where: sequelize.where(sequelize.fn('lower', sequelize.col('name')), name.toLowerCase())
    });
    if (!country) return res.status(404).json({ error: 'Country not found' });
    return res.json(country);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /countries/:name
async function deleteCountryByName(req, res) {
  try {
    const name = req.params.name;
    const rows = await Country.destroy({
      where: sequelize.where(sequelize.fn('lower', sequelize.col('name')), name.toLowerCase())
    });
    if (rows === 0) return res.status(404).json({ error: 'Country not found' });
    return res.json({ message: 'Country deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /status
async function getStatus(req, res) {
  try {
    const total_countries = await Country.count();
    // get last_refreshed_at global: max(last_refreshed_at)
    const result = await Country.findOne({ order: [['last_refreshed_at', 'DESC']] });
    const last_refreshed_at = result ? result.last_refreshed_at.toISOString() : null;
    return res.json({ total_countries, last_refreshed_at });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /countries/image
const path = require('path');
const fs = require('fs');
async function getSummaryImage(req, res) {
  const imgPath = path.resolve(process.cwd(), 'cache', 'summary.png');
  if (!fs.existsSync(imgPath)) {
    return res.status(404).json({ error: 'Summary image not found' });
  }
  return res.sendFile(imgPath);
}

module.exports = {
  refreshCountries,
  getCountries,
  getCountryByName,
  deleteCountryByName,
  getStatus,
  getSummaryImage
};
