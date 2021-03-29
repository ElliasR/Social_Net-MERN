// const { v4: uuidv4 } = require('uuid'); id generator no longer used.
const fs = require('fs');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');
const config = require('../middleware/CONFIG');
const e = require('express');
const nodemailer = require('../middleware/nodemailer');
const nodemailerResetPssw = require('../middleware/nodemailerResetPssw');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({ active: 1 });
  } catch (err) {
    const error = new HttpError(
      'Fetching users failed, please try again later. ',
      500
    );
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

//-----------SIGNUP-------------------
const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs, please check your data. ', 422));
  }
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError('Signing up failed, please try again.', 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError('User already exists.', 422);
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      'Could not create the user, please try again.',
      500
    );
    return next(error);
  }

  let token = jwt.sign({ email: email }, config.secret);

  const createdUser = new User({
    name: name,
    email: email,
    password: hashedPassword,
    image: req.file.path,
    places: [],
    confirmationCode: token,
  });

  try {
    await createdUser.save(); //returns a promise.
  } catch (err) {
    const error = new HttpError('Signing Up failed, please try again. ', 500);
    return next(error);
  }

  res
    .status(200)
    .json({ message: 'Account created. Check your email for activation!' });

  nodemailer.sendConfirmationEmail(
    createdUser.name,
    createdUser.email,
    createdUser.confirmationCode
  );
};

//----------LOGIN------------
const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs, please check your data. ', 422));
  }

  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError('Login in failed, please try again.', 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, wrong email or password',
      401
    );
    return next(error);
  }

  if (existingUser.active == '0') {
    const error = new HttpError(
      'Your account needs activation. Go to the email we have sent to you and follow the instruction! (Wait for a few minutes and check the spam folder if it does no appear). <a href="wee">RESEND EMAIL</a>'
    );
    return next(error);
  } else if (existingUser.active == '2') {
    const error = new HttpError(
      'Your account is paused. For reactivation, Click the RESEND EMAIL Link below and follow the instructions. '
    );
    return next(error);
  } else if (existingUser.active == '3') {
    const error = new HttpError(
      'Invalid credentials, wrong email or password. Create a new account if you cancelled yours.',
      401
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      'Invalid credentials, please check the password or email',
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      config.secret,
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError('Login in failed, please try again.', 500);
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

//-------------User profile - get userById -----------------------
const getUserById = async (req, res, next) => {
  const userId = req.params.userId;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError('User not found, please try again. ', 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError('No User found with the provided id.', 404);
    return next(error);
  }

  res.json({ user: user.toObject({ getters: true }) }); //sending the response in json format.
};

//------------------ USER_UPDATE --------------------------
const updateUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs, please check your data. ', 422));
  }

  const { name, email, password } = req.body;
  const userId = req.params.userId;

  let user;

  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError('Place could not be updated, try again. ', 500);
    return next(error);
  }

  //Password check --> Genuine user allowed only
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch (err) {
    const error = new HttpError(
      'Invalid credentials, please check the password or email',
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError('Invalid credentials.', 403);
    return next(error);
  }

  //Backend check: user modifying = creator.
  if (user.id.toString() !== userId) {
    //check req data, if it is correct
    const error = new HttpError(
      'You are not allowed to change this place.',
      401
    );
    return next(error);
  }

  // Email is unique, hence can't be duplicated: no need to check.
  // If account is deleted, need to remove old email to create a new user.

  user.name = name;
  if (user.email !== email) {
    user.email = email;
    user.active = 0; //New email needs to be activated.
  }

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      'User profile could not be updated, try again. ',
      500
    );
    return next(error);
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

//--------------PASSWORD_UPDATE--------------------
const updatePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs, please check your data. ', 422));
  }

  const { oldPassword, newPassword, repeatPassword } = req.body;
  const userId = req.params.userId;

  let dbuser;
  try {
    dbuser = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Password could not be updated, try again. ',
      500
    );
    return next(error);
  }

  if (dbuser.id.toString() !== userId) {
    //IS THIS NEEDED??? dbUser defined using userId already... only token stops hack.
    //check req data, if it is correct
    const error = new HttpError('Incorrect user.', 401);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(oldPassword, dbuser.password);
  } catch (err) {
    const error = new HttpError(
      'Invalid credentials, please check the inputs',
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError('Invalid credentials, could not update.', 403);
    return next(error);
  }

  if (newPassword !== repeatPassword) {
    const error = new HttpError('New Passwords do not match, try again.', 401);
    return next(error);
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(newPassword, 12);
  } catch (err) {
    const error = new HttpError(
      'Could not create the user, please try again.',
      500
    );
    return next(error);
  }

  dbuser.password = hashedPassword;

  try {
    await dbuser.save();
  } catch (err) {
    const error = new HttpError(
      'User profile could not be updated, try again. ',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'Password updated' });
};

//--------------PROFILE IMAGE UPDATE---------------
const updateImage = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs, please check your data. ', 422));
  }
  //const image = req.body.image;
  const userId = req.params.userId;

  let dbuser;
  try {
    dbuser = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Image update failed, please try again later.',
      500
    );
    return next(error);
  }

  if (!dbuser) {
    const error = new HttpError('User does not exist.', 422);
    return next(error);
  }

  const imagePath = dbuser.image; //old image path
  const newImage = req.file.path;

  dbuser.image = newImage;

  try {
    await dbuser.save();
  } catch (err) {
    const error = new HttpError(
      'User profile could not be updated, try again. ',
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: 'Image updated' });
};

//----------------- PAUSE / DELETE ACCOUNT ---------------

