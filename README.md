# gitlab-webhook-handler

Node.js >= 0.12

gitlab <= 7.11.4

从[gitlab-webhook-handler](https://github.com/rvagg/github-webhook-handler)修改而来，用来处理 gitlab 的 webhook 的一个中间件。由于我使用的gitlab是v7.11.4版本，目前默认仅支持 push、tag、issue 和 merge 事件，并且不支持SSL。

GitLab allows you to register **[Webhooks](https://gitlab.com/gitlab-org/gitlab-ee/blob/v7.11.4/doc/web_hooks/web_hooks.md)** for your repositories. Each time an event occurs on your repository, whether it be pushing code, filling issues or creating pull requests, the webhook address you register can be configured to be pinged with details.

This library is a small handler (or "middleware" if you must) for Node.js web servers that handles all the logic of receiving.

## Example

```js
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
```

## API

gitlab-webhook-handler exports a single function, use this function to *create* a webhook handler by passing in an *options* object. Your options object should contain:

 * `"path"`: the complete case sensitive path/route to match when looking at `req.url` for incoming requests. Any request not matching this path will cause the callback function to the handler to be called (sometimes called the `next` handler).
 * `"events"`: an optional array of whitelisted event types (see: *events.json*). If defined, any incoming request whose `X-Github-Event` can't be found in the whitelist will be rejected. If only a single event type is acceptable, this option can also be a string.

The resulting **handler** function acts like a common "middleware" handler that you can insert into a processing chain. It takes `request`, `response`, and `callback` arguments. The `callback` is not called if the request is successfully handled, otherwise it is called either with an `Error` or no arguments.

The **handler** function is also an `EventEmitter` that you can register to listen to any of the GitLab event types. Note that the `"error"` event will be liberally used, even if someone tries the end-point and they can't generate a proper signature, so you should at least register a listener for it or it will throw.

See the [GitLab Webhooks documentation](https://gitlab.com/gitlab-org/gitlab-ee/blob/v7.11.4/doc/web_hooks/web_hooks.md) for more details on the events you can receive.

Included in the distribution is an *events.json* file which maps the HTTP header *X-Gitlab-Event* to event names:

```js
var events = require('gitlab-webhook-handler/events')
Object.keys(events).forEach(function (event) {
  console.log(event, '=', events[event])
})
```

Additionally, there is a special `'*'` even you can listen to in order to receive _everything_.

## License

**gitlab-webhook-handler** is Copyright (c) 2016 [xlaoyu](http://xlaoyu.info) and licensed under the MIT License.

**github-webhook-handler** is Copyright (c) 2014 Rod Vagg [@rvagg](https://twitter.com/rvagg) and licensed under the MIT License. All rights not explicitly granted in the MIT License are reserved. See the included [LICENSE.md](./LICENSE.md) file for more details.
