const express = require('express');
const router = express.Router();
const multer = require('multer');
const memoryController = require('../controllers/memoryController');
const auth = require('../middleware/auth'); 

const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } 
});

router.post('/', auth, upload.array('media',10), memoryController.createMemory);
router.get('/', auth, memoryController.getMemories);
router.get('/:id', auth, memoryController.getMemoryById);
router.post("/:id/photos", auth, upload.array("media", 10), memoryController.addPhotosToMemory
);
router.delete("/:id/photos", auth, memoryController.deletePhotoFromMemory);
router.put('/:id', auth, memoryController.updateMemory);
router.delete('/:id', auth, memoryController.deleteMemory);

module.exports = router;