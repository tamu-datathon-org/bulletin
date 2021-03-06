const logger = require('../utils/logger');
const config = require('../utils/config');
let adminService = require('../services/admin');
let eventsService = require('../services/events');

const validateAddEvent = (requestBody) => {
    const { name } = requestBody;
    const { description } = requestBody;
    const { start_time } = requestBody;
    const { end_time } = requestBody;
    const show = requestBody.show || true;
    if ((name?.length ?? 0) === 0 || typeof name !== 'string') throw new Error('📌name is a required field');
    if ((description?.length ?? 0) === 0 || typeof description !== 'string') throw new Error('📌description is a required field');
    if ((start_time?.length ?? 0) === 0 || typeof start_time !== 'string') throw new Error('📌start_time is a required field');
    if ((end_time?.length ?? 0) === 0 || typeof end_time !== 'string') throw new Error('📌end_time is a required field');
    if ((new Date(start_time)).getTime() > (new Date(end_time)).getTime()) throw new Error('📌invalid start_time & end_time fields');
    if (typeof show !== 'boolean') throw new Error('📌show must be a boolean');
};

const validateAddAccolade = async (eventId, requestBody) => {
    const { name } = requestBody;
    const { description } = requestBody;
    const { challengeId } = requestBody;
    const { emoji } = requestBody;
    if ((eventId?.length ?? 0) === 0 || typeof eventId !== 'string') throw new Error('📌eventId is a required parameter');
    if ((name?.length ?? 0) === 0 || typeof name !== 'string') throw new Error('📌name is a required field');
    if (description && typeof description !== 'string') throw new Error('📌description must be a string');
    if (challengeId && typeof challengeId !== 'string') throw new Error('📌challengeId must be a string');
    if (emoji && typeof emoji !== 'string') throw new Error('📌emoji must be a string');
};

const validateAddChallenge = async (eventId, requestBody) => {
    const { name } = requestBody;
    const { description } = requestBody;
    if ((eventId?.length ?? 0) === 0 || typeof eventId !== 'string') throw new Error('📌eventId is a required parameter');
    if ((name?.length ?? 0) === 0 || typeof name !== 'string') throw new Error('📌name is a required field');
    if (description && typeof description !== 'string') throw new Error('📌description must be a string');
};

// ======================================================= //
// ======== 📌📌📌 Accolades Section 📌📌📌 =========== //
// ======================================================= //

