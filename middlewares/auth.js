const auth = async (req, res, next) => {
  //Se verifica con "passport" si el usuario está autenticado
  if (req.isAuthenticated()) {
    next();
  }
  else {
    res.redirect('/');
  }
};

module.exports = auth;