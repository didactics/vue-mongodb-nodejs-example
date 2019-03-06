# Vue Bootstrap-vue Mongoose Swagger Axios Express Node MongoDB example

A single-page application (SPA) demonstrating the VueJS+NodeJS+MongoDB stack.

## About
The frontend employs a RESTful API requesting a local MongoDB instance with Mongoose ODM on ExpressJS and NodeJS server. The [Swagger tools](https://swagger.io) were used for building and documenting the API, and the API exposes an endpoint for accessing the Swagger UI.

The source code is (c) 2019 by [Sergei Vasilyev](mailto:vasilievsi@gmail.com), and is distributed by the author under the terms of [MIT License](https://opensource.org/licenses/MIT).

## Installation
The following instructions apply to Debian Linux distributions. Installation was tested on a clean **Ubuntu Desktop 16.04 x64** instance, the client was test run in **Chromium v.71** and **Firefox v.65**.

1. If on Ubuntu, open a Terminal window by pressing <kbd>Ctrl+Alt+T</kbd>. Clean apt cache and run updates.
``` bash
	sudo apt-get clean
	sudo apt-get update
	sudo apt-get upgrade
```
2. Install Node.js.
``` bash
	sudo apt-get install curl
	curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
	sudo apt-get install -y nodejs
```
3. Install MongoDB.
``` bash
	sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4
```
``` bash
	echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list
```
``` bash
	sudo apt-get update
	sudo apt-get install -y mongodb-org
```
4. Change to the dir where this README file is located, e.g.
``` bash
	cd ~/vue-mongodb-nodejs-example
```
5. Install prerequisite NPM modules.
``` bash
	sudo npm install express body-parser mongoose validator swagger-ui-express yamljs
```

6. Run the local MongoDB instance.
``` bash
	sudo service mongod start
```

7. Import test collections to MongoDB.
``` bash
	mongoimport --db vue-mongodb-nodejs-example --collection clients --file ./db/export/clients.json
	mongoimport --db vue-mongodb-nodejs-example --collection providers --file ./db/export/providers.json
```

## Running the SPA
1. Run the webapp from this README file's directory
``` bash
	npm start
```
2. Open the client in your browser

	http://localhost:8080/

3. Open Swagger UI in another browser tab

	http://localhost:8080/api-docs/


## Usability notes
- clicks on the Name and Phone table headers to change table sorting;

- the filter is case-insensitive;

- double-clicks on the table rows bring about the Edit Client dialog;

- Edit/delete features of the New/Edit Client form are implemented as in-place editors as Bootstrap 4 prohibits stacked modal dialogs: "[Bootstrap only supports one modal window at a time. Nested modals aren’t supported as we believe them to be poor user experiences.](https://getbootstrap.com/docs/4.1/components/modal/)"

## Stopping the SPA
Press <kbd>Ctrl+C</kbd> in the Terminal window.

## Stopping the MongoDB service
``` bash
	sudo service mongodb stop
```