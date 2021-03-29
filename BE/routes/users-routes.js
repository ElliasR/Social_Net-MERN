const express = require('express');
const { check } = require('express-validator');

const usersControllers = require('../controllers/users-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/', usersControllers.getUsers);

router.post(
  '/signup',
  fileUpload.single('image'), //image comes from Auth (fronEnd)
  [
    check('name').not().isEmpty().trim().escape(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }).trim().escape(),
  ],
  usersControllers.signup
);

router.post(
  '/login',
  [
    check('email') //Maybe not needed here, as it checks against the database first, so if it doesn't exists... (injection still a possibility)
      .normalizeEmail()
      .isEmail(),
    check('password').isLength({ min: 6 }).trim().escape(),
  ],
  usersControllers.login
);

router.get('/:userId', usersControllers.getUserById);

router.get('/confirm/:confirmationCode', usersControllers.activateUser);

router.post(
  '/resendemail',
  [check('email').normalizeEmail().isEmail()],
  usersControllers.resendemail
);
router.post(
  '/resetpssw',
  [check('email').normalizeEmail().isEmail()],
  usersControllers.resetPssw
);

router.patch(
  ////Created a temporary password, sent to the email, this implementation might happen later.
  '/resetpassw/:resetPsswCode',
  [
    check('newPassword').isLength({ min: 6 }).trim().escape(),
    check('repeatPassword').isLength({ min: 6 }).trim().escape(),
    check('resetPsswCode').isLength({ min: 6 }).trim().escape(),
  ],
  usersControllers.updateForgottenPassword
);

router.use(checkAuth); //Checks for the token. If incorrect, never reaches the routes below.
///////////////////////////////////////////
router.patch(
  '/:userId',
  [
    check('name').not().isEmpty().trim().escape(),
    check('email').normalizeEmail().isEmail(),
  ],
  usersControllers.updateUser
);

router.patch(
  '/passw/:userId',
  [
    check('oldPassword').isLength({ min: 6 }).trim().escape(),
    check('newPassword').isLength({ min: 6 }).trim().escape(),
    check('repeatPassword').isLength({ min: 6 }).trim().escape(),
  ],
  usersControllers.updatePassword
);

router.post(
  '/image/:userId',
  fileUpload.single('image'),
  usersControllers.updateImage
);

router.patch(
  '/activ/:userId',
  [check('account').isLength({ min: 2 }).trim().escape()],
  usersControllers.activeProfile
);

///////////////////////////////////////////

module.exports = router; //the router constant is exported as app.js is the executed file.
