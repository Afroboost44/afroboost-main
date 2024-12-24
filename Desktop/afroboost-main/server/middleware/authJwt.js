const jwt = require("jsonwebtoken");
var secret = "E9A6CA5C98ADC60C80EEE0E2A0069BF920FBB3C6ABE8C82EF3178F842323460D";

verifyToken = (req, res, next) => {
    let token = req.headers.authorization;

    if (!token) {
        return res.status(403).send({
            message: "No token provided!"
        });
    }

    token = token.split(' ')[1];

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                message: "Unauthorized! Invalid token"
            });
        }
        req.userId = decoded.id;
        req.role = decoded.role;
        next();
    });
};

const authJwt = {
  verifyToken: verifyToken
};
module.exports = authJwt;