// Temporarily disabled helmet for debugging

const securityMiddleware = (req, res, next) => {
    // Allow all CORS for now
    res.header('Access-Control-Allow-Origin', 'https://ztachat.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
};

export default securityMiddleware;
