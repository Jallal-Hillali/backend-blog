const jwt = require('jsonwebtoken');

//verify Token
function verifyToken(req, res, next) {
    const authToken = req.headers.authorization; 
    if (authToken) {
       const token = authToken.split(" ")[1]; // Bearer <token>
       try {
              const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decodedPayload; 
                next();
       } catch (error) {
           return res.status(401).json({ message: "invalid token, access denied" });
        
       }
    } else {
        return res.status(401).json({ message: "no token provided, access denied" });
    }
}

//verify Token & Admin
function verifyTokenAndAdmin(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json({ message: "not allowed , only admin" });
        }
    });
}

//verify Token & Only User Himself
function verifyTokenAndOnlyUser(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id) {
            next();
        } else {
            return res.status(403).json({ message: "not allowed , Only User Himself" });
        }
    });
}

//verify Token & Authorization  
function verifyTokenAuthorization (req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id || req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json({ message: "not allowed , Only User himself or admin" });
        }
    });
}

module.exports = {
    verifyToken,
    verifyTokenAndAdmin,
    verifyTokenAndOnlyUser,
    verifyTokenAuthorization
}