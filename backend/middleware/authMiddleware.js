const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {

    const authHeader =
        req.headers.authorization;

    if (!authHeader) {

        return res.status(401).json({

            message:
                'Token requerido'
        });
    }

    // QUITAR "Bearer "
    const token =
        authHeader.startsWith('Bearer ')

        ? authHeader.slice(7)

        : authHeader;

    try {

        const verified =
            jwt.verify(
                token,
                'SECRET_KEY_TECHNOVA'
            );

        req.user = verified;

        next();

    } catch (error) {

        return res.status(403).json({

            message:
                'Token inválido'
        });
    }
};

module.exports = verifyToken;