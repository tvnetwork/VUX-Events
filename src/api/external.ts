import express from 'express';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

const router = express.Router();

// Mock DevOS Webhook URL for this phase
const DEVOS_WEBHOOK_URL = process.env.DEVOS_WEBHOOK_URL || 'https://devos-webhook-placeholder.com/api/vux-webhook';

// Webhook Dispatcher
const dispatchWebhook = async (event: string, data: any) => {
  try {
    console.log(`[Webhook Dispatch] Sending ${event} to ${DEVOS_WEBHOOK_URL}`);
    // await fetch(DEVOS_WEBHOOK_URL, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', 'x-vux-signature': 'mock_signature' },
    //   body: JSON.stringify({ event, data, timestamp: new Date().toISOString() })
    // });
  } catch (e) {
    console.error('[Webhook Dispatch Error]:', e);
  }
};

// Middleware to check API key
const authenticateApiKey = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  if (!apiKey) {
    return res.status(401).json({ error: 'Missing API key' });
  }
  if (apiKey !== 'vux_test_123' && !apiKey.toString().startsWith('vux_')) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
};

router.use(authenticateApiKey);

// 1. Create Event API (Enhanced)
router.post('/events/create', async (req, res) => {
  try {
    const { title, description, date, location, hostName, hostEmail, coverImage, ticketLimit } = req.body;
    
    if (!title || !date) {
      return res.status(400).json({ error: 'Missing required fields: title, date' });
    }

    const eventRef = admin.firestore().collection('events').doc();
    const eventData = {
      title,
      description: description || '',
      date,
      location: location || 'TBD',
      hostId: 'external_api_user',
      hostName: hostName || 'External Host',
      coverImage: coverImage || null,
      ticketLimit: ticketLimit ? parseInt(ticketLimit) : null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      visibility: 'public',
      status: 'published',
      source: 'external_api'
    };

    await eventRef.set(eventData);

    const responsePayload = { id: eventRef.id, ...eventData, createdAt: new Date().toISOString() };
    
    // Dispatch webhook for creation
    await dispatchWebhook('event.created', responsePayload);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: responsePayload
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. RSVP and send ticket API
router.post('/events/:id/rsvp', async (req, res) => {
  try {
    const eventId = req.params.id;
    const { email, name } = req.body;

    if (!email || !name) return res.status(400).json({ error: 'Missing required fields' });

    const eventSnap = await admin.firestore().collection('events').doc(eventId).get();
    if (!eventSnap.exists) return res.status(404).json({ error: 'Event not found' });
    const eventData = eventSnap.data();

    const rsvpRef = eventSnap.ref.collection('rsvps').doc();
    const rsvpData = {
      userId: 'guest_' + Date.now(),
      userEmail: email,
      userDisplayName: name,
      status: 'approved',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ticketNumber: 'TKT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      source: 'external_api'
    };
    await rsvpRef.set(rsvpData);

    const qrDataUrl = await QRCode.toDataURL(JSON.stringify({ eventId, ticket: rsvpData.ticketNumber, email }));
    const userSmtp = process.env.SMTP_USER || 'vuxevents@gmail.com';
    const pass = process.env.SMTP_PASS;

    if (pass) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: { user: userSmtp, pass },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"VUX Ticketing" <${userSmtp}>`,
        to: email,
        subject: `Your Ticket for ${eventData?.title}`,
        html: `<div style="font-family: sans-serif; padding: 20px;"><h2>Hi ${name}, you're going to ${eventData?.title}!</h2><p>Date: ${eventData?.date}</p><p>Ticket Number: ${rsvpData.ticketNumber}</p><p>Here is your QR code for entry:</p><img src="${qrDataUrl}" alt="Ticket QR Code" /></div>`
      });
    }

    const responsePayload = { id: rsvpRef.id, ...rsvpData, timestamp: new Date().toISOString() };
    
    // Dispatch webhook for RSVP
    await dispatchWebhook('event.rsvp.created', { eventId, rsvp: responsePayload });

    res.json({ success: true, message: 'RSVP successful, ticket sent.', rsvp: responsePayload });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Manage Attendees API
router.get('/events/:id/attendees', async (req, res) => {
  try {
    const eventId = req.params.id;
    const rsvpsSnap = await admin.firestore().collection('events').doc(eventId).collection('rsvps').get();
    
    const attendees = rsvpsSnap.docs.map(doc => ({
      id: doc.id,
      name: doc.data().userDisplayName,
      email: doc.data().userEmail,
      ticketNumber: doc.data().ticketNumber,
      status: doc.data().status
    }));

    res.json({ success: true, attendees });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Export Analytics API
router.get('/events/:id/analytics', async (req, res) => {
  try {
    const eventId = req.params.id;
    const eventSnap = await admin.firestore().collection('events').doc(eventId).get();
    
    if (!eventSnap.exists) return res.status(404).json({ error: 'Event not found' });
    
    const rsvpsSnap = await admin.firestore().collection('events').doc(eventId).collection('rsvps').get();
    
    const approved = rsvpsSnap.docs.filter(doc => doc.data().status === 'approved').length;
    const pending = rsvpsSnap.docs.filter(doc => doc.data().status === 'pending').length;
    
    res.json({
      success: true,
      analytics: {
        totalRsvps: rsvpsSnap.size,
        approvedTickets: approved,
        pendingWaitlist: pending,
        capacity: eventSnap.data()?.ticketLimit || 'unlimited'
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
