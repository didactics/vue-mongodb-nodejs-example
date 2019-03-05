const mongoose = require('mongoose');

const ProviderSchema = new mongoose.Schema({
  id: Number,
  name: String,
});

const Provider = mongoose.model('Provider', ProviderSchema);

module.exports = Provider;
