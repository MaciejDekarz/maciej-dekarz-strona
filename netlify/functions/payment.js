const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Sprawdzenie metody HTTP
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Metoda nie dozwolona' })
    };
  }

  try {
    const { amount } = JSON.parse(event.body);

    // Walidacja kwoty
    if (!amount || amount < 100) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Kwota musi być większa niż 1 zł' })
      };
    }

    // Tworzenie Payment Intent w Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // kwota w groszach (centach)
      currency: 'pln',
      description: 'Wspieranie kanału Maciej Dekarz',
      metadata: {
        channel: 'Maciej Dekarz'
      }
    });

    // Zwracanie clientSecret do frontendu
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret
      })
    };
  } catch (error) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message || 'Błąd przetwarzania płatności'
      })
    };
  }
};
