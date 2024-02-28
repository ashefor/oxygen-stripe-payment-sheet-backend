require('dotenv').config()
const express = require("express");
const cors = require('cors')
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
app.post("/payment-sheet", async (req, res, next) => {
    try {
        const data = req.body;
        const params = {
            email: data.email,
            name: data.name,
        };
        const customer = await stripe.customers.create(params);

        const ephemeralKey = await stripe.ephemeralKeys.create(
            {customer: customer.id},
            {apiVersion: '2020-03-02'}
        );
        const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(data.amount),
            currency: data.currency,
            customer: customer.id,
            automatic_payment_methods: {
            enabled: true,
            },
        });
        const response = {
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
        };
        res.status(200).send(response);
    } catch(e) {
        next(e);
    }
});