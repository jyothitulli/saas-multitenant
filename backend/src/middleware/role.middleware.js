
// Middleware to restrict routes by user role [cite: 55]
module.exports = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Forbidden: You do not have the required permissions' 
            });
        }
        next();
    };
};
