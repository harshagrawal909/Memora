const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const crypto = require('crypto');
const { deleteFile } = require('../utils/r2');
const nodemailer = require('nodemailer');
const {OAuth2Client} = require("google-auth-library")
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const cloudinary = require('cloudinary').v2;


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    host: 'smtp.gmail.com', 
    port: 465,              
    secure: true,
    debug: true,
    logger: true
});

exports.signup = async (req, res) => {
    const { name, email, password } = req.body;
    const verificationToken = crypto.randomBytes(32).toString('hex');
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            "INSERT INTO users (name, email, password,is_verified,verification_token) VALUES ($1, $2, $3, $4, $5)",
            [name, email, hashedPassword,false,verificationToken]
        );
        const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify your Memora Account',
            html: `
                <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f6f8fa; padding: 24px;">
                    <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; padding: 32px; border-radius: 8px;">
                    
                    <h2 style="color: #171A1F; margin-bottom: 16px;">
                        Welcome to Memora 👋
                    </h2>

                    <p style="color: #565D6D; font-size: 14px; line-height: 1.6;">
                        Thanks for signing up for <strong>Memora</strong>.
                        To keep your memories private and secure, please verify your email address.
                    </p>

                    <div style="text-align: center; margin: 32px 0;">
                        <a 
                        href="${verificationUrl}"
                        style="
                            display: inline-block;
                            padding: 12px 24px;
                            background-color: #7FAE96;
                            color: #ffffff;
                            text-decoration: none;
                            font-weight: 600;
                            border-radius: 6px;
                            font-size: 14px;
                        "
                        >
                            Verify Email Address
                        </a>
                    </div>

                    <p style="color: #565D6D; font-size: 13px; line-height: 1.6;">
                        This verification link will expire shortly.
                        If you did not create a Memora account, you can safely ignore this email.
                    </p>

                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

                    <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
                        © ${new Date().getFullYear()} Memora  
                        <br />
                        This is an automated message — please do not reply.
                    </p>

                    </div>
                </div>
            `
        });
        res.status(201).json({ message: "Signup successful! Check your email to verify account." });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(400).json({ message: "Email already registered" });
        }
        res.status(500).json({ message: "Server error during signup" });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.status(404).json("User not found");

        if (!user.rows[0].is_verified) {
            return res.status(403).json({ message: "Please verify your email first." });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) return res.status(400).json("Invalid password");

        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET);
        res.json({ token, user: { name: user.rows[0].name, email: user.rows[0].email } });
    } catch (err) {
        res.status(500).send("Server error");
    }
};

