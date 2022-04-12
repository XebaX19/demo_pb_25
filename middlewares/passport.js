const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const bcrypt = require('bcrypt');
const util = require('util');
const usersUtils = require('../utils/users.utils');

const UserDao = require('../models/daos/Users.dao');
const { TWITTER_API_KEY, TWITTER_API_SECRET } = require('../env.config');
const User = new UserDao();

//Genera un Salt (elemento aleatorio utilizado para hashear)
const salt = () => bcrypt.genSaltSync(10);
//Se crea el hash con el salt creado anteriormente
const createHash = (pass) => bcrypt.hashSync(pass, salt());
//bcrypt encripta la información...luego se compara las cadenas encriptadas para verificar si son iguales o no
const isValidPassword = (user, pass) => bcrypt.compareSync(pass, user.password);

//Passport Local Strategy
//Se declara la siguiente estrategia llamada "login" (es un string que identifica la estrategia, es opcional)
//Tener en cuenta que el "done" es como el next del Middleware, para continuar la ejecución
passport.use('login', new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.getByEmail(username);
        if (!isValidPassword(user, password)) {
            console.log('Invalid user or password');

            return done(null, false); //el 2do parámetro en false indica que se vaya a la redirección que se indica en el "failureRedirect" (en el "auth.routes.js")
        }

        return done(null, user); //acá Passport almacena el usuario en la session
    } catch (error) {

        return done(error);
    }
}));

//Passport Local Strategy
//Se declara la siguiente estrategia llamada "register" (es un string que identifica la estrategia, es opcional)
passport.use('register', new LocalStrategy({
    passReqToCallback: true,    //con esta propiedad, podemos usar el "req" de la llamada
    },
    async (req, username, password, done) => {
        try {
            const userObject = {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                birthdate: req.body.birthdate,
                email: username,
                password: createHash(password),

            };
            const newUser = usersUtils.formatUserForDB(userObject);
            const user = await User.createUser(newUser);
            console.log('User registration sucessful!');

            return done(null, user);
        } catch (error) {
            console.log('Error signing up >>> ', error);

            return done(error);
        }
}));

//Passport Twitter Strategy
passport.use(new TwitterStrategy(
    {
        consumerKey: TWITTER_API_KEY,
        consumerSecret: TWITTER_API_SECRET,
        callbackURL: 'http://localhost:8080/api/auth/twitter/callback'
    },
    async (_accessToken, _refreshToken, profile, done) => { //el _ hace que descarte la variable que no se usa
        console.log(util.inspect(profile, false, 12, true));
        try {
            const twitterUser = await User.getByTwitterId(profile.id);

            if (!twitterUser) {
                const userObject = {
                    firstname: profile.displayName.split(' ')[0],
                    lastname: profile.displayName.split(' ')[1],
                    email: `${profile.username}@gmail.com`,
                    twitterId: profile.id
                }

                const newUser = usersUtils.formatUserForDB(userObject);
                const user = await User.createUser(newUser);
                console.log('User registration successful!');

                return done(null, user);
            }

            return done(null, twitterUser);
        } catch (error) {
            console.log('Error signing in with Twitter => ', error);

            return done(error);
        }
    }));

//Serializacion
//1ro Passport serializa el usuario y lo guarda en la session
passport.serializeUser((user, done) => {
    console.log('Inside serializer');
    done(null, user._id);
});

//Deserializacion
//2do Passport deserializa el usuario y lo utiliza
passport.deserializeUser(async (id, done) => {
    console.log('Inside deserializer');
    const user = await User.getById(id);
    done(null, user);
});

module.exports = passport;