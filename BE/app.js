const fs = require('fs'); //file system, included to delete files.
const path = require('path'); //node.js module.

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const config = require('./middleware/CONFIGDB');
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const lifeRoutes = require('./routes/life-routes');
const gamesRoutes = require('./routes/games-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json()); //To extract the body data (before reaching the placesRoutes)

app.use('/uploads/images', express.static(path.join('uploads', 'images'))); //express static returns just a file, it doesn't execute anything.

app.use((req, res, next) => {
  //to handle CORS errors due to the use of 2 "servers" backend 3000 and frontend 5000
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});

app.use('/api/places', placesRoutes); // => /api/places... is a path filter
app.use('/api/users', usersRoutes);
app.use('/api/life', lifeRoutes);
app.use('/api/games', gamesRoutes);

app.use((req, res, next) => {
  //middleware only reached if it didn't get a response before.
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  //4 parameter so an error handling middleware function. Only executes on the requests with an error.
  if (req.file) {
    //file property comes from multer
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

mongoose
  .connect(
    config.mongoDB, //"places" instead of "mern" before
    //'mongodb://localhost:27017/mern',
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
  )
  .then(() => {
    app.listen(5000, function () {
      console.log('server started on port 5000');
    });
  })
  .catch((err) => {
    console.log(err);
  });
