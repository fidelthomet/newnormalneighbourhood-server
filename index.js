const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert');
const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware2')
const fs = require('fs')

const credentials = require('./credentials.json')
var user = encodeURIComponent(credentials.user);
var pass = encodeURIComponent(credentials.pass);
var auth = '?authMechanism=DEFAULT';

const filePath = '/home/f/www/files.nnn.ft0.ch/s'
 
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
server.use(restify.plugins.gzipResponse())

MongoClient.connect(url, function(err, client) {
  assert.strictEqual(null, err);
  console.log("Connected successfully to server");
  db = client.db(dbName);
  server.use(restify.plugins.bodyParser())
  server.get('/challenges', getChallenges)
  server.get('/speculations', getSpeculations)
  server.get('/speculation/:id', getSpeculation)
  server.post('/speculation', postSpeculation)
 
  // client.close();
  server.listen(65434, () => {
    console.log('%s listening at %s', server.name, server.url)
  })
});

function getChallenges (req, res, next) {
  db.collection('challenge').find({ active: true }).toArray((err, challenges) => {
    assert.strictEqual(err, null)
    res.charSet('utf-8')
    res.send(challenges)
    next()
  })
}

function getSpeculations (req, res, next) {
  db.collection('speculation').find({}).project({scenario: 1}).sort({ date: -1 }).toArray((err, speculations) => {
    assert.strictEqual(err, null)
    res.charSet('utf-8')
    res.send(speculations)
    next()
  })
}

function getSpeculation (req, res, next) {
  db.collection('speculation').find({_id: ObjectID(req.params.id)}).toArray((err, speculations) => {
    assert.strictEqual(err, null)
    res.charSet('utf-8')
    res.send(speculations)
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
    scenario: data.scenario,
    date: new Date(),
    // photo: data.photo,
    sketch: data.sketch,
    coords: [ data.coords[0], data.coords[1] ],
    title: data.title,
    description: data.description,
  }, (err, result) => {
    // console.log(result)
    const id = result.insertedIds[0]
    assert.strictEqual(err, null)
    const base64Data = data.photo.replace(/^data:image\/jpeg;base64,/, '');
    fs.writeFile(`${filePath}/${id}.jpg`, base64Data, 'base64', function(err) {
      console.log(err);
      res.send({id})
      next()
    })
  })
}
