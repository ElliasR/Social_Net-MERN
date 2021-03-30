const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Life = require('../models/life');

const getLifeById = (req, res, next) => {
  const uid = req.params.uid;

  const dblife = Life.findOne({
    creator: uid,
    privacy: 0,
  }).exec();

  if (dblife.length === 1) {
    console.log('it works');
  } else {
    console.log(dblife.length);
  }
};

exports.getLifeById = getLifeById;
