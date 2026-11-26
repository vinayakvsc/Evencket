import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readStore, writeStore } from '../utils/store.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const secret = () => process.env.JWT_SECRET || 'development-secret-change-me';
const publicUser = ({ id, name, email, role }) => ({ id, name, email, role });
const makeToken = user => jwt.sign(publicUser(user), secret(), { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (name.length < 2) return res.status(400).json({ message: 'Name must be at least 2 characters.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    const users = await readStore('users.json');
    if (users.some(u => u.email === email)) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = { id: `usr-${Date.now()}`, name, email, passwordHash: await bcrypt.hash(password, 10), role: 'user', createdAt: new Date().toISOString() };
    users.push(user);
    await writeStore('users.json', users);
    res.status(201).json({ token: makeToken(user), user: publicUser(user) });
  } catch { res.status(500).json({ message: 'Could not create your account.' }); }
});

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const users = await readStore('users.json');
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Email or password is incorrect.' });
    res.json({ token: makeToken(user), user: publicUser(user) });
  } catch { res.status(500).json({ message: 'Could not sign you in.' }); }
});

router.get('/me', authenticate, async (req, res) => {
  const users = await readStore('users.json');
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Account not found.' });
  res.json({ user: publicUser(user) });
});

export default router;
