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

module.exports = router;