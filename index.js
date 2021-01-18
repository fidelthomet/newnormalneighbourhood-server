const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware2')

const credentials = require('./credentials.json')
var user = encodeURIComponent(credentials.user);
var pass = encodeURIComponent(credentials.pass);
var auth = '?authMechanism=DEFAULT';
 
// DB options
const url = `mongodb://${user}:${pass}@localhost:27017/${auth}`;
const dbName = 'nnn';
let db = null
 
// init
const server = restify.createServer()
const cors = corsMiddleware({
  preflightMaxAge: 5, // Optional
  origins: ['*'],
  allowHeaders: ['API-Token'],
  exposeHeaders: ['API-Token-Expiry']
})
server.pre(cors.preflight)
server.use(cors.actual)

MongoClient.connect(url, function(err, client) {
  assert.strictEqual(null, err);
  console.log("Connected successfully to server");
  db = client.db(dbName);
  server.use(restify.plugins.bodyParser())
  server.get('/api/all', getAll)
  server.post('/api/speculation', postSpeculation)
 
  // client.close();
  server.listen(65434, () => {
    console.log('%s listening at %s', server.name, server.url)
  })
});

function getAll (req, res, next) {
  db.collection('speculation').find({}).toArray((err, speculations) => {
    assert.strictEqual(err, null)
    res.charSet('utf-8')
    res.send({speculations})
    next()
  })
}

function postSpeculation (req, res, next) {
  const data = req.body
  // validation
  // if (!ObjectId.isValid(req.body.user) || req.body.text == null) {
  //   res.send(400, {error: 'request not valid'})
  //   next()
  //   return
  // }

  // insert
  db.collection('speculation').insert({
    type: data.type,
    date: new Date(),
    photo: data.photo,
    sketch: data.sketch,
    coords: [ data.coords[0], data.coords[1] ],
    title: data.title,
    description: data.description,
  }, (err, result) => {
    assert.strictEqual(err, null)
    res.send(200)
    next()
  })
}
