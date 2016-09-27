var http = require('http')
var createHandler = require('./gitlab-webhook-handler')
var handler = createHandler({ path: '/webhook', events: ['Push Hook', 'Issue Hook']})

http.createServer(function (req, res) {
  handler(req, res, function (err) {
   res.statusCode = 404
   res.end('no such location')
  })
}).listen(7777)

handler.on('error', function (err) {
  console.error('Error:', err.message)
})

handler.on('Push Hook', function (event) {
  console.log('Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref)
})

handler.on('Issue Hook', function (event) {
  console.log('Received an issue event for %s action=%s: #%d %s',
    event.payload.user.name,
    event.payload.object_attributes.action,
    event.payload.object_attributes.id,
    event.payload.object_attributes.title)
})