exports.verify = async (req, res) => {
    const {token} =req.query;
    try{
        const result=await pool.query(
            "UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = $1 RETURNING id,name,email",
            [token]
        )

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        const user = result.rows[0];

        await transporter.sendMail({
            from: `"Memora Team" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Welcome to Memora!',
            html: `
                <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f6f8fa; padding: 24px;">
                    <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; padding: 32px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    
                    <h2 style="color: #171A1F; margin-bottom: 12px;">
                        Hi ${user.name}, Welcome to Memora 💚
                    </h2>

                    <p style="color: #565D6D; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
                        Thank you for verifying your email and trusting <strong>Memora</strong>.
                        We’re glad to have you here.
                    </p>

                    <p style="color: #565D6D; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
                        Memora is built with one core belief:
                        <strong>your memories are personal and private</strong>.
                    </p>

                    <ul style="color: #565D6D; font-size: 14px; line-height: 1.6; padding-left: 18px; margin-bottom: 20px;">
                        <li>Your memories are private by default</li>
                        <li>We don’t read, analyze, or sell your content</li>
                        <li>You stay in control of what you store</li>
                    </ul>

                    <p style="color: #565D6D; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                        You can now log in and start creating your own private space.
                    </p>

                    <div style="text-align: center; margin-bottom: 28px;">
                        <a
                            href="${process.env.FRONTEND_URL}/login"
                        style="
                            display: inline-block;
                            padding: 12px 24px;
                            background-color: #7FAE96;
                            color: #ffffff;
                            text-decoration: none;
                            font-weight: 600;
                            border-radius: 6px;
                            font-size: 14px;
                        "
                        >
                            Log in to Memora
                        </a>
                    </div>

                    <p style="color: #9CA3AF; font-size: 12px; line-height: 1.5; text-align: center;">
                        You can review our privacy and usage details anytime inside the app.
                    </p>

                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

                    <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
                        © ${new Date().getFullYear()} Memora  
                        <br />
                        This is an automated message — please do not reply.
                    </p>

                    </div>
                </div>
            `
        });

        res.json({ message: "Email verified successfully! You can now log in." });
    }catch{
        res.status(500).json({ message: "Verification server error" });
    }
};

exports.socialLogin = async (req, res) => {
    const { token, provider } = req.body;

    try {
        let email, name, temp_avatar_url;

        if (provider === 'google') {
            console.log("Verifying Google token...");
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();

            email = payload.email;
            name = payload.name;
            temp_avatar_url = payload.picture;
        } 

        const userExists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        const isNewUser = userExists.rows.length === 0;

        let finalAvatarUrl = temp_avatar_url;
        try {
            if (temp_avatar_url) {
                const uploadResponse = await cloudinary.uploader.upload(temp_avatar_url, {
                    folder: 'memora_avatars',
                });
                finalAvatarUrl = uploadResponse.secure_url;
            }
        } catch (cloudinaryErr) {
            console.error("Cloudinary upload failed, continuing with default:", cloudinaryErr);
        }

        const result = await pool.query(
            "INSERT INTO users (name, email, avatar_url, is_verified) VALUES ($1, $2, $3, true) ON CONFLICT (email) DO UPDATE SET avatar_url = EXCLUDED.avatar_url, name=EXCLUDED.name RETURNING id,name,email,avatar_url,xmax",
            [name, email, finalAvatarUrl]
        );
        const user = result.rows[0];

        console.log("Google Login:", {
            email,
            isNewUser
        });
        if (isNewUser) {

            try {
                await transporter.sendMail({
                    from: `"Memora Team" <${process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: 'Welcome to Memora!',
                    html: `
                        <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f6f8fa; padding: 24px;">
                            <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; padding: 32px; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <h2 style="color: #171A1F; margin-bottom: 12px;">Hi ${user.name}, Welcome to Memora 💚</h2>
                            <p style="color: #565D6D; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
                                Thank you for joining <strong>Memora</strong> via ${provider}. We’re glad to have you here.
                            </p>
                            <p style="color: #565D6D; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
                                Your memories are personal and private. We don’t read, analyze, or sell your content.
                            </p>
                            <div style="text-align: center; margin-top: 28px;">
                                <a href="http://localhost:3000/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #7FAE96; color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 6px; font-size: 14px;">
                                    Start Capturing Memories
                                </a>
                            </div>
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                            <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
                                © ${new Date().getFullYear()} Memora
                            </p>
                            </div>
                        </div>
                    `
                });
                console.log("Welcome email sent successfully");
            } catch (mailError) {
                console.error("Failed to send welcome email:", mailError);
            }
        }

        const memoraToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({ token: memoraToken, user: { name: user.name, email: user.email, avatar: user.avatar_url } });
    } catch (err) {
        console.error("Google Auth Error:", err.message); 
        res.status(401).json({ message: "Social authentication failed", error: err.message });
    }
};

exports.getProfile = async(req,res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, email, avatar_url, password FROM users WHERE id = $1",
            [req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });
        const user = result.rows[0];
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar_url,
            hasPassword: user.password !== null 
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

exports.updateName = async (req, res) => {
    const { name } = req.body;
    try {
        await pool.query("UPDATE users SET name = $1 WHERE id = $2", [name, req.user.id]);
        res.json({ message: "Name updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to update name" });
    }
};

exports.updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await pool.query("SELECT password FROM users WHERE id = $1", [req.user.id]);
        
        if (!user.rows[0].password) {
            return res.status(400).json({ message: "Google users cannot change password here" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.rows[0].password);
        if (!isMatch) return res.status(400).json({ message: "Invalid current password" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, req.user.id]);
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating password" });
    }
};

