const express = require('express');
const { check } = require('express-validator');

const lifeControllers = require('../controllers/life-controllers');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/:uid', lifeControllers.getLifeById);

router.use(checkAuth);

module.exports = router; //the router constant is exported as app.js is the executed file.
