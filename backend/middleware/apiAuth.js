const apiAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ message: 'No API Key provided' });
    }

    if (apiKey !== process.env.ESP32_API_KEY) {
        return res.status(401).json({ message: 'Invalid API Key' });
    }

    next();
};

module.exports = { apiAuth };
