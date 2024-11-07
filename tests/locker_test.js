const express = require('express');
const locker = require('../locker');
const axios = require("axios");
const app = express();

app.use(locker());

app.get('/:id', (req, res) => {

    console.log('get request', req.url);

    // if(req.url === '/req1') {
    //     return setTimeout(() => {
    //         res.send({ok: true, random: Math.random()});
    //     }, 500);
    // }

    setTimeout(() => {
        res.send({ok: true, random: Math.random()});
    }, 1000);
});

let makeRequest = (name) => {
    axios.get('http://127.0.0.1:1234/' + name, {timeout: 2000}).then(res => {
        console.log('OK ' + name, res.data);
    }, err => {
        console.error(name, err.toString());
    });
}

app.listen(1234, async () => {
    console.log('locker listening');

    makeRequest('req1');
    makeRequest('req1');
    makeRequest('req1');
    makeRequest('req1');
    makeRequest('req1');
    makeRequest('req1');
    makeRequest('req1');
    makeRequest('req1');
    makeRequest('req1');
    makeRequest('req1');
    makeRequest('req1');
    makeRequest('req1');

});