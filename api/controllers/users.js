const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const mongoose = require('mongoose');


exports.allUsers = (req, res, next) => {    
    User.find()
    .then((docs) => {
        res.status(200).json({
            message: 'Użytkownicy: ',
            info: docs,
        });
    })
    .catch((err) => res.status(503).json({message: err}));
};

exports.newUser = (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {   
        if(err) {
            res.status(500).json({wiadomość: err});
        } else {
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                password: hash,
            });
            user.save()
            .then((user) => {
                res.status(201).json({
                    wiadomość: 'Stworzono konto',
                    info: user
                });
            })
            .catch((err) => res.status(500).json({ wiadomość: err }));
        }
    }); 
};

exports.userDelete = (req, res, next) => {
    User.remove({_id: req.params.userId})
    .then(user => {
        res.status(200).json({wiadomość: 'Usunięto konto'});
    })
    .catch((err) => res.status(500).json({ wiadomość: err }));
};


exports.userLogin = (req, res, next) => {
    User.findOne({ email: req.body.email })
    .then((user) => {
        if (!user) {
          res.status(401).json({ wiadomość: 'Błąd autoryzacji' });  
        }
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (err) {
                res.status(500).json({ wiadomość: err });  
            }
            if (result) {   
                const token = jwt.sign (
                    {
                    email: user.email,
                    userId: user._id,
                    },
                    process.env.JWTpassword,
                    {
                        expiresIn: "1h"  
                    }
                );
                res.status(200).json({ 
                    wiadomość: 'Zalogowano użytkownika', 
                    token: token });
            }else {
                res.status(401).json({ wiadomość: 'Błąd autoryzacji' });  
            }
        })
    })
    .catch((err) => res.status(500).json({ wiadomość: err }));
};