import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import { authenticate } from '../middleware/auth.js';
import { readStore, writeStore } from '../utils/store.js';

const router = Router();
router.use(authenticate);

router.post('/', async (req, res) => {
  const eventId = String(req.body.eventId || '');
  const quantity = Number(req.body.quantity || 1);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) return res.status(400).json({ message: 'Choose between 1 and 10 tickets.' });
  const events = await readStore('events.json');
  const event = events.find(e => e.id === eventId);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  if (new Date(`${event.date}T${event.time || '23:59'}:00`) < new Date()) return res.status(400).json({ message: 'This event has already passed.' });
  if (event.capacity - event.sold < quantity) return res.status(409).json({ message: 'Not enough tickets are available.' });
  event.sold += quantity;
  await writeStore('events.json', events);
  const bookings = await readStore('bookings.json');
  const booking = { id: `bkg-${Date.now()}`, reference: randomBytes(4).toString('hex').toUpperCase(), userId: req.user.id, eventId, quantity, total: event.price * quantity, status: 'confirmed', createdAt: new Date().toISOString() };
  bookings.push(booking);
  await writeStore('bookings.json', bookings);
  res.status(201).json({ booking, event });
});

router.get('/my', async (req, res) => {
  const [bookings, events] = await Promise.all([readStore('bookings.json'), readStore('events.json')]);
  const mine = bookings.filter(b => b.userId === req.user.id).map(b => ({ ...b, event: events.find(e => e.id === b.eventId) || null })).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ bookings: mine });
});

router.get('/:id', async (req, res) => {
  const bookings = await readStore('bookings.json');
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  if (booking.userId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'You cannot view this booking.' });
  const events = await readStore('events.json');
  res.json({ booking: { ...booking, event: events.find(e => e.id === booking.eventId) || null } });
});

export default router;
