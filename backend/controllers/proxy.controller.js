const axios = require('axios');
const logger = require('../utils/logger');
const { s3, bucketName } = require('../config/storage');
const { GetObjectCommand } = require('@aws-sdk/client-s3');

exports.streamAudio = async (req, res, next) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ message: 'URL parameter is required' });
    }

    try {
        // Check if it's a MinIO/S3 URL by checking for bucket name
        // This is a heuristic; robust solution would parse env vars, but bucket name is reliable enough here.
        if (url.includes(`/${bucketName}/`)) {
            // Extract Key
            // URL: http://ip:port/bucketName/key...
            const parts = url.split(`/${bucketName}/`);
            if (parts.length > 1) {
                const key = decodeURIComponent(parts[1]); // Ensure spaces/special chars are handled

                const command = new GetObjectCommand({
                    Bucket: bucketName,
                    Key: key
                });

                const response = await s3.send(command);

                // Set headers
                if (response.ContentType) res.set('Content-Type', response.ContentType);
                if (response.ContentLength) res.set('Content-Length', response.ContentLength);
                res.set('Access-Control-Allow-Origin', '*');

                // Stream the body
                // response.Body in v3 is a readable stream (Node.js)
                response.Body.pipe(res);
                return;
            }
        }

        // Fallback to Axios for external URLs or if parsing failed
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });

        res.set('Content-Type', response.headers['content-type']);
        res.set('Content-Length', response.headers['content-length']);
        res.set('Access-Control-Allow-Origin', '*');

        response.data.pipe(res);

    } catch (err) {
        logger.error(`Error streaming audio: ${err.message}`);
        if (!res.headersSent) {
            // Check for specific S3 errors
            if (err.Code === 'NoSuchKey') {
                res.status(404).json({ message: 'Audio file not found in storage' });
            } else if (err.Code === 'AccessDenied') {
                res.status(403).json({ message: 'Access denied to audio file' });
            } else {
                res.status(502).json({ message: 'Bad Gateway: Could not stream audio' });
            }
        }
    }
};
