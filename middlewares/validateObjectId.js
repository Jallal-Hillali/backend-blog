const mongose = require('mongoose');

module.exports = (req, res, next) => {
    if (!mongose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid ID" });
    }
    next();
}