const express = require('express');
const cache = require('../cache');
const app = express();

let getCacheKey = (req) => {
    return req.query.a;
}

app.use(cache({
    overrideSend: true,
    cacheKey: getCacheKey
}));

app.get('/:id', (req, res) => {
    console.log('Do request!');

    setTimeout(() => {
        res.send({ok: true, random: Math.random()});
    }, 1000);
});

app.listen(1234, () => {
    console.log('test listening');
});