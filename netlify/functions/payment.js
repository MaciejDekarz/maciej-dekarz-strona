const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { amount, tierName } = JSON.parse(event.body);

        if (!amount || amount < 100) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Minimalna kwota to 1 zł' })
            };
        }

        const origin = event.headers.origin || 'https://maciejdekarz.pl';

        // Tworzymy Checkout Session - użytkownik zostaje przekierowany na stronę Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'pln',
                        product_data: {
                            name: tierName || 'Wsparcie kanału Maciej Dekarz',
                            description: 'Dziękuję za wsparcie! 🙏',
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: origin + '/wybierzpogode.html?success=true',
            cancel_url: origin + '/wybierzpogode.html?cancelled=true',
        });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: session.url })
        };

    } catch (error) {
        console.error('Stripe error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error.message })
        };
    }
};
