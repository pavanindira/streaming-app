const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { s3, bucketName } = require('../config/storage');
const multerS3 = require('multer-s3');

const storage = multerS3({
    s3: s3,
    bucket: bucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');

        let folder = 'others';
        if (file.fieldname === 'file') {
            folder = 'songs';
        } else if (file.fieldname === 'cover_image') {
            folder = 'covers';
        }

        cb(null, `${folder}/${name}-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'file') {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed for songs!'), false);
        }
    } else if (file.fieldname === 'cover_image') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for covers!'), false);
        }
    } else {
        cb(new Error('Unexpected field'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

module.exports = upload;
