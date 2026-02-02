const express = require('express');
const { query } = require('express-validator');
const searchController = require('../controllers/search.controller');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get(
    '/',
    [
        query('q').isString().notEmpty().withMessage('Query cannot be empty')
    ],
    validateRequest,
    searchController.search
);

module.exports = router;
