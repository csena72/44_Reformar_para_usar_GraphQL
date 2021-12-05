require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV;
const MONGO_URI = NODE_ENV === 'development' ? process.env.MONGO_URI_DEV : process.env.MONGO_URI_PROD

module.exports = {
    PORT: process.env.PORT,
    MONGO_URI: MONGO_URI || '',
}