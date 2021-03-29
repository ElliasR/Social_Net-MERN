const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, //indexes the data and is faster.
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Place' }],
  active: { type: Number, required: true, default: 0 }, //0: inactive(needs activation), 1 active, 2 account paused, 3 account cancelled.
  confirmationCode: { type: String, unique: true },
  resetPsswCode: { type: String, default: '' },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
