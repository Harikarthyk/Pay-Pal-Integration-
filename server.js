require('dotenv')
const express = require("express");
const engines = require("consolidate");
const paypal = require("paypal-rest-sdk");

const app = express();


app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id:
        'AbiRj24VH3krWUGCJ8o54JUbQA_CczdQZUC8qQCG0-ukaYTcI4V-Fleap5nOnI6p9mYgQ2mSofvHp6PF',
    client_secret:
        'ENTVFGwF_TASlgTsVPpRhIa7mi6Xkav-YpaO4hfPaY78qlGWsnzD3yW34yvGbtM6Km8peCnMzOE7WpT2'
});

/**
 * Test Route
 */
app.get("/check", (req, res) => {
    res.send("Its up and running.");
});

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/paypal", (req, res) => {
    var create_payment_json = {
        intent: "sale",
        payer: {
            payment_method: "paypal"
        },
        redirect_urls: {
            return_url: `${url}success`,
            cancel_url: `${url}cancel`
        },
        transactions: [
            {
                item_list: {
                    items: req.body.items
                },
                amount: {
                    currency: "USD",
                    total:req.body.total,
                    details: {
                        subtotal: req.body.subtotal,
                        tax: req.body.tax,
                        shipping: req.body.shipping,
                        discount: req.body.discount
                      }
                },
                description: "Organize Me",
               
            }
        ]
    };
    console.log(create_payment_json)
    paypal.payment.create(create_payment_json, function(error, payment) {
        if (error) {
            console.log(error);
            res.render("failed");
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            res.redirect(payment.links[1].href);
        }
    });
});

/**
 * Redirection url if success
 */
app.get("/success", (req, res) => {
    console.log('-----comming')
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;
    var execute_payment_json = {
        payer_id: PayerID,
    };
    paypal.payment.execute(paymentId, execute_payment_json, function(
        error,
        payment
    ) {
        if (error) {
            console.log(error.response);
            res.render("failed");
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.render("success");
        }
    });
});

;

/**
 * Redirection url if cancel
 */
app.get("/cancel", (req, res) => {
    res.render("cancel");
});
app.get("/failed", (req, res) => {
    res.render("failed");
});

const PORT = 5050;
let url = process.env.NODE_ENV === "production" ? "" : `http://localhost:${PORT}/`

app.listen(PORT, () => console.log(`Server is up and running at ${PORT}`));
