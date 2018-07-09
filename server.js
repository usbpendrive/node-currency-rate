require('dotenv').config();
const express = require('express');
const { getRates, getSymbols, getHistoricalRate } = require('./lib/fixer-service');
const { convertCurrency } = require('./lib/free-currency-service');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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

app.get('/api/symbols', async (req, res) => {
    try {
        const data = await getSymbols();
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    } catch (error) {
        errorHandler(error, req, res);
    }
});

app.post('/api/convert', async (req, res) => {
    try {
        const { from, to } = req.body;
        console.log(`${from} -> ${to}`);
        const data = await convertCurrency(from, to);
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    } catch (error) {
        console.log(req.body);
        errorHandler(error, req, res);
    }
});

app.post('/api/historical', async (req, res) => {
    try {
        const { date  } = req.body;
        const data = await getHistoricalRate(date);
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    } catch (error) {
        console.log(req.body);
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

/*
const test = async() => {
    const data = await convertCurrency('USD', 'IDR');
    console.log(data);
};

test();
*/