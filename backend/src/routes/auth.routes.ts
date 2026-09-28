import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../database/store';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required', code: 'MISSING_CREDENTIALS' });
    }

    const user = Array.from(db.users.values()).find((u: any) => u.email === email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, district: user.district, division: user.division, orgScope: user.orgScope },
      process.env.JWT_SECRET || 'rb_infragov_secret',
      { expiresIn: '24h' }
    );

    // Find employee record
    const employee = Array.from(db.employees.values()).find((e: any) => e.email === email);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
          district: user.district,
          division: user.division,
          orgScope: user.orgScope,
          employeeId: employee?.id,
          designation: employee?.designation,
        },
      },
      message: 'Login successful',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', code: 'SERVER_ERROR' });
  }
});

router.get('/me', (req: any, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'No token', code: 'NO_TOKEN' });
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'rb_infragov_secret');
    const user = db.users.get(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const { password: _, ...safeUser } = user;
    res.json({ success: true, data: safeUser, message: 'User retrieved' });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token', code: 'INVALID_TOKEN' });
  }
});

export default router;
