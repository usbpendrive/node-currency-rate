require('dotenv').config();
const express = require('express');
const { getRates } = require('./lib/fixer-service');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use('/scripts', express.static(`${__dirname}/node_modules/`));

const errorHandler = (err, req, res) => {
    if (err.response) {
        res.status(403).send({ title: 'Server responded with an error', message: err.message });
    } else if (err.request) {
        res.status(503).send({ title: 'Unable to communicate with server', message: err.message });
    } else {
        res.status(500).send({ title: 'An unexpected error occured', message: err.message });
    }
};

app.get('/api/rates', async (req, res) => {
   try {
       const data = await getRates();
       res.setHeader('Content-Type', 'application/json');
       res.send(data);
   } catch (error) {
       errorHandler(error, req, res);
   }
});

app.use((req, res) => res.sendFile(`${__dirname}/public/index.html`));

app.listen(port, () => {
    console.log('listening on %d', port);
});

/*
const test = async() => {
    const data = await getRates();
    console.log(data);
};

test();
*/