
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/role');

// User Management Routes
router.get('/', auth, userController.getUsers);
router.get('/:id', auth, userController.getUserById);
router.put('/:id', auth, role(['admin', 'super_admin']), userController.updateUser);
router.delete('/:id', auth, role(['admin', 'super_admin']), userController.deleteUser);

module.exports = router;
