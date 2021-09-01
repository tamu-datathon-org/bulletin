const config = require('../utils/config');
const mongoUtil = require('../utils/mongoDb');

const challenge = {
    title: null,
    description: null,
    accoladeIds: [],
    questionsIds: [],
};

const createChallenge = async (title, description, accoladeIds, questionIds) => {
    if (!title) throw new Error('challenge title is required');
    const challengeObj = {
        title: title,
        description: description || '',
        accoladeIds: accoladeIds || [],
        questionIds: questionIds || [],
    };
    return challengeObj;
};

const addChallenge = async (challengeObj) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { insertedId } = await client.db(config.database.name)
            .collection(config.database.collections.challenges).insertOne(challengeObj);
        await mongoUtil.closeClient(client);
        return insertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error adding challenge:: ${err.message}`);
    }
};

const removeChallenge = async (challengeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const challenge = await client.db(config.database.name)
            .collection(config.database.collections.challenges).findOneAndDelete({ _id: mongoUtil.ObjectId(challengeId) });
        await mongoUtil.closeClient(client);
        return challenge;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing challenge:: ${err.message}`);
    }
};

const getChallenge = async (challengeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const challenge = await client.db(config.database.name)
            .collection(config.database.collections.challenges).findOne({ _id: mongoUtil.ObjectId(challengeId) });
        await mongoUtil.closeClient(client);
        return challenge;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting challenge:: ${err.message}`);
    }
};

const getChallengesByTitles = async (titles) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const challenges = await client.db(config.database.name)
            .collection(config.database.collections.challenges).find({ title: titles }).toArray();
        await mongoUtil.closeClient(client);
        return challenges;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting challenges by titles:: ${err.message}`);
    }
};

module.exports = {
    challenge,
    createChallenge,
    addChallenge,
    removeChallenge,
    getChallenge,
    getChallengesByTitles,
};