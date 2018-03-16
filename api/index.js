const Koa = require('koa');
const mongoose = require('mongoose');
const logger = require('koa-logger');
const cors = require('kcors');
const bodyParser = require('koa-bodyparser');
const serve2 = require('koa-static');
const serve = require('koa-static-folder');
const routes = require('./routes');
const config = require('./config');

// Make mongoose use native ES6 promises
mongoose.Promise = global.Promise;

// Connect to MongoDB
mongoose.connect(config.database.url, config.database.opts);

const app = new Koa()
    .use(cors())
    .use(logger())
    .use(bodyParser())
    .use(routes);

app.use(serve2('./uploads'));

const server = app.listen(config.server.port);

module.exports = server;