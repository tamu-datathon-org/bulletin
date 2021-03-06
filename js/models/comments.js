const config = require('../utils/config');
const mongoUtil = require('../utils/mongoDb');

const comment = {
    userAuthId: null,
    submissionId: null,
    message: null,
    time: null,
};

const createComment = async (userAuthId, submissionId, message) => {
    if (!userAuthId) throw new Error('comment userAuthId is required');
    if (!submissionId) throw new Error('comment submissionId is required');
    if ((message?.length ?? 0) === 0) throw new Error('comment message cannot be null or empty');
    const commentObj = {
        userAuthId: await mongoUtil.ObjectId(userAuthId),
        submissionId: await mongoUtil.ObjectId(submissionId),
        message: message,
        time: (new Date()).toISOString(),
    };
    return commentObj;
};

const addComment = async (commentObj) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { insertedId } = await client.db(config.database.name)
            .collection(config.database.collections.comments).insertOne(commentObj);
        await mongoUtil.closeClient(client);
        return insertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error adding comment:: ${err.message}`);
    }
};

const removeComment = async (userAuthId, commentId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const doc = await client.db(config.database.name)
            .collection(config.database.collections.comments)
            .findOne({
                _id: await mongoUtil.ObjectId(commentId),
                userAuthId: await mongoUtil.ObjectId(userAuthId),
            });
        if (!doc) throw new Error('no comment found');
        await client.db(config.database.name)
            .collection(config.database.collections.comments).deleteOne({
                _id: await mongoUtil.ObjectId(commentId),
                userAuthId: await mongoUtil.ObjectId(userAuthId),
            });
        await mongoUtil.closeClient(client);
        return doc;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing comment:: ${err.message}`);
    }
};

const removeComments = async (commentIds) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        await client.db(config.database.name)
            .collection(config.database.collections.comments)
            .deleteMany({ _id: { $in: commentIds } });
        await mongoUtil.closeClient(client);
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing comments:: ${err.message}`);
    }
};

const getComment = async (commentId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const comment = await client.db(config.database.name)
            .collection(config.database.collections.comments)
            .findOne({ _id: await mongoUtil.ObjectId(commentId) });
        await mongoUtil.closeClient(client);
        return comment;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting comment:: ${err.message}`);
    }
};

const removeAllCommentsOfSubmissionId = async (submissionId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        await client.db(config.database.name)
            .collection(config.database.collections.comments)
            .deleteMany({ submissionId: await mongoUtil.ObjectId(submissionId) });
        await mongoUtil.closeClient(client);
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing comments:: ${err.message}`);
    }
};

module.exports = {
    comment,
    createComment,
    addComment,
    removeComment,
    removeComments,
    getComment,
    removeAllCommentsOfSubmissionId,
};
