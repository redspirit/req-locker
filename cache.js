const crypto = require('crypto');
const NodeCache = require('node-cache');

const md5 = (val) => {
    return crypto.createHash('md5').update(val).digest('hex');
};

/*
    params.ttl
    params.checkperiod
    params.cacheKey
    params.statusCode
    params.overrideSend
 */
module.exports = (params = {}) => {
    let cache = new NodeCache({
        stdTTL: params.ttl || 60,
        checkperiod: params.checkperiod || 5,
    });

    let cacheKey = (req) => {
        return md5([
            req.method,
            req.originalUrl,
            JSON.stringify(req.body || ''),
        ].join('.'));
    }

    if (typeof params.cacheKey === 'function') {
        cacheKey = params.cacheKey;
    }

    return (req, res, next) => {
        let key = cacheKey(req);
        let cachedData = cache.get(key);
        if (cachedData) {
            return res.status(params.statusCode || 200).send(cachedData);
        }

        if (params.overrideSend) {
            let send = res.send;
            res.send = function (data) {
                cache.set(key, data);
                send.call(this, data);
            }
        } else {
            res.cachedSend = (data) => {
                cache.set(key, data);
                res.send(data);
            }
        }

        next();
    };
};