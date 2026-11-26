import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, MapPin, Search, Ticket, Music2, Menu, X, UserRound, LogOut, CheckCircle2, Clock3, Sparkles, SlidersHorizontal, Plus, Minus, LayoutDashboard } from 'lucide-react';
import { api } from './api';

const categories = ['All events', 'Music', 'Comedy', 'Sports', 'Technology', 'Food'];
const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
const dateLabel = value => new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

function App() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All events');
  const [selected, setSelected] = useState(null);
  const [authMode, setAuthMode] = useState('');
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('evencket_user')); } catch { return null; } });
  const [bookings, setBookings] = useState([]);
  const [showBookings, setShowBookings] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  async function loadEvents() {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (category !== 'All events') params.set('category', category);
      const data = await api(`/events?${params.toString()}`);
      setEvents(data.events);
    } catch (e) { setError(e.message); }
  }
  useEffect(() => { const timer = setTimeout(loadEvents, 180); return () => clearTimeout(timer); }, [search, category]);
  useEffect(() => { if (user) loadBookings(); }, [user]);

  async function loadBookings() {
    try { setBookings((await api('/bookings/my')).bookings); } catch (e) { setError(e.message); }
  }
  function saveSession(data) {
    localStorage.setItem('evencket_token', data.token);
    localStorage.setItem('evencket_user', JSON.stringify(data.user));
    setUser(data.user); setAuthMode(''); setError(''); setNotice(`Welcome, ${data.user.name.split(' ')[0]}!`);
  }
  function logout() {
    localStorage.removeItem('evencket_token'); localStorage.removeItem('evencket_user');
    setUser(null); setBookings([]); setShowBookings(false); setNotice('You have signed out.');
  }
  async function bookEvent() {
    if (!user) { setAuthMode('login'); setSelected(null); return; }
    setLoading(true); setError(''); setNotice('');
    try {
      const data = await api('/bookings', { method: 'POST', body: JSON.stringify({ eventId: selected.id, quantity }) });
      setNotice(`Booking confirmed! Your reference is ${data.booking.reference}.`);
      setSelected(null); setQuantity(1); await loadEvents(); await loadBookings();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const upcoming = useMemo(() => events.filter(e => new Date(`${e.date}T23:59:00`) >= new Date()), [events]);
  const featured = events.find(e => e.id === 'evt-001') || events[0];

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><span className="brand-mark"><Ticket size={19}/></span><span>evencket<span className="brand-dot">.</span></span></a>
      <nav className={mobileMenu ? 'nav-links open' : 'nav-links'}>
        <a href="#discover" onClick={() => setMobileMenu(false)}>Discover</a>
        <a href="#how-it-works" onClick={() => setMobileMenu(false)}>How it works</a>
        {user && <button className="nav-link-button" onClick={() => { setShowBookings(true); setMobileMenu(false); }}>My tickets</button>}
      </nav>
      <div className="top-actions">
        {user ? <div className="user-menu"><span className="avatar">{user.name?.charAt(0).toUpperCase()}</span><span className="user-name">{user.name.split(' ')[0]}</span><button className="icon-button" title="Sign out" onClick={logout}><LogOut size={17}/></button>{user.role === 'admin' && <button className="icon-button" title="Manage events" onClick={() => setShowAdmin(true)}><LayoutDashboard size={17}/></button>}</div> :
          <><button className="btn-ghost" onClick={() => setAuthMode('login')}>Log in</button><button className="btn-primary small" onClick={() => setAuthMode('register')}>Get started <ArrowRight size={15}/></button></>}
      </div>
      <button className="mobile-menu" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X/> : <Menu/>}</button>
    </header>

    {notice && <div className="toast success"><CheckCircle2 size={18}/><span>{notice}</span><button onClick={() => setNotice('')}><X size={16}/></button></div>}
    {error && <div className="toast error"><span>{error}</span><button onClick={() => setError('')}><X size={16}/></button></div>}

    <main>
      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow"><Sparkles size={15}/> MAKE ROOM FOR MEMORIES</div>
          <h1>Life is better<br/> <span>live.</span> Be there.</h1>
          <p>Find your people. Feel the energy. Discover experiences worth talking about long after the lights go down.</p>
          <div className="hero-buttons"><a className="btn-primary" href="#discover">Explore events <ArrowRight size={17}/></a><a className="btn-outline" href="#how-it-works">How it works</a></div>
          <div className="hero-stats"><div><strong>1,200<span>+</span></strong><small>events hosted</small></div><div><strong>50k<span>+</span></strong><small>happy attendees</small></div><div><strong>4.9<span>/5</span></strong><small>community rating</small></div></div>
        </div>
        <div className="hero-visual">
          <div className="hero-glow"></div>
          <img className="hero-image" src={featured?.image || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80'} alt="Crowd enjoying a live event"/>
          <div className="image-shade"></div>
          <div className="floating-tag"><span className="live-dot"></span> THE NEXT BIG THING</div>
          <div className="featured-card"><div><span className="card-kicker">FEATURED EVENT</span><h3>{featured?.title || 'Find your next experience'}</h3><p><CalendarDays size={14}/>{featured ? dateLabel(featured.date) : 'Coming soon'} <span className="separator">·</span><MapPin size={14}/>{featured?.city || 'Near you'}</p></div><button onClick={() => featured && (setSelected(featured), setQuantity(1))} aria-label="View featured event"><ArrowRight/></button></div>
          <div className="ticket-stamp"><Ticket size={22}/><span>YOUR<br/>NEXT STORY</span></div>
        </div>
      </section>

      <section className="trust-strip"><span>GOOD TIMES, GREAT COMPANY</span><div><span>✳ MUSIC</span><span>◉ CULTURE</span><span>⌁ COMMUNITY</span><span>✦ DISCOVERY</span></div></section>

      <section id="discover" className="discover section-wrap">
        <div className="section-heading"><div><div className="eyebrow dark"><span className="eyebrow-line"></span> YOUR NEXT EXPERIENCE</div><h2>Find your <em>thing.</em></h2><p>From front-row moments to hidden gems, your next favourite memory starts here.</p></div><div className="event-count"><strong>{upcoming.length.toString().padStart(2,'0')}</strong><span>events to explore</span></div></div>
        <div className="filter-bar"><div className="search-box"><Search size={19}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events, cities, venues..."/>{search && <button onClick={() => setSearch('')}><X size={15}/></button>}</div><div className="category-scroll"><SlidersHorizontal size={17}/>{categories.map(c => <button key={c} onClick={() => setCategory(c)} className={category === c ? 'category active' : 'category'}>{c}</button>)}</div></div>
        {upcoming.length ? <div className="event-grid">{upcoming.map((event, i) => <EventCard key={event.id} event={event} index={i} onClick={() => { setSelected(event); setQuantity(1); }}/>)}</div> : <div className="empty-state"><Search size={30}/><h3>No events found</h3><p>Try a different search or category.</p><button className="btn-outline dark-outline" onClick={() => {setSearch('');setCategory('All events');}}>Clear filters</button></div>}
      </section>

      <section className="quote-band"><div className="quote-mark">“</div><blockquote>The best nights aren't planned. They're <em>discovered.</em></blockquote><p>Go on. Make a memory.</p><a href="#discover">Find your next event <ArrowRight size={16}/></a></section>

      <section id="how-it-works" className="how section-wrap"><div className="eyebrow dark"><span className="eyebrow-line"></span> EASY AS 1, 2, 3</div><h2>Less scrolling.<br/><em>More living.</em></h2><div className="steps"><div className="step"><span className="step-number">01</span><div className="step-icon"><Search/></div><h3>Find your vibe</h3><p>Browse events by category, date, or city. Your next favourite thing is waiting.</p></div><div className="step"><span className="step-number">02</span><div className="step-icon"><Ticket/></div><h3>Book in seconds</h3><p>Pick your tickets, confirm your booking, and keep your reference safe.</p></div><div className="step"><span className="step-number">03</span><div className="step-icon"><Sparkles/></div><h3>Show up & shine</h3><p>Bring your people, soak it all in, and make a story worth retelling.</p></div></div></section>

      <section className="cta-section"><div><div className="eyebrow"><Sparkles size={15}/> YOUR PEOPLE ARE OUT THERE</div><h2>Make your next<br/><em>memory count.</em></h2><p>Great experiences don't happen on the couch.</p><a href="#discover" className="btn-light">Find your event <ArrowRight size={17}/></a></div><div className="cta-art"><div className="circle circle-one"></div><div className="circle circle-two"></div><div className="cta-ticket"><Ticket size={42}/><span>ADMIT<br/>ONE</span><div className="ticket-dots"></div></div><Sparkles className="sparkle s1"/><Sparkles className="sparkle s2"/></div></section>
    </main>
    <footer><a className="brand footer-brand" href="#"><span className="brand-mark"><Ticket size={19}/></span><span>evencket<span className="brand-dot">.</span></span></a><p>Collect moments, not just tickets.</p><span>© {new Date().getFullYear()} evencket. Made for the moments.</span></footer>

    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="event-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)}><X/></button><img src={selected.image} alt={selected.title}/><div className="modal-content"><span className="pill">{selected.category}</span><h2>{selected.title}</h2><p className="modal-description">{selected.description}</p><div className="detail-row"><CalendarDays/><div><strong>{dateLabel(selected.date)} · {selected.time}</strong><small>Date & time</small></div></div><div className="detail-row"><MapPin/><div><strong>{selected.venue}</strong><small>{selected.city}</small></div></div><div className="detail-row"><Ticket/><div><strong>{Math.max(0, selected.capacity - selected.sold)} tickets left</strong><small>Limited availability</small></div></div><div className="booking-footer"><div><span>Price per ticket</span><strong>{money(selected.price)}</strong></div><div className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}><Minus size={15}/></button><strong>{quantity}</strong><button onClick={() => setQuantity(Math.min(10, quantity + 1, selected.capacity - selected.sold))} disabled={quantity >= 10 || quantity >= selected.capacity - selected.sold}><Plus size={15}/></button></div></div><button className="btn-primary full-width" disabled={loading || selected.capacity <= selected.sold} onClick={bookEvent}>{loading ? 'Confirming...' : `Book ${quantity} ticket${quantity > 1 ? 's' : ''} · ${money(selected.price * quantity)}`}<ArrowRight size={17}/></button><small className="demo-note">Demo checkout — no payment will be taken.</small></div></div></div>}
    {authMode && <AuthModal mode={authMode} setMode={setAuthMode} onClose={() => setAuthMode('')} onSuccess={saveSession}/>}
    {showBookings && <BookingsModal bookings={bookings} onClose={() => setShowBookings(false)}/>}
    {showAdmin && <AdminModal onClose={() => setShowAdmin(false)} onSaved={loadEvents}/>}
  </div>;
}

function EventCard({ event, index, onClick }) {
  const left = Math.max(0, event.capacity - event.sold);
  return <article className="event-card" style={{'--delay': `${index * 65}ms`}} onClick={onClick} tabIndex="0" onKeyDown={e => e.key === 'Enter' && onClick()}>
    <div className="event-image-wrap"><img src={event.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80'} alt={event.title} loading="lazy"/><span className="event-category">{event.category}</span><button className="quick-book" onClick={e => { e.stopPropagation(); onClick(); }} aria-label={`Book ${event.title}`}><ArrowRight size={18}/></button></div>
    <div className="event-info"><div className="event-date"><CalendarDays size={14}/>{dateLabel(event.date)}<span>·</span><Clock3 size={14}/>{event.time}</div><h3>{event.title}</h3><p className="event-location"><MapPin size={15}/>{event.venue}, {event.city}</p><div className="event-card-bottom"><div><strong>{money(event.price)}</strong><span> / ticket</span></div><span className={left < 30 ? 'availability low' : 'availability'}>{left < 30 ? 'Selling fast' : `${left} left`}</span></div></div>
  </article>;
}

function AuthModal({ mode, setMode, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try { const data = await api(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(form) }); onSuccess(data); onClose(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <div className="modal-backdrop" onClick={onClose}><div className="auth-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={onClose}><X/></button><div className="auth-icon"><Ticket size={25}/></div><div className="eyebrow dark"><span className="eyebrow-line"></span> WELCOME TO Evencket</div><h2>{mode === 'login' ? 'Good to see you.' : 'Your next story starts here.'}</h2><p>{mode === 'login' ? 'Sign in to see your tickets and book your next experience.' : 'Create an account and get out there.'}</p><form onSubmit={submit}>{mode === 'register' && <label>Full name<input required minLength="2" value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="Your name"/></label>}<label>Email address<input required type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="you@example.com"/></label><label>Password<input required minLength="8" type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} placeholder="At least 8 characters"/></label>{error && <div className="form-error">{error}</div>}<button className="btn-primary full-width" disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}<ArrowRight size={17}/></button></form><div className="auth-switch">{mode === 'login' ? "New to evencket?" : 'Already have an account?'} <button onClick={() => {setMode(mode === 'login' ? 'register' : 'login');setError('');}}>{mode === 'login' ? 'Create an account' : 'Log in'}</button></div></div></div>;
}

function BookingsModal({ bookings, onClose }) {
  return <div className="modal-backdrop" onClick={onClose}><div className="bookings-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={onClose}><X/></button><div className="eyebrow dark"><span className="eyebrow-line"></span> YOUR EXPERIENCES</div><h2>My tickets<span className="brand-dot">.</span></h2><p className="modal-description">Every ticket is a memory in the making.</p>{bookings.length ? <div className="booking-list">{bookings.map(b => <div className="booking-item" key={b.id}><div className="booking-symbol"><Ticket/></div><div className="booking-main"><strong>{b.event?.title || 'Event'}</strong><span>{b.event ? `${dateLabel(b.event.date)} · ${b.event.city}` : 'Event details unavailable'}</span><small>Ref: {b.reference} · {b.quantity} ticket(s)</small></div><div className="booking-total"><strong>{money(b.total)}</strong><span>{b.status}</span></div></div>)}</div> : <div className="empty-state compact"><Ticket size={28}/><h3>No tickets yet</h3><p>Find an event and book your first experience.</p></div>}<button className="btn-outline dark-outline full-width" onClick={onClose}>Back to events</button></div></div>;
}

function AdminModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ title:'', category:'Music', date:'', time:'18:00', venue:'', city:'', price:'', capacity:'100', image:'', description:'' });
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try { await api('/events', { method:'POST', body:JSON.stringify({...form, price:Number(form.price), capacity:Number(form.capacity)}) }); onSaved(); onClose(); }
    catch(e) { setError(e.message); } finally { setBusy(false); }
  }
  return <div className="modal-backdrop" onClick={onClose}><div className="admin-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={onClose}><X/></button><div className="eyebrow dark"><span className="eyebrow-line"></span> ADMIN TOOLS</div><h2>Add an event<span className="brand-dot">.</span></h2><form className="admin-form" onSubmit={submit}><label>Event title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><div className="form-two"><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.filter(c=>c!=='All events').map(c=><option key={c}>{c}</option>)}</select></label><label>Date<input required type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label></div><div className="form-two"><label>Time<input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/></label><label>Ticket price (₹)<input required type="number" min="0" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label></div><div className="form-two"><label>Venue<input required value={form.venue} onChange={e=>setForm({...form,venue:e.target.value})}/></label><label>City<input required value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></label></div><div className="form-two"><label>Capacity<input required type="number" min="1" value={form.capacity} onChange={e=>setForm({...form,capacity:e.target.value})}/></label><label>Image URL<input value={form.image} onChange={e=>setForm({...form,image:e.target.value})}/></label></div><label>Description<textarea rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>{error && <div className="form-error">{error}</div>}<button className="btn-primary full-width" disabled={busy}>{busy?'Saving...':'Create event'}<ArrowRight size={17}/></button></form></div></div>;
}

export default App;
