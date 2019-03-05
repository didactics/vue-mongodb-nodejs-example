const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const yamljs = require('yamljs');

const pj = require('./package.json');
const config = require('./config.json');

mongoose.Promise = global.Promise;

mongoose.connect(config.db, {
  useNewUrlParser: true,
}).then(() => {
  console.log(`\nSuccessfully connected to the database ${config.db}`);
}).catch((err) => {
  console.log(`\n!!! Error: Could not connect to the database ${config.db}.\n\nExiting now...\n\n`, err);
  process.exit();
});

const swaggerDoc = yamljs.load(config.swaggerDoc);

const app = express();
const router = express.Router();

app.use(express.static(path.join(__dirname, config.staticDir)));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(config.apiDocPath, swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use(config.apiPath, router);

// Clients
const cc = require('./api/controllers/clients');

router.route('/clients')
  .get(cc.getAllClients)
  .post(cc.createClient);

router.route('/clients/:clientId')
  .get(cc.getClient)
  .put(cc.updateClient)
  .delete(cc.deleteClient);

router.route('/clients/refs/:providerId')
  .delete(cc.deleteProviderRefs);

router.route('/clients/:clientId/providers')
  .get(cc.getClientProviders);

// Providers
const pc = require('./api/controllers/providers');

router.route('/providers')
  .get(pc.getAllProviders)
  .post(pc.createProvider);

router.route('/providers/:providerId')
  .get(pc.getProvider)
  .put(pc.updateProvider)
  .delete(pc.deleteProvider);

app.listen(config.port, config.host, () => {
  console.log(`\n${pj.description}\n
  Navigate your browser to http://${config.host}:${config.port}`);
});

module.exports = app;
