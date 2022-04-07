const env = require('../env.config');

module.exports = {
  mongodb: {
    connectTo: (database) => `mongodb+srv://XebaX:${env.DB_PASSWORD}@xebaxfree.6gtqe.mongodb.net/${database}?retryWrites=true&w=majority`,
  }
  // Change here for your mongo atlas account's URI
}