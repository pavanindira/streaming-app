const express = require('express');
const router = express.Router();
const proxyController = require('../controllers/proxy.controller');

router.get('/', proxyController.streamAudio);

module.exports = router;
