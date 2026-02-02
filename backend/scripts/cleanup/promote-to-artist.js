const db = require('./models');

const promoteUser = async () => {
    try {
        const user = await db.User.findOne({ order: [['createdAt', 'DESC']] });
        if (!user) {
            console.log('No users found.');
            return;
        }

        user.role = 'artist';
        await user.save();
        console.log(`User ${user.email} promoted to ARTIST.`);
    } catch (error) {
        console.error('Error promoting user:', error);
    } finally {
        await db.sequelize.close();
    }
};

promoteUser();
