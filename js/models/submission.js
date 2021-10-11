const config = require('../utils/config');
const logger = require('../utils/logger');
const mongoUtil = require('../utils/mongoDb');

const submission = {
    eventId: null,
    name: null,
    userSubmissionLinks: [],
    accoladeIds: [],
    challengeId: null,
    links: [],
    tags: [],
    videoLink: null,
    likeIds: [],
    commentIds: [],
    answer1: null,
    answer2: null,
    answer3: null,
    answer4: null,
    answer5: null,
    sourceCode: null,
    sourceCodeKey: null,
    icon: null,
    iconKey: null,
    photos: {},
    markdown: null,
    markdownKey: null,
    submission_time: null,
};

const createSubmission = async (eventId, name, discordTags,
    userSubmissionLinkIds, challengeId, links, tags, videoLink,
    answer1, answer2, answer3, answer4, answer5) => {
    if (!eventId) throw new Error('submission eventId is required');
    if (!name) throw new Error('submission name is required');
    const submissionObj = {
        eventId: await mongoUtil.ObjectId(eventId),
        name: name,
        discordTags: discordTags || [],
        userSubmissionLinkids: userSubmissionLinkIds || [],
        challengeId: challengeId ? await mongoUtil.ObjectId(challengeId) : '',
        links: links || [],
        tags: tags || [],
        videoLink: videoLink || '',
        submission_time: (new Date()).toISOString(),
        answer1: answer1,
        answer2: answer2,
        answer3: answer3,
        answer4: answer4,
        answer5: answer5,
    };
    return submissionObj;
};

const addSubmission = async (submissionObj, submissionId = null) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.submissions)
            .updateOne(
                { _id: await mongoUtil.ObjectId(submissionId) },
                { $set: submissionObj },
                { upsert: true },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error inserting submission:: ${err.message}`);
    }
};

const removeSubmission = async (eventId, submissionId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const doc = await client.db(config.database.name)
            .collection(config.database.collections.submissions)
            .findOne({
                _id: await mongoUtil.ObjectId(submissionId),
                eventId: await mongoUtil.ObjectId(eventId),
            });
        await client.db(config.database.name)
            .collection(config.database.collections.submissions)
            .deleteOne({
                _id: await mongoUtil.ObjectId(submissionId),
                eventId: await mongoUtil.ObjectId(eventId),
            });
        await mongoUtil.closeClient(client);
        return doc;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing submission:: ${err.message}`);
    }
};

const addLike = async (submissionId, likeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.submissions).updateOne(
                { _id: await mongoUtil.ObjectId(submissionId) },
                { $addToSet: { likeIds: await mongoUtil.ObjectId(likeId) } },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error adding like to submission:: ${err.message}`);
    }
};

const removeLike = async (submissionId, likeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.submissions).updateOne(
                { _id: await mongoUtil.ObjectId(submissionId) },
                { $pull: { likeIds: likeId } },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing like from submission:: ${err.message}`);
    }
};

const addComment = async (submissionId, commentId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.comments).updateOne(
                { _id: await mongoUtil.ObjectId(submissionId) },
                { $pull: { commentIds: commentId } },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error adding comment to submission:: ${err.message}`);
    }
};

const removeComment = async (submissionId, commentId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.submissions).updateOne(
                { _id: await mongoUtil.ObjectId(submissionId) },
                { $push: { commentIds: commentId } },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing comment from submission:: ${err.message}`);
    }
};

/**
 * @function getSubmission
 * @param {String} eventId 
 * @param {String} submissionId 
 * @returns {Object} submission object
 */
const getSubmission = async (eventId, submissionId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const doc = await client.db(config.database.name)
            .collection(config.database.collections.submissions)
            .findOne({
                _id: await mongoUtil.ObjectId(submissionId),
                eventId: await mongoUtil.ObjectId(eventId),
            });
        await mongoUtil.closeClient(client);
        return doc;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting submission:: ${err.message}`);
    }
};

const getSubmissions = async (submissionIds) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const doc = await client.db(config.database.name)
            .collection(config.database.collections.submissions)
            .find({ _id: { $in: submissionIds } }).toArray();
        await mongoUtil.closeClient(client);
        return doc;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting submissions:: ${err.message}`);
    }
};

const getSubmissionsDump = async () => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const docs = await client.db(config.database.name)
            .collection(config.database.collections.submissions).find({}).toArray();
        await mongoUtil.closeClient(client);
        return docs;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting submission data:: ${err.message}`);
    }
};

const updateSubmissionData = async (submissionId, setOptions) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.submissions).updateOne(
            { _id: await mongoUtil.ObjectId(submissionId) },
            { $set: setOptions },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating submission:: ${err.message}`);
    }
};

