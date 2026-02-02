const redis = require('redis');

(async () => {
    const client = redis.createClient({
        url: 'redis://localhost:6379'
    });

    client.on('error', (err) => console.log('Redis Client Error', err));

    try {
        await client.connect();
        console.log('Successfully connected to Redis!');
        await client.set('test_key', 'Hello Redis');
        const value = await client.get('test_key');
        console.log('Test Key Value:', value);
        await client.disconnect();
    } catch (err) {
        console.error('Failed to connect:', err);
    }
})();
