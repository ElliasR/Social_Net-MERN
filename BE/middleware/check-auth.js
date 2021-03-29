const config = require('./CONFIG');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  //checks token's validity. Could be in the URL or in the headers: cleaner as is metadata attached to the request.
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1]; //express.js feature. allowed in app.js in res.setHeader. Authorization: 'Bearer TOKEN' is the convention, hence, splitted in the space and using the second element, with a [1] index value.
    if (!token) {
      throw new Error('Authentication failed!');
    }
    const decodedToken = jwt.verify(token, config.secret);
    req.userData = { userId: decodedToken.userId }; //as it was transferred with the token and also the email.
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed!!', 403);
    return next(error);
  }
};
