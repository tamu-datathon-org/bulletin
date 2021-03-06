const config = require('./config');
// const { Readable } = require('stream');
const { MongoClient, ObjectId } = require('mongodb');
const logger = require('./logger');

const url = process.env.MONGODB_URL;
const bulletinDb = config.database.name;
// const { collections } = config.database;

exports.getClient = async () => (new MongoClient(url)).connect();

exports.closeClient = async (client) => {
    if (client) await client.close();
};

exports.ObjectId = async (id) => id ? new ObjectId(id) : ObjectId();

exports.dbInit = async () => {
    let client = null;
    try {
        client = (await exports.getClient());
        await Promise.all(Object.values(config.database.collections).map(async (collectionName) => {
            try {
                await client.db(bulletinDb).createCollection(collectionName);
                logger.info(`π${collectionName} created`);
            } catch (err) {
                logger.info(`π${collectionName} exists`);
            }
        }));
        await exports.closeClient(client);
        logger.info(`πππSuccessfully initilized mongoDb/${bulletinDb}πππ`);
    } catch (err) {
        await exports.closeClient(client);
        logger.info(`πError initializing mongoDb:: ${err.message}`);
    }
};
