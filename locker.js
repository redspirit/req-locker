const crypto = require('crypto');

const md5 = (val) => {
    return crypto.createHash('md5').update(val).digest('hex');
};

/*
    params.reqKey
    params.statusCode
 */
module.exports = (params = {}) => {
    const lockedResponse = {};

    let reqKey = (req) => {
        return md5([
            req.method,
            req.originalUrl,
            JSON.stringify(req.body || ''),
        ].join('.'));
    }

    if (typeof params.reqKey === 'function') {
        reqKey = params.reqKey;
    }

    return (req, res, next) => {
        let key = reqKey(req);

        if (typeof key !== 'string') {
            throw new Error('[Locker] Key must be a String');
        }

        let send = res.send;
        res.send = function (data) {
            res.responsePayload = data;
            send.call(this, data);
        }

        let origRes = lockedResponse[key];
        if (origRes) {
            // is retried
            console.log(`HOLD [${Object.keys(lockedResponse).length}]`);
            origRes.on('finish', () => {
                console.log('RELEASE');
                return res.status(params.statusCode || 200).send(origRes.responsePayload);
            });
            // origRes.on('close', () => {
            //     console.log('RELEASE close');
            // });
        } else {
            // is original
            res.setMaxListeners(30);
            lockedResponse[key] = res;
            res.on('finish', () => {
                // console.log('on FINISH');
                delete lockedResponse[key];
            });
            res.on('close', () => {
                // console.log('on CLOSE');
                delete lockedResponse[key];
            });
            next();
        }
    };
};