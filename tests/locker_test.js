const express = require('express');
const locker = require('../locker');
const app = express();

app.use(locker());

app.get('/:id', (req, res) => {

    setTimeout(() => {
        res.send({ok: true, random: Math.random()});
    }, 3000);
});

app.listen(1234, () => {
    console.log('locker listening');
});