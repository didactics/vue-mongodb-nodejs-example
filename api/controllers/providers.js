const Provider = require('../models/provider.js');

// Get a list of all providers
exports.getAllProviders = (req, res) => {
  Provider.find()
    .then((providers) => {
      res.send(providers);
    }).catch((err) => {
      console.log(err);
      res.status(500).send({
        message: err.message || 'Server error occurred while retrieving providers.',
      });
    });
};

// Create a new provider
exports.createProvider = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: 'Provider content cannot be empty',
    });
    return;
  }

  // Create a provider
  const provider = new Provider({
    id: req.body.id,
    name: req.body.name || 'New provider',
  });

  // Save provider to the database
  provider.save()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: err.message || 'Server error occurred while storing the provider',
      });
    });
};

// Get a provider identified by its ID field
exports.getProvider = (req, res) => {
  Provider.findOne({ id: `${req.params.providerId}` })
    .then((provider) => {
      if (!provider) {
        return res.status(404).send({
          message: `Provider not found with id ${req.params.providerId}`,
        });
      }

      return res.send(provider);
    })
    .catch((err) => {
      console.log(err);
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: `Provider not found with id ${req.params.providerId}. Mind the ID field, not _id by MongoDB.`,
        });
      }

      return res.status(500).send({
        message: `Error retrieving provider with id ${req.params.providerId}. Mind the ID field, not _id by MongoDB.`,
      });
    });
};

// Update a provider identified by its ID field
exports.updateProvider = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: 'Provider content cannot be empty',
    });
    return;
  }

  // Update provider in the database
  Provider.findOneAndUpdate(
    { id: req.params.providerId },
    {
      id: req.params.providerId,
      name: req.body.name || 'New provider',
    },
    { new: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: `Provider not found with id ${req.params.providerId}`,
        });
      }
      return res.send(data);
    })
    .catch((err) => {
      console.log(err);
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: `Provider not found with id ${req.params.providerId}`,
        });
      }
      return res.status(500).send({
        message: err.message || 'Server error occurred while storing the provider',
      });
    });
};

// Delete a provider identified by its ID field
exports.deleteProvider = (req, res) => {
  Provider.findOneAndRemove({ id: req.params.providerId })
    .then((provider) => {
      if (!provider) {
        return res.status(404).send({
          message: `Provider not found with id ${req.params.providerId}`,
        });
      }
      return res.send({ message: `Provider ${provider.name} deleted successfully!` });
    })
    .catch((err) => {
      console.log(err);
      if (err.kind === 'ObjectId' || err.name === 'NotFound') {
        return res.status(404).send({
          message: `Provider not found with id ${req.params.providerId}`,
        });
      }
      return res.status(500).send({
        message: `Server error occurred while deleting the provider ${req.params.providerId}`,
      });
    });
};