exports.updateAvatar = async(req,res)=>{
    if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
    }
    try {
        const userId=req.user.id;
        const uploadResponse = await new Promise((resolve,reject)=>{
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder:'memora-avatars',
                    public_id: `user_${userId}_avatar`,
                    overwrite:true
                },
                (error,result)=>{
                    if(error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer)
        })
        const newAvatarUrl = uploadResponse.secure_url;
        const result = await pool.query(
            "UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, name, email, avatar_url",
            [newAvatarUrl, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        const updatedUser = result.rows[0];
        res.json({
            message: "Profile photo updated successfully",
            user: {
                name: updatedUser.name,
                email: updatedUser.email,
                avatar: updatedUser.avatar_url
            }
        });
    } catch (err) {
        console.error("Avatar Update Error:", err);
        res.status(500).json({ message: "Server error updating profile photo" });
    }
}

exports.deleteAccount = async(req,res)=>{
    const userId= req.user.id
    try {
        const userMemories = await pool.query(
            "SELECT r2_key from memories Where user_id = $1",[userId]
        )

        for (const row of userMemories.rows) {
            let keys = [];
            try {
                const parsed = JSON.parse(row.r2_key);
                keys = Array.isArray(parsed) ? parsed : [row.r2_key];
            } catch (e) {
                keys = [row.r2_key];
            }
            await Promise.all(keys.map(key => deleteFile(key)));
        }
        
        const userResult = await pool.query("SELECT avatar_url FROM users WHERE id = $1", [userId]);
        const avatarUrl = userResult.rows[0]?.avatar_url;
        if (avatarUrl && avatarUrl.includes('cloudinary.com')) {
            try {
                const publicId = `memora-avatars/user_${userId}_avatar`; 
                await cloudinary.uploader.destroy(publicId);
            } catch (cloudinaryErr) {
                console.error("Cloudinary deletion failed:", cloudinaryErr);
            }
        }
        await pool.query("DELETE FROM memories WHERE user_id = $1", [userId]);

        const deleteUser = await pool.query("DELETE FROM users WHERE id = $1 Returning *", [userId]);
        if (deleteUser.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Account, memories and all data deleted successfully" });
    } catch (err) {
        console.error("Account Deletion Error:", err);
        res.status(500).json({ message: "Failed to delete account" });
    }
}

exports.forgotPassword = async (req,res) => {
    const {email} = req.body;
    try{
        const user = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User with this email does not exist" });
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000);

        await pool.query(
            "UPDATE users SET verification_token = $1 WHERE email = $2",
            [resetToken, email]
        );

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        await transporter.sendMail({
            from: `"Memora Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Reset your Memora Password',
            html: `
                <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f6f8fa; padding: 24px;">
                    <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; padding: 32px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        
                        <h2 style="color: #171A1F; margin-bottom: 12px;">
                        Reset your password 🔐
                        </h2>

                        <p style="color: #565D6D; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
                            We received a request to reset the password for your <strong>Memora</strong> account.
                        </p>

                        <p style="color: #565D6D; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                            Click the button below to set a new password. This link will expire in <strong>1 hour</strong> for security reasons.
                        </p>

                        <div style="text-align: center; margin-bottom: 28px;">
                            <a
                                href="${resetUrl}"
                                style="
                                display: inline-block;
                                padding: 12px 24px;
                                background-color: #7FAE96;
                                color: #ffffff;
                                text-decoration: none;
                                font-weight: 600;
                                border-radius: 6px;
                                font-size: 14px;
                                "
                            >
                                Reset Password
                            </a>
                        </div>

                        <p style="color: #565D6D; font-size: 13px; line-height: 1.6;">
                            If you did not request a password reset, you can safely ignore this email.
                            Your password will remain unchanged.
                        </p>

                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

                        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
                            © ${new Date().getFullYear()} Memora  
                            <br />
                            This is an automated message — please do not reply.
                        </p>

                    </div>
                </div>
            `
        });

        res.json({ message: "Password reset link sent to your email." });

    }catch(err){
        res.status(500).json({ message: "Error sending reset email" });
    }
}

exports.resetPassword = async(req,res) => {
    const {token, password} =req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            "UPDATE users SET password = $1, verification_token = NULL WHERE verification_token = $2 RETURNING id",
            [hashedPassword, token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        res.json({ message: "Password reset successfully! Redirecting to login..." });
    } catch (err) {
        res.status(500).json({ message: "Error resetting password" });
    }
}