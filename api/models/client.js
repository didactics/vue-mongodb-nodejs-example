const mongoose = require('mongoose');

const ProviderRefSchema = new mongoose.Schema({
  id: Number,
});

const ClientSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  providers: [ProviderRefSchema],
});

const Client = mongoose.model('Client', ClientSchema);

module.exports = Client;
