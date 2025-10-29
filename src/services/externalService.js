const axios = require('axios');

const COUNTRIES_API = 'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';
const EXCHANGE_API = 'https://open.er-api.com/v6/latest/USD';

async function fetchCountries() {
  const res = await axios.get(COUNTRIES_API, { timeout: 15000 });
  return res.data; // array
}

async function fetchExchangeRates() {
  const res = await axios.get(EXCHANGE_API, { timeout: 15000 });
  // The API returns an object with "rates" keyed by currency code
  return res.data; // include code for status check at caller
}

module.exports = { fetchCountries, fetchExchangeRates };