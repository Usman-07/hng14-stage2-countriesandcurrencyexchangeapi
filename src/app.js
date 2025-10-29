const express = require('express');
require('dotenv').config();
const countriesRouter = require('./routes/countries');
const { json } = require('express');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(json());

app.use('/countries', countriesRouter);
app.get('/status', require('./controllers/countriesController').getStatus);

// Health check
app.get('/', (req, res) => res.json({ message: 'Country Currency & Exchange API' }));

// Error handler
app.use(errorHandler);

module.exports = app;
