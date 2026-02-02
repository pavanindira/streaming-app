const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./models');
const { User } = db;

const createAdmin = async () => {
    try {
        console.log('Connecting to database...');
        await db.sequelize.authenticate();
        console.log('Authentication successful.');

        // Verify connection by syncing (alter: true is safer than force: true)
        // actually we don't even need to sync if tables exist, but let's be safe without wiping
        // await db.sequelize.sync({ alter: false }); 

        const [admin, created] = await User.findOrCreate({
            where: { email: 'admin@music.com' },
            defaults: {
                username: 'admin',
                name: 'System Admin',
                password_hash: 'admin123', // Model hook will hash this
                role: 'admin',
                email: 'admin@music.com',
                bio: 'Default system administrator',
                profile_picture_url: 'https://cdn-icons-png.flaticon.com/512/2942/2942813.png'
            }
        });

        if (created) {
            console.log('✅ Admin user created successfully.');
            console.log('Email: admin@music.com');
            console.log('Password: admin123');
        } else {
            console.log('ℹ️ Admin user already exists.');
            // Optional: Update role to ensure they remain admin if changed manually
            if (admin.role !== 'admin') {
                admin.role = 'admin';
                await admin.save();
                console.log('🔄 Updated user role to admin.');
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:');
        console.error(error);
        process.exit(1);
    }
};

createAdmin();
