const { S3Client } = require('@aws-sdk/client-s3');
require('dotenv').config();

const storageConfig = {
    region: 'us-east-1', // MinIO requires a region, even if local
    endpoint: process.env.MINIO_ENDPOINT || 'http://127.0.0.1:9000',
    credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    },
    forcePathStyle: true, // Required for MinIO
};

const s3 = new S3Client(storageConfig);

module.exports = { s3, bucketName: process.env.MINIO_BUCKET_NAME || 'music-streaming' };
