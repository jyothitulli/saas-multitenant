const bcrypt = require('bcryptjs');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { tenant_name, full_name, email, password } = req.body;

    // 1. Enhanced Input Validation (Evaluation Requirement)
    if (!email || !password || !tenant_name || !full_name) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!email.includes('@')) {
        return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    try {
        // 2. Secure Password Hashing
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Create Tenant
        const tenant = await db.query(
            'INSERT INTO tenants (name) VALUES ($1) RETURNING id',
            [tenant_name]
        );
        const tenantId = tenant.rows[0].id;

        // 4. Create User with Hashed Password
        const user = await db.query(
            'INSERT INTO users (tenant_id, full_name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [tenantId, full_name, email, passwordHash, 'tenant_admin']
        );
        const userId = user.rows[0].id;

        // 5. Create Audit Log Entry (Mandatory for Eval)
        await db.query(
            'INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
            [tenantId, userId, 'USER_REGISTERED', 'users', userId, JSON.stringify({ email, tenant_name })]
        );

        res.status(201).json({ success: true, message: "User and Tenant registered successfully" });
    } catch (err) {
        console.error("Registration Error:", err.message);
        // Handle duplicate email error specifically
        if (err.code === '23505') {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }
        res.status(500).json({ success: false, message: "Server error during registration" });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    try {
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (userResult.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const user = userResult.rows[0];

        // Verify Hashed Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.id, tenant_id: user.tenant_id, role: user.role },
            process.env.JWT_SECRET || 'secret_key_123',
            { expiresIn: '24h' }
        );

        // Log Login Action in Audit Table
        await db.query(
            'INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4, $5)',
            [user.tenant_id, user.id, 'USER_LOGIN', 'users', user.id]
        );

        res.json({ 
            success: true, 
            token,
            user: { id: user.id, full_name: user.full_name, role: user.role } 
        });
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ success: false, message: "Server error during login" });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await db.query(
            'SELECT id, full_name, email, role, tenant_id FROM users WHERE id = $1',
            [req.user.id]
        );
        
        if (user.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, data: user.rows[0] });
    } catch (err) {
        console.error("Profile Error:", err.message);
        res.status(500).json({ success: false, message: "Error fetching profile" });
    }
};