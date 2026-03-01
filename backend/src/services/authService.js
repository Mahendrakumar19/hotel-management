const pool = require('../database/connection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class AuthService {
  async register(name, email, password, role = 'front_desk') {
    try {
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (existingUser[0].length > 0) {
        throw new Error('Email already registered');
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = uuidv4();

      await pool.query(
        `INSERT INTO users (id, name, email, password_hash, role, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, name, email, passwordHash, role, 'active']
      );

      const result = await pool.query(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [userId]
      );

      return result[0][0];
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = ? AND status = ?',
        [email, 'active']
      );

      if (result[0].length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = result[0][0];
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );

      // Generate token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY }
      );

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async validateToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async getUserById(userId) {
    try {
      const result = await pool.query(
        'SELECT id, name, email, role, status, last_login, created_at FROM users WHERE id = ?',
        [userId]
      );

      if (result[0].length === 0) {
        throw new Error('User not found');
      }

      return result[0][0];
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(userId, oldPassword, newPassword) {
    try {
      const userResult = await pool.query(
        'SELECT password_hash FROM users WHERE id = ?',
        [userId]
      );

      if (userResult[0].length === 0) {
        throw new Error('User not found');
      }

      const isPasswordValid = await bcrypt.compare(
        oldPassword,
        userResult[0][0].password_hash
      );

      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      await pool.query(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newPasswordHash, userId]
      );

      return { message: 'Password updated successfully' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
