const express = require('express');
const { check } = require('express-validator');

const placesControllers = require('../controllers/places-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacesByUserId);

router.use(checkAuth); //Checks for the token. If incorrect, never reaches the routes below.

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title').not().isEmpty().trim().escape(),
    check('description').isLength({ min: 5 }).trim().escape(),
    check('address').not().isEmpty().trim().escape(),
  ],
  placesControllers.createPlace
);

router.patch(
  '/:pid',
  [
    check('title').not().isEmpty().trim().escape(),
    check('description').isLength({ min: 5 }).trim().escape(),
  ],
  placesControllers.updatePlace
);

router.delete('/:pid', placesControllers.deletePlace);

module.exports = router; //the router constant is exported as app.js is the executed file.
