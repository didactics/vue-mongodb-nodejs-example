const Client = require('../models/client.js');

// Get a list of all clients
exports.getAllClients = (req, res) => {
  Client.find()
    .then((clients) => {
      res.send(clients);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: err.message || 'Server error occurred while retrieving clients.',
      });
    });
};

// Create a new client
exports.createClient = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: 'Client content cannot be empty',
    });
    return;
  }

  // Create a client
  const client = new Client({
    name: req.body.name || 'New client',
    email: req.body.email,
    phone: req.body.phone,
    providers: req.body.providers,
  });

  // Save client to the database
  client.save()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: err.message || 'Server error occurred while storing the client',
      });
    });
};

// Get a client identified by MongoDB _id
exports.getClient = (req, res) => {
  Client.findById(req.params.clientId)
    .then((client) => {
      if (!client) {
        return res.status(404).send({
          message: `Client not found with id ${req.params.clientId}`,
        });
      }

      return res.send(client);
    })
    .catch((err) => {
      console.log(err);
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: `Client not found with id ${req.params.clientId}`,
        });
      }

      return res.status(500).send({
        message: `Error retrieving client with id ${req.params.clientId}`,
      });
    });
};

// Update a client identified by MongoDB _id
exports.updateClient = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: 'Client content cannot be empty',
    });
    return;
  }

  // Update client in the database
  Client.findByIdAndUpdate(
    req.params.clientId,
    {
      name: req.body.name || 'New client',
      email: req.body.email,
      phone: req.body.phone,
      providers: req.body.providers,
    },
    { new: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: `Client not found with id ${req.params.clientId}`,
        });
      }
      return res.send(data);
    })
    .catch((err) => {
      console.log(err);
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: `Client not found with id ${req.params.clientId}`,
        });
      }
      return res.status(500).send({
        message: err.message || 'Server error occurred while storing the client',
      });
    });
};

// Delete a client identified by MongoDB _id
exports.deleteClient = (req, res) => {
  Client.findByIdAndRemove(req.params.clientId)
    .then((client) => {
      if (!client) {
        return res.status(404).send({
          message: `Client not found with id ${req.params.clientId}`,
        });
      }
      return res.send({ message: `Client ${client.name} deleted successfully!` });
    })
    .catch((err) => {
      console.log(err);
      if (err.kind === 'ObjectId' || err.name === 'NotFound') {
        return res.status(404).send({
          message: `Client not found with id ${req.params.clientId}`,
        });
      }
      return res.status(500).send({
        message: `Server error occurred while deleting the client ${req.params.clientId}`,
      });
    });
};

// Get providers of the client identified by MongoDB _id
exports.getClientProviders = (req, res) => {
  Client.findById(req.params.clientId)
    .then((client) => {
      if (!client) {
        return res.status(404).send({
          message: `Client not found with id ${req.params.clientId}`,
        });
      }

      return res.send(client.providers);
    })
    .catch((err) => {
      console.log(err);
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: `Client not found with id ${req.params.clientId}`,
        });
      }

      return res.status(500).send({
        message: `Error retrieving client with id ${req.params.clientId}`,
      });
    });
};

exports.deleteProviderRefs = (req, res) => {
  Client.find()
    .then((clients) => {
      clients.forEach((client, index) => {
        const oldProviders = client.providers;
        const newProviders = oldProviders.filter(
          // Leave only the provider refs that are different from the passed providerId
          ref => ref.id.toString() !== req.params.providerId
        );

        const c = clients[index];
        c.providers = newProviders;
        console.log(c);
        c.save()
          .then()
          .catch();
      });
    })
    .then(
      res.send({ message: `Refs to the privider ${req.params.providerId} were removed successfully` })
    )
    .catch((err) => {
      console.log(err);
      return res.status(500).send({
        message: err.message || 'Server error occurred while retrieving references.',
      });
    });
};
