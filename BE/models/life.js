const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const lifeSchema = new Schema({
  yob: { type: Number, required: true },
  lifespan: { type: Number, required: true },
  privacy: { type: Number, required: true, defalult: 0 }, //0 public, 1 private (2 only followers?);
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
});

module.exports = mongoose.model('Life', lifeSchema);