const addSubmissionUserSubmissionLinkId = async (submissionId, userSubmissionLinkId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.submissions).updateOne(
            { _id: await mongoUtil.ObjectId(submissionId) },
            { $addToSet: { userSubmissionLinkIds: userSubmissionLinkId } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating submission:: ${err.message}`);
    }
};

const removeSubmissionUserSubmissionLinkId = async (submissionId, userSubmissionLinkId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.submissions).updateOne(
            { _id: await mongoUtil.ObjectId(submissionId) },
            { $pull: { userSubmissionLinkIds: userSubmissionLinkId } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating submission:: ${err.message}`);
    }
};

const addSubmissionAccoladeId = async (submissionId, accoladeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.submissions).updateOne(
            { _id: await mongoUtil.ObjectId(submissionId) },
            { $addToSet: { accoladeIds: await mongoUtil.ObjectId(accoladeId) } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating submission:: ${err.message}`);
    }
};

const removeSubmissionAccoladeId = async (submissionId, accoladeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.submissions)
            .updateOne(
                { _id: await mongoUtil.ObjectId(submissionId) },
                { $pull: { 'accoladeIds': await mongoUtil.ObjectId(accoladeId) } },
            );
        logger.info(upsertedId);
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating submission:: ${err.message}`);
    }
};

/**
 * @function getAllSubmissionsByEventId
 * @param {String} eventId 
 * @returns {Array<Object>} array of submission docs 
 */
const getAllSubmissionsByEventId = async (eventId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const docs = await client.db(config.database.name)
            .collection(config.database.collections.submissions)
            .find({ eventId: await mongoUtil.ObjectId(eventId) }).toArray();
        await mongoUtil.closeClient(client);
        return docs;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting all event submissions ${err.message}`);
    }
};

/**
 * @function editSubmissionFile
 * @description add a file url & key after s3 bucket upload
 * @param {String} eventId
 * @param {String} submissionId 
 * @param {String} type 
 * @param {String} url 
 * @param {String} key 
 */
const editSubmissionFile = async (eventId, submissionId, type, url, key) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        if (type === config.submission_constraints.submission_upload_types.icon) {
            await client.db(config.database.name)
                .collection(config.database.collections.submissions)
                .updateOne(
                    {
                        _id: await mongoUtil.ObjectId(submissionId),
                        eventId: await mongoUtil.ObjectId(eventId),
                    },
                    { $set: 
                        {
                            icon: url,
                            iconKey: key,
                        }
                    },
                );
        } else if (type === config.submission_constraints.submission_upload_types.markdown) {
            await client.db(config.database.name)
                .collection(config.database.collections.submissions)
                .updateOne(
                    {
                        _id: await mongoUtil.ObjectId(submissionId),
                        eventId: await mongoUtil.ObjectId(eventId),
                    },
                    { $set: 
                        {
                            markdown: url,
                            markdownKey: key,
                        }
                    },
                );
        } else if (type === config.submission_constraints.submission_upload_types.sourceCode) {
            await client.db(config.database.name)
                .collection(config.database.collections.submissions)
                .updateOne(
                    {
                        _id: await mongoUtil.ObjectId(submissionId),
                        eventId: await mongoUtil.ObjectId(eventId),
                    },
                    { $set: 
                        {
                            sourceCode: url,
                            sourceCodeKey: key,
                        }
                    },
                );
        }
        await mongoUtil.closeClient(client);
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting editing submission file ${err.message}`);
    }
};

const editSubmissionPhoto = async (eventId, submissionId, index, data) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const prop = `photos.${index}`;
        const docs = await client.db(config.database.name)
            .collection(config.database.collections.submissions)
            .updateOne({
                _id: await mongoUtil.ObjectId(submissionId),
                eventId: await mongoUtil.ObjectId(eventId),
            }, { $set: { [prop]: [data.Key, data.Location] },
            });
        await mongoUtil.closeClient(client);
        logger.info(JSON.stringify(docs));
        return docs;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting all event submissions ${err.message}`);
    }
};

module.exports = {
    submission,
    createSubmission,
    addSubmission,
    removeSubmission,
    addLike,
    removeLike,
    addComment,
    removeComment,
    getSubmission,
    getSubmissions,
    getSubmissionsDump,
    updateSubmissionData,
    getAllSubmissionsByEventId,
    addSubmissionAccoladeId,
    removeSubmissionAccoladeId,
    addSubmissionUserSubmissionLinkId,
    removeSubmissionUserSubmissionLinkId,
    editSubmissionFile,
    editSubmissionPhoto,
};
