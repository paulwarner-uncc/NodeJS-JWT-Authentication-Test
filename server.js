const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const exjwt = require("express-jwt");

const PORT = 3000;

const app = express();
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Headers", "Authorization");
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// TODO: replace with a database and, y'know, actual security
const SECRET_KEY = "This is not a secret, replace this ASAP.";
const users = [
    {
        id: 1,
        username: "pwarner7",
        password: "password"
    },
    {
        id: 2,
        username: "notadmin",
        password: "notpassword"
    }
];

const jwtMW = exjwt.expressjwt({
    secret: SECRET_KEY,
    algorithms: ["HS256"]
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    for (let user of users) {
        if (username === user.username && password === user.password) {
            let token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY,
                { expiresIn: 3*60 });

            res.json({
                success: true,
                err: null,
                token: token
            });
            return;
        }
    }

    res.status(401).json({
        success: false,
        err: "Incorrect username or password.",
        token: null
    });
});

app.get("/api/dashboard", jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: "This is the dashboard."
    });
});

app.get("/api/settings", jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: "Your settings are: gravity=True"
    })
});

// As a fail-safe, if /settings or /dashboard are ever requested directly, redirect to /
app.get("/dashboard", (req, res) => {
    res.redirect("/");
});

app.get("/settings", (req, res) => {
    res.redirect("/");
});

app.use(function (err, req, res, next) {
    if (err.name === "UnauthorizedError") {
        res.status(401).json({
            success: false,
            err: "You are not authorized to access this resource."
        });
    } else {
        next(err);
    }
})

app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});

