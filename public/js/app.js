window.addEventListener('load', () => {
    const el = $('#app');

    const errorTemplate = Handlebars.compile($('#error-template').html());
    const ratesTemplate = Handlebars.compile($('#rates-template').html());
    const historicalTemplate = Handlebars.compile($('#historical-template').html());

    const html = ratesTemplate();
    el.html(html);
});