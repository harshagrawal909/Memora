const pool = require('../db');
const { uploadFile, generatePresignedUrl,deleteFile } = require('../utils/r2');
const crypto = require('crypto');

exports.createMemory = async (req, res) => {
    const {title,description,date,location,mood,visibility} = req.body;
    const files = req.files;
    const userId = req.user.id; 

    if (!files || files.length === 0) return res.status(400).json({ message: "At least one photo is required" });
    if (!title || !date || !mood || !visibility) {
            return res.status(400).json({ message: "Missing required fields" });
        }

    try {
        const uploadPromises = files.map(async (file) => {
            const fileExtension = file.originalname.split('.').pop();
            const r2Key = `memories/${userId}/${crypto.randomBytes(16).toString('hex')}.${fileExtension}`;
            await uploadFile(file.buffer, r2Key, file.mimetype);
            return r2Key;
        });

        const r2Keys = await Promise.all(uploadPromises);

        const result = await pool.query(
            "INSERT INTO memories (user_id, title, description,memory_date,location,mood, r2_key, media_type,visibility) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
            [userId, title, description || null ,date,location || null ,mood, JSON.stringify(r2Keys), files[0].mimetype, visibility]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Detailed Error:", err);
        res.status(500).json({ message: "Server error creating memory" });
    }
};

exports.getMemories = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            "SELECT * FROM memories WHERE user_id = $1 ORDER BY created_at DESC",
            [userId]
        );

        const memoriesWithUrls = await Promise.all(result.rows.map(async (memory) => {
            let keys = [];
            
            try {
                keys = JSON.parse(memory.r2_key);
                if (!Array.isArray(keys)) keys = [memory.r2_key];
            } catch (e) {
                keys = [memory.r2_key];
            }
            
            const urls = await Promise.all(keys.map(key => generatePresignedUrl(key)));
            
            return { 
                ...memory, 
                media_url: urls[0], 
                all_media_urls: urls 
            };
        }));

        res.json(memoriesWithUrls);
    } catch (err) {
        res.status(500).json({ message: "Error fetching memories" });
    }
};

exports.getMemoryById = async(req,res) => {
    let {id}= req.params;
    const userId= req.user.id;

    try {
        if (typeof id === 'object' && id !== null) {
            id = id.id;
        }
        let idStr = String(id || "");
        if (idStr.startsWith('{')) {
            try {
                const parsedId = JSON.parse(idStr);
                id = parsedId.id;
            } catch (e) {
                console.error("Failed to parse ID string:", e);
            }
        } else {
            id = idStr;
        }
        const result = await pool.query(
            "SELECT * FROM memories WHERE id = $1 AND user_id = $2",
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Memory not found" });
        }

        const memory = result.rows[0];
        let keys = [];

        try {
            const parsed = JSON.parse(memory.r2_key);
            keys = Array.isArray(parsed) ? parsed : [memory.r2_key];
        } catch (e) {
            keys = [memory.r2_key];
        }

        const urls = await Promise.all(keys.map(key => generatePresignedUrl(key)));
        
        res.json({ ...memory, all_media_urls: urls });
        
    } catch (err) {
        console.error("Fetch Detail Error:", err);
        res.status(500).json({ message: "Error fetching memory details" });
    }
}

exports.addPhotosToMemory = async(req,res)=>{
    const {id}= req.params;
    const userId = req.user.id;
    const files=req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({ message: "No photos uploaded" });
    }

    try {
        const result = await pool.query(
            "SELECT r2_key FROM memories WHERE id = $1 AND user_id = $2",
            [id, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Memory not found" });
        }

        const memory = result.rows[0];
        let existingKeys = [];
        try {
            const parsed = JSON.parse(memory.r2_key);
            existingKeys = Array.isArray(parsed) ? parsed : [memory.r2_key];
        } catch (e) {
            existingKeys = [memory.r2_key];
        }

        if (existingKeys.length + files.length > 10) {
            return res.status(400).json({
                message: `You can only have up to 10 photos per memory. Currently: ${existingKeys.length}`
            });
        }

        const newKeys = await Promise.all(
            files.map(async (file) => {
                const ext = file.originalname.split(".").pop();
                const r2Key = `memories/${userId}/${crypto
                    .randomBytes(16)
                    .toString("hex")}.${ext}`;

                await uploadFile(file.buffer, r2Key, file.mimetype);
                return r2Key;
            })
        );

        const updatedKeys = [...existingKeys, ...newKeys];

        await pool.query(
            "UPDATE memories SET r2_key = $1 WHERE id = $2 AND user_id = $3",
            [JSON.stringify(updatedKeys), id, userId]
        );

        res.status(200).json({
            message: "Photos added successfully",
            totalPhotos: updatedKeys.length
        });
    } catch (err) {
        console.error("Add Photos Error:", err);
        res.status(500).json({ message: "Failed to add photos" });
    }
}

exports.deletePhotoFromMemory = async (req, res) => {
    const { id } = req.params;
    const { photoUrl } = req.body;
    const userId = req.user.id;

    try {
        const result = await pool.query(
            "SELECT r2_key FROM memories WHERE id = $1 AND user_id = $2",
            [id, userId]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: "Memory not found" });

        const rawKey = result.rows[0].r2_key;
        let existingKeys = [];

        try {
            const parsed = JSON.parse(rawKey);
            existingKeys = Array.isArray(parsed) ? parsed : [rawKey];
        } catch (e) {
            existingKeys = [rawKey];
        }

        const keyToDelete = existingKeys.find(key => photoUrl.includes(key));
        if (!keyToDelete) {
            return res.status(404).json({ message: "Photo key not found in memory" });
        }

        const updatedKeys = existingKeys.filter(key => key !== keyToDelete);

        if (updatedKeys.length === 0) {
            return res.status(400).json({ message: "A memory must have at least one photo" });
        }

        await deleteFile(keyToDelete);

        await pool.query(
            "UPDATE memories SET r2_key = $1 WHERE id = $2 AND user_id = $3",
            [JSON.stringify(updatedKeys), id, userId]
        );

        res.status(200).json({ message: "Photo removed successfully" });
    } catch (err) {
        console.error("Delete Photo Error:", err);
        res.status(500).json({ message: "Failed to remove photo" });
    }
};

exports.updateMemory = async (req, res) => {
    const { id } = req.params;
    const { title, description, date, location, mood, visibility } = req.body; 
    const userId = req.user.id;

    try {
        const result = await pool.query(
            "UPDATE memories SET title = $1, description = $2, memory_date = $3, location = $4, mood = $5, visibility = $6 WHERE id = $7 AND user_id = $8 RETURNING *",
            [
                title, 
                description || null, 
                date,            
                location || null, 
                mood, 
                visibility, 
                id, 
                userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Memory not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ message: "Server error updating memory" });
    }
};

exports.deleteMemory= async (req,res) => {
    const {id}= req.params;
    const userId= req.user.id;

    try {
        const memoryResult = await pool.query(
            "SELECT r2_key FROM memories WHERE id = $1 AND user_id = $2",
            [id, userId]
        );
        if (memoryResult.rows.length === 0) {
            return res.status(404).json({ message: "Memory not found" });
        }
        const keys = JSON.parse(memoryResult.rows[0].r2_key)
        if (Array.isArray(keys)) {
            await Promise.all(keys.map(key => deleteFile(key)));
        }
        await pool.query(
            "DELETE FROM memories WHERE id = $1 AND user_id = $2",
            [id, userId]
        );
        res.status(200).json({ message: "Memory and associated photos deleted successfully" });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ message: "Server error deleting memory" });
    }
}