const activeProfile = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs, please check your data. ', 422));
  }

  const { account } = req.body;
  const userId = req.params.userId;

  let dbuser;

  try {
    dbuser = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Account could not be updated, try again. ',
      500
    );
    return next(error);
  }
  //Backend check: user modifying = creator.
  if (dbuser.id.toString() !== userId) {
    //check req data, if it is correct //IS THIS NEEDED??? dbUser defined using userId already... only token stops hack.
    const error = new HttpError(
      'You are not allowed to update this account.',
      401
    );
    return next(error);
  }

  if (account === 'PAUSE') {
    accountValue = 2;
  } else if (account === 'DELETE') {
    accountValue = 3;
  } else {
    accountValue = dbuser.active.toString(); //---> eRROR OR NEXT, DO NOT CONTINUE.
  }

  dbuser.active = accountValue;

  try {
    await dbuser.save();
  } catch (err) {
    const error = new HttpError(
      'User profile could not be updated, try again later. ',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'Account updated' });
};

//-------------- ACTIVATE USER ---------------
const activateUser = async (req, res, next) => {
  const confirmationCode = req.params.confirmationCode; //NOT FILTERED NOR SANITIZED, CHECK IT PROPERLY!!!

  let user;
  try {
    user = await User.findOne({ confirmationCode: confirmationCode });
  } catch (err) {
    const error = new HttpError('User not found, please try again. ', 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      'The code has expired or was already used.',
      404
    );
    return next(error);
  }
  if (user.active === 3) {
    //if cancelled, can't be reactivated.
    const error = new HttpError(
      'The code has expired or was already used.',
      404
    );
    return next(error);
  }

  user.active = 1;
  user.confirmationCode = '';

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      'User profile could not be updated, try again later. ',
      500
    );
    return next(error);
  }
  res.status(200).json({ message: 'Account updated (A)' });
};

//-------------- EMAIL RESEND for Activate user --------------
const resendemail = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        'Check your email (inbox and spam folder) and follow the instruction to reset your password',
        422
      )
    );
  }

  const { email } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'The email does not seem to be correct, no user found.',
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError('Invalid credentials, wrong email', 401);
    return next(error);
  }

  let token = jwt.sign({ email: email }, config.secret); ///Add something else for the token, so different to the confirm account one. Add to gitignore

  if (existingUser) {
    //include errors here and also within activate account.
    nodemailer.sendConfirmationEmail(
      existingUser.name,
      existingUser.email,
      token
    );
  }

  existingUser.confirmationCode = token;

  try {
    await existingUser.save();
  } catch (err) {
    const error = new HttpError(
      'User profile could not be updated, try again later. ',
      500
    );
    return next(error);
  }

  const error = new HttpError(
    'Check your email (inbox and spam folder) and follow the instruction to reset your password.',
    500 //fake, so error code, but matches the one if no user found with that email, so the boot does not get data on existing emails.
  );
  // res.status(200).json({ message: 'Account updated (A)' });
  return next(error);
};

//-------------- EMAIL for FORGOTTEN PASSWORD --------------
const resetPssw = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        'Check your email (inbox and spam folder) and follow the instruction to reset your password',
        422
      )
    );
  }

  const { email } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'The email does not seem to be correct, no user found.',
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError('Invalid credentials, wrong email', 401);
    return next(error);
  }

  let token = jwt.sign({ email: email }, config.secret); ///Add something else for the token, so different to the confirm account one. Add to gitignore

  if (existingUser) {
    //include errors here and also within activate account.
    nodemailerResetPssw.sendResetPsswEmail(
      existingUser.name,
      existingUser.email,
      token
    );
  }

  existingUser.resetPsswCode = token;

  try {
    await existingUser.save();
  } catch (err) {
    const error = new HttpError(
      'User profile could not be updated, try again later. ',
      500
    );
    return next(error);
  }

  const error = new HttpError(
    'Check your email (inbox and spam folder) and follow the instruction to reset your password.',
    500 //fake, so error code, but matches the one if no user found with that email, so the boot does not get data on existing emails.
  );
  // res.status(200).json({ message: 'Account updated (A)' });
  return next(error);
};

//-------------- UPDATE FORGOTTEN PASSWORD --------------------
const updateForgottenPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs, please check your data. ', 422));
  }

  const { newPassword, repeatPassword } = req.body;
  const resetPsswCode = req.params.resetPsswCode;
  if (resetPsswCode.length < 20) {
    const error = new HttpError(
      'Password could not be updated, try again. ',
      500
    );
    return next(error);
  }

  let dbuser;
  try {
    dbuser = await User.findOne({ resetPsswCode: resetPsswCode });
  } catch (err) {
    const error = new HttpError(
      'Password could not be updated, try again. ',
      500
    );
    return next(error);
  }

  if (newPassword !== repeatPassword) {
    const error = new HttpError('New Passwords do not match, try again.', 401);
    return next(error);
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(newPassword, 12);
  } catch (err) {
    const error = new HttpError(
      'Could not create the user, please try again.',
      500
    );
    return next(error);
  }

  dbuser.password = hashedPassword;
  dbuser.resetPsswCode = '';

  try {
    await dbuser.save();
  } catch (err) {
    const error = new HttpError(
      'User profile could not be updated, try again. ',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'Password updated' });
};

//--------------------------------------
exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
exports.updatePassword = updatePassword;
exports.updateImage = updateImage;
exports.activeProfile = activeProfile;
exports.activateUser = activateUser;
exports.resendemail = resendemail;
exports.resetPssw = resetPssw;
exports.updateForgottenPassword = updateForgottenPassword;