const addAccolade = async (req, res) => {
    const response = {};
    try {
        const { eventId } = req.params;
        const { _id } = req.body;
        const { name } = req.body;
        const { description } = req.body;
        const { emoji } = req.body;
        const { challengeId } = req.body;
        await validateAddAccolade(eventId, req.body);
        response.accoladeId = await adminService.addAccolade(eventId, name, description, emoji, challengeId, _id);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const removeAccolade = async (req, res) => {
    const response = {};
    try {
        const { eventId } = req.params;
        const { accoladeId } = req.params;
        if ((eventId?.length ?? 0) === 0 || typeof eventId !== 'string') throw new Error('📌eventId is a required parameter');
        if ((accoladeId?.length ?? 0) === 0 || typeof eventId !== 'string') throw new Error('📌accoladeId is a required parameter');
        response.accoladeId = await adminService.removeAccolade(eventId, accoladeId);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

// ==================================================== //
// ======== 📌📌📌 Events Section 📌📌📌 =========== //
// ==================================================== //

const addEvent = async (req, res) => {
    const response = {};
    try {
        const { _id } = req.body;
        const { name } = req.body;
        const { description } = req.body;
        const { start_time } = req.body;
        const { end_time } = req.body;
        const { show } = req.body;
        const { challengeIds } = req.body;
        const { accoladeIds } = req.body;
        const { submissionIds } = req.body;
        await validateAddEvent(req.body);
        response.eventId = await adminService.addEvent(name, description, start_time, end_time, show, challengeIds, accoladeIds, submissionIds, _id);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const removeEvent = async (req, res) => {
    const response = {};
    try {
        const { eventId } = req.params;
        if ((eventId?.length ?? 0) === 0 || typeof eventId !== 'string') throw new Error('📌eventId is a required parameter');
        response.eventId = await adminService.removeEvent(eventId);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

// ======================================================== //
// ======== 📌📌📌 Challenges Section 📌📌📌 =========== //
// ======================================================== //

const addChallenge = async (req, res) => {
    const response = {};
    try {
        const { eventId } = req.params;
        const { _id } = req.body;
        const { name } = req.body;
        const { places } = req.body;
        const { question1 } = req.body;
        const { question2 } = req.body;
        const { question3 } = req.body;
        const { question4 } = req.body;
        const { question5 } = req.body;
        await validateAddChallenge(eventId, req.body);
        let numPlaces = null;
        if (places) {
            numPlaces = typeof places === 'number' ? places : parseInt(places);
            if (isNaN(numPlaces)) throw new Error('📌places must be a number');
            if (numPlaces > config.challenges.max_places || numPlaces < 0) {
                throw new Error(`📌places must be <= ${config.challenges.max_places} and > 0`);
            }
        }
        response.challengeId = await adminService.addChallenge(eventId, name, numPlaces, _id, 
            question1, question2, question3, question4, question5);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const removeChallenge = async (req, res) => {
    const response = {};
    try {
        const { eventId } = req.params;
        const { challengeId } = req.params;
        if ((eventId?.length ?? 0) === 0 || typeof eventId !== 'string') throw new Error('📌eventId is a required parameter');
        if ((challengeId?.length ?? 0) === 0 || typeof challengeId !== 'string') throw new Error('📌challengeId is a required parameter');
        response.challengeId = await adminService.removeChallenge(eventId, challengeId);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

// ======================================================== //
// =========== 📌📌📌 Files Section 📌📌📌 ============= //
// ======================================================== //

const uploadEventImage = async (req, res) => {
    const response = {};
    try {
        const { eventId } = req.params;
        const { buffer } = req.file;
        const { originalname } = req.file;
        if (!eventId || typeof eventId !== 'string') throw new Error('📌eventId is a required parameter');
        if (!originalname || typeof originalname !== 'string') throw new Error('📌originalname is a required field');
        response.location = await adminService.uploadEventImage(eventId, originalname, buffer);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const uploadChallengeImage = async (req, res) => {
    const response = {};
    try {
        const { eventId } = req.params;
        const { challengeId } = req.params;
        const { buffer } = req.file;
        const { originalname } = req.file;
        if (!eventId || typeof eventId !== 'string') throw new Error('📌eventId is a required parameter');
        if (!challengeId || typeof challengeId !== 'string') throw new Error('📌challengeId is a required parameter');
        if (!originalname || typeof originalname !== 'string') throw new Error('📌originalname is a required field');
        response.location = await adminService.uploadChallengeImage(eventId, challengeId, originalname, buffer);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

// ======================================================== //
// === 📌📌📌 Altering Submissions Section 📌📌📌 ====== //
// ======================================================== //

/**
 * @function removeSubmission
 * @param {Object} req 
 * @param {Object} res 
 */

const removeSubmission = async (req, res) => {
    const response = {};
    try {
        const { eventId } = req.params;
        const { submissionId } = req.params;
        if ((eventId?.length ?? 0) === 0 || typeof eventId !== 'string') throw new Error('📌eventId is a required parameter');
        if ((submissionId?.length ?? 0) === 0 || typeof eventId !== 'string') throw new Error('📌submissionId is a required parameter');
        response.submissionId = await adminService.removeSubmission(eventId, submissionId);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const addAccoladesToSubmission = async (req, res) => {
    const response = {};
    try {
        const { accoladeIds } = req.body;
        const { submissionId } = req.params;
        const { eventId } = req.params;
        response.submissionId = await adminService.addAccoladesToSubmission(eventId, submissionId, accoladeIds);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

// ======================================================== //
// =========== 📌📌📌 Gavel Section 📌📌📌 ============= //
// ======================================================== //

const downloadSubmissions = async (req, res) => {
    const response = {};
    const { eventId } = req.params;
    try {
        if ((eventId?.length ?? 0) === 0 || typeof eventId !== 'string')
            throw new Error('📌eventId is a required parameter');
        
        const eventObj = await eventsService.getEvent(eventId, false);
        if (!eventObj)
            throw new Error(`📌event ${eventId} does not exist`);

        const fileName = `${eventObj.name}_submission_dump.csv`;
        logger.info('downloading making query to get all submissions...');
        const readStream = await adminService.downloadSubmissions(eventId);
        logger.info('sending data to csv download...');
        res.set('Content-disposition', 'attachment; filename=' + fileName);
        res.set('Content-Type', 'text/plain');
        readStream.pipe(res);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

/* for testing only */

const setAdminService = (testAdminService) => {
    adminService = testAdminService;
};

const setEventsService = (testEventsService) => {
    eventsService = testEventsService;
};

module.exports = {
    addAccolade,
    removeAccolade,
    addEvent,
    removeEvent,
    addChallenge,
    removeChallenge,
    uploadEventImage,
    uploadChallengeImage,
    removeSubmission,
    addAccoladesToSubmission,
    downloadSubmissions,
    // testing
    setAdminService,
    setEventsService,
};
