const fs = require('fs');
const path = require('path');
const { Song, Sequelize } = require('../models');
const { s3, bucketName } = require('../config/storage');
const { Upload } = require('@aws-sdk/lib-storage');
require('dotenv').config();

const UPLOADS_DIR = path.join(__dirname, '../public/uploads');

const uploadToS3 = async (filePath, key, mimeType) => {
    try {
        const fileStream = fs.createReadStream(filePath);
        const upload = new Upload({
            client: s3,
            params: {
                Bucket: bucketName,
                Key: key,
                Body: fileStream,
                ContentType: mimeType,
            },
        });
        await upload.done();
        return `${process.env.MINIO_ENDPOINT}/${bucketName}/${key}`;
    } catch (error) {
        console.error(`Failed to upload ${key}:`, error.message);
        throw error;
    }
};

const migrate = async () => {
    console.log('Starting migration to MinIO...');

    try {
        const songs = await Song.findAll();
        console.log(`Found ${songs.length} songs to check.`);

        for (const song of songs) {
            let updated = false;

            // Migrate Song File
            if (song.file_url && song.file_url.includes('/uploads/songs/')) {
                const filename = song.file_url.split('/').pop();
                const localPath = path.join(UPLOADS_DIR, 'songs', filename);

                if (fs.existsSync(localPath)) {
                    console.log(`Migrating song file: ${filename}`);
                    const key = `songs/${filename}`;
                    const s3Url = await uploadToS3(localPath, key, 'audio/mpeg'); // Assuming mp3/audio usually
                    song.file_url = s3Url;
                    updated = true;
                } else {
                    console.warn(`Local file not found for song ${song.id}: ${localPath}`);
                }
            }

            // Migrate Cover Image
            if (song.cover_image_url && song.cover_image_url.includes('/uploads/covers/')) {
                const filename = song.cover_image_url.split('/').pop();
                const localPath = path.join(UPLOADS_DIR, 'covers', filename);

                if (fs.existsSync(localPath)) {
                    console.log(`Migrating cover image: ${filename}`);
                    const key = `covers/${filename}`;
                    const s3Url = await uploadToS3(localPath, key, 'image/jpeg'); // Assuming image
                    song.cover_image_url = s3Url;
                    updated = true;
                } else {
                    console.warn(`Local file not found for cover ${song.id}: ${localPath}`);
                }
            }

            if (updated) {
                await song.save();
                console.log(`Updated song record: ${song.title}`);
            }
        }

        console.log('Migration completed.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
};

migrate();
