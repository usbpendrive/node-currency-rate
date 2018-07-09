window.addEventListener('load', () => {
    const el = $('#app');

    const errorTemplate = Handlebars.compile($('#error-template').html());
    const ratesTemplate = Handlebars.compile($('#rates-template').html());
    const exchangeTemplate = Handlebars.compile($('#exchange-template').html());
    const historicalTemplate = Handlebars.compile($('#historical-template').html());

    const router = new Router({
        mode: 'history',
        page404: (path) => {
            const html = errorTemplate({
                color: 'yellow',
                title: 'Error 404 - Page NOT Found!',
                message: `The path '/${path}' does not exist on this site`,
            });
            el.html(html);
        },
    });

    const api = axios.create({
        baseURL: 'https://intense-scrubland-26939.herokuapp.com/api',
        timeout: 5000
    });

    const showError = (error) => {
        const { title, message } = error.response.data;
        const html = errorTemplate({
            color: 'red',
            title, message
        });
        el.html(html);
    };

    router.add('/', async () => {
        let html = ratesTemplate();
        el.html(html);

        try {
            const response = await api.get('/rates');
            const { base, date, rates } = response.data;
            html = ratesTemplate({ base, date, rates });
            el.html(html);
        } catch (error) {
            showError(error);
        } finally {
            $('.loading').removeClass('loading');
        }
    });

    getConversionResults = async () => {
        const from = $('#from').val();
        const to = $('#to').val();
        const amount = $('#amount').val();

        try {
            const response = await api.post('/convert', { from: from, to: to});
            console.log(`${from} -> ${to}`);
            const { rate } = response.data;
            const result = rate * amount;
            $('#result').html(`${to} ${result}`)
        } catch (error) {
            showError(error);
        } finally {
            $('#result-segment').removeClass('loading');
        }

    };

    const convertRatesHandler = () => {
        if ($('.ui.form').form('is valid')) {
            $('.ui.error.message').hide();
            $('#result-segment').addClass('loading');
            getConversionResults();
            return false;
        }

        return true;
    };

    router.add('/exchange', async () => {
        let html = exchangeTemplate();
        el.html(html);
        try {
            const response = await api.get('/symbols');
            const { symbols } = response.data;
            html = exchangeTemplate({ symbols });
            el.html(html);

            $('.loading').removeClass('loading');
            $('.ui.form').form({
                fields: {
                    from: 'empty',
                    to: 'empty',
                    amount: 'decimal',
                }
            });
            $('.submit').click(convertRatesHandler);
        } catch (error) {
            showError(error);
        }
    });

    const getHistoricalRates = async () => {
        const date = $('#date').val();
        try {
            const response = await api.post('/historical', { date: date });
            const { base, rates } = response.data;
            const html = ratesTemplate({
                base, date, rates
            });
            $('#historical-table').html(html);
        } catch (error) {
            showError(error);
        } finally {
            $('.segment').removeClass('loading');
        }
    };

    const historicalRatesHandler = () => {
        if ($('.ui.form').form('is valid')) {
            $('.ui.error.message').hide();
            $('.segment').addClass('loading');
            getHistoricalRates();
            return false;
        }
        return true;
    };

    router.add('/historical', () => {
        const html = historicalTemplate();
        el.html(html);

        $('#calendar').calendar({
            type: 'date',
            formatter: {date: date => new Date(date).toISOString().split('T')[0],},
        });
        $('.ui.form').form({
            fields: {
                date: 'empty',
            },
        });
        $('.submit').click(historicalRatesHandler);
    });

    router.navigateTo(window.location.pathname);

    const link = $(`a[href$='${window.location.pathname}']`);
    link.addClass('active');

    $('a').on('click', (event) => {
        event.preventDefault();

        const target = $(event.target);
        $('.item').removeClass('active');
        target.addClass('active');

        const href = target.attr('href');
        const path = href.substr(href.lastIndexOf('/'));
        router.navigateTo(path);
    });
});