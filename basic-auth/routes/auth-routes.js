const express = require('express');
const authRoutes = express.Router();
const User = require('../models/User');

const bcrypt = require('bcrypt');
const bcryptSalt = 10;

authRoutes.get('/signup', (req, res) => {
    res.render('auth/signup');
});

authRoutes.get("/login", (req, res, next) => {
    res.render("auth/login");
});

authRoutes.post('/signup', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username === "" || password === "") {
        res.render("auth/signup", {
            errorMessage: "Indicate a username and a password to sign up"
        });
        return;
    }

    User.findOne({'username': username},
        'username', (err, user) => {
            if (user !== null) {
                res.render("auth/signup", {
                    errorMessage: "The username already exists"
                });
                return;
            }

            const salt = bcrypt.genSaltSync(bcryptSalt);
            const hashPass = bcrypt.hashSync(password, salt);

            const newUser = User({
                username,
                password: hashPass
            });

            newUser.save((err) => {
                if (err) {
                    res.render("auth/signup", {
                        errorMessage: "Something went wrong"
                    });
                } else {
                    res.redirect('/');
                }
            });
        });
});

authRoutes.post("/login", (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username === "" || password === "") {
        res.render("auth/login", {
            errorMessage: "Indicate a username and a password to sign up"
        });
        return;
    }

    User.findOne({ "username": username }, (err, user) => {
        if (err || !user) {
            res.render("auth/login", {
                errorMessage: "The username doesn't exist"
            });
            return;
        }
        if (bcrypt.compareSync(password, user.password)) {
            // Save the login in the session!
            req.session.currentUser = user;
            res.redirect("/");
        } else {
            res.render("auth/login", {
                errorMessage: "Incorrect password"
            });
        }
    });
});

authRoutes.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        res.redirect("/login");
    });
});

module.exports = authRoutes;