const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/verify', authController.verify);
router.post('/social-login', authController.socialLogin);
router.get('/profile', auth, authController.getProfile);
router.put('/update-name', auth, authController.updateName);
router.put('/update-password', auth, authController.updatePassword);
router.put('/update-avatar', auth, upload.single('avatar'), authController.updateAvatar);
router.delete('/delete-account',auth,authController.deleteAccount);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;