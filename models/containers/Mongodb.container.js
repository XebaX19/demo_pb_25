
const mongoose = require('mongoose');
const dbConfig = require('../../db/config');
const { formatErrorObject } = require('../../utils/api.utils');
const constants = require('../../constants/api.constants');

const { 
  STATUS: { 
    INTERNAL_ERROR,
    NOT_FOUND,
    BAD_REQUEST,
  }
} = constants;

class MongoDBContainer {
  static instancia;
  constructor(collection, Schema) {
    if (!MongoDBContainer.instancia) {
      mongoose.connect(dbConfig.mongodb.connectTo('ecommerce'))
        .then(() => {
          console.log('Connected to DB!');
          MongoDBContainer.instancia = this;
        });
      this.model = mongoose.model(collection, Schema);
    }
    else {
      MongoDBContainer.instancia.model = mongoose.model(collection, Schema);
      return MongoDBContainer.instancia;
    }
  };

  async getAll(filter = {}) {
    try{
      const documents = await this.model.find(filter,{ __v: 0 }).lean();
      return documents;
    }
    catch(error) {
      const newError = formatErrorObject(INTERNAL_ERROR.tag, error.message);
      throw new Error(JSON.stringify(newError));
    }
  }

  async getById(id) {
    try {
      const document = await this.model.findById(id, { __v: 0 }).lean();
      if (!document) {
        const errorMessage = `Resource with id ${id} does not exist in our records`;
        const newError = formatErrorObject(NOT_FOUND.tag, errorMessage);
        throw new Error(JSON.stringify(newError));
      } else {
        return document;
      }
    }
    catch(error) {
      const newError = formatErrorObject(INTERNAL_ERROR.tag, error.message);
      throw new Error(JSON.stringify(newError));
    }
  }

  async createItem(resourceItem, populateCallback = null) {
    try {
      const newItem = new this.model(resourceItem);
      await newItem.save();
      populateCallback && await populateCallback(newItem._id);
      return newItem;
    }
    catch (err) {
      console.log('error creating item >>> ', err);
      const newError = formatErrorObject(INTERNAL_ERROR.tag, err.message);
      throw new Error(JSON.stringify(newError));
    }
  }
}

module.exports = MongoDBContainer;
