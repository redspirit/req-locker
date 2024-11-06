# req-locker
Express middleware for caching and locking requests

It includes 2 libraries: cache and locker.

[Russian ReadMe](README_ru.md)

## Installation
```bash
npm i req-locker
```

## cache 
The usual caching of requests in the server's RAM

The simplest example:
```js
const { cache } = require('req-locker');

app.use(cache({
    overrideSend: true
}));
```

### Configuration:
The **cache(params)** function accepts a single object with parameters:
* `ttl`=60 - cache lifetime in seconds
* `checkperiod`=5 - the cache check interval in seconds
* `cacheKey` - the function of determining the cache key by request, by default, an MD5 hash is taken by the url of the request, including all its query and body, but the user can specify any text key, for example, cache only one query parameter 
* `statusCode`=200 - which HTTP code should be used to respond if the cached value is returned
* `overrideSend`=false - if this parameter is `true`, the library will overwrite the standard `res.send()` method to save the response to the request in the cache. If the value is `false`, then to save the cache, you need to return a response to the request using the new method `res.cachedSend()`

## locker
This middleware "holds" the retry requests until the original request returns a response.

### What is it for?
Imagine a situation where you have a highly loaded request on a server that calculates, for example, tariffs for a service, it takes into account many parameters
and, in the usual version, it responds in 2 seconds. At peak load times, the response increases significantly, for example, up to 8-10 seconds.
If the request needs to be waited for so long, then users may perceive it as an error but try to call the request again (it all depends on the implementation of the client side)
or external integration can call your method and retry the request with a large timeout. In this case, the already overloaded service receives additional retry requests
that cause even more load (in this case, the cache will not help, since the "first" request has not yet received data for caching).
It turns out to be a snowball effect, the longer the server responds, the more retries it receives and even more heavily loaded up to failure.

**locker** is a simple mechanism that simply finds retry requests by key (similar to the cache key) and holds their connection until the
original request receives data for a response. At this point, the server will respond to both the original request and all the retreats at the same time with the same response.
At the same time, retry requests ** will not** unnecessarily load the server, preventing the snowball effect.

If you encounter a similar problem during peak load times, then locker may be able to help you.

The simplest example:
```js
const { locker } = require('req-locker');

app.use(locker());
```

### Configuration:
The **locker(params)** function accepts a single object with parameters:
* `reqKey` - function of determining the request key, similar to `cacheKey`
* `statusCode`=200

## ToDo:
 - Improve documentation and examples
 - Write unit tests
 - Add methods for collecting statistics