const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.log('No token provided');
        return res.status(401).send('Login first');
    }

    const token = authHeader.split(' ')[1]; // Assume 'Bearer <token>'
    console.log('Token:', token);

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        req.user = decodedToken; // Store the decoded token in req.user
        console.log('Decoded Token:', decodedToken);
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.log('Token expired');
            return res.status(401).send('Unauthorized: Token expired');
        } else {
            console.log('Invalid token');
            return res.status(401).send('Unauthorized: Invalid token');
        }
    }
};

const authorize = (requiredRoles) => {
    return (req, res, next) => {
        console.log('req.user before authorize:', req.user); // Log before authorization

        if (!req.user || !requiredRoles.includes(req.user.role)) {
            console.log('Access denied for role:', req.user ? req.user.role : 'undefined');
            return res.status(403).json({ message: 'Forbidden: Access Denied' });
        }
        
        console.log('Authorization passed for role:', req.user.role);
        next();
    };
};

module.exports = { authenticateUser, authorize };
