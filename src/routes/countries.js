const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/countriesController');

// POST refresh
router.post('/refresh', ctrl.refreshCountries);

// GET all (filters + sort)
router.get('/', ctrl.getCountries);

// GET image
router.get('/image', ctrl.getSummaryImage);

// GET one by name
router.get('/:name', ctrl.getCountryByName);

// DELETE by name
router.delete('/:name', ctrl.deleteCountryByName);

module.exports = router;
