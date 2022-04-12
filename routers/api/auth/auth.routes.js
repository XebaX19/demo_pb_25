const express = require('express');
const authControllers = require('../../../controllers/auth.controllers');
const passport = require('../../../middlewares/passport');

const router = express.Router();

router.post(
    '/register',
    //Definimos la estrategia definida en middlewares/passport.js para el register
    passport.authenticate('register', { failureRedirect: '/register-error' }),
    authControllers.register
);

router.post(
    '/login',
    //Definimos la estrategia definida en middlewares/passport.js para el login
    passport.authenticate('login', { failureRedirect: '/login-error' }),
    authControllers.login
);

// URL completa => /api/auth/twitter
//Inicia el flujo de autenticación con Twitter
router.get(
    '/twitter',
    //Definimos la estrategia definida en middlewares/passport.js para el login con Twitter
    passport.authenticate('twitter')
);

// URL completa => /api/auth/twitter/callback
router.get(
    '/twitter/callback',
    passport.authenticate('twitter', {
        successRedirect: '/profile',
        failureRedirect: '/twitter-error'
    })
);

module.exports = router;