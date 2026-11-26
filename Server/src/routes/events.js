import { Router } from 'express';
import { readStore, writeStore } from '../utils/store.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const events = await readStore('events.json');
  const search = String(req.query.search || '').toLowerCase();
  const category = String(req.query.category || '').toLowerCase();
  const filtered = events.filter(e =>
    (!search || [e.title, e.city, e.venue, e.description].some(v => String(v).toLowerCase().includes(search))) &&
    (!category || e.category.toLowerCase() === category)
  ).sort((a, b) => a.date.localeCompare(b.date));
  res.json({ events: filtered });
});

router.get('/:id', async (req, res) => {
  const events = await readStore('events.json');
  const event = events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  res.json({ event });
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { title, category, date, time, venue, city, price, capacity, image, description } = req.body;
  if (!title || !category || !date || !venue || !city || Number(price) < 0 || Number(capacity) < 1) {
    return res.status(400).json({ message: 'Please provide title, category, date, venue, city, price and capacity.' });
  }
  const events = await readStore('events.json');
  const event = { id: `evt-${Date.now()}`, title: String(title).trim(), category, date, time: time || '18:00', venue, city,
    price: Number(price), capacity: Number(capacity), sold: 0, image: image || '', description: description || '' };
  events.push(event);
  await writeStore('events.json', events);
  res.status(201).json({ event });
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const events = await readStore('events.json');
  const index = events.findIndex(e => e.id === req.params.id);
  if (index < 0) return res.status(404).json({ message: 'Event not found.' });
  const allowed = ['title','category','date','time','venue','city','price','capacity','image','description'];
  for (const key of allowed) if (req.body[key] !== undefined) events[index][key] = ['price','capacity'].includes(key) ? Number(req.body[key]) : req.body[key];
  if (events[index].capacity < events[index].sold) return res.status(400).json({ message: 'Capacity cannot be less than tickets already sold.' });
  await writeStore('events.json', events);
  res.json({ event: events[index] });
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  const events = await readStore('events.json');
  const bookings = await readStore('bookings.json');
  if (bookings.some(b => b.eventId === req.params.id)) return res.status(409).json({ message: 'This event has bookings and cannot be deleted.' });
  const next = events.filter(e => e.id !== req.params.id);
  if (next.length === events.length) return res.status(404).json({ message: 'Event not found.' });
  await writeStore('events.json', next);
  res.json({ message: 'Event deleted.' });
});

export default router;
