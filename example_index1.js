const express = require('express');

const app = express();
app.use(express.json());

const dataList = [];

// create a GET response to any GET requests coming on our endpoint named /data
app.get('/data',(req, res) => {
    res.status(200).send('Welcome!');
    return;
});
app.listen({port:8080},() => {
    console.log('Server is running');
});
