import express from 'express';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

const router = express.Router();

// Middleware to check API key
const authenticateApiKey = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'Missing x-api-key header' });
  }

  // TODO: Validate API key against database. For now, accept 'vux_test_123'
  if (apiKey !== 'vux_test_123' && !apiKey.toString().startsWith('vux_')) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  next();
};

router.use(authenticateApiKey);

// Create Event API
router.post('/events/create', async (req, res) => {
  try {
    const { title, description, date, location, hostName, hostEmail } = req.body;
    
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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      visibility: 'public',
      status: 'published',
      source: 'external_api'
    };

    await eventRef.set(eventData);

    // Return the full event payload as requested by DevOS for syncing
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: { id: eventRef.id, ...eventData, createdAt: new Date().toISOString() }
    });
  } catch (error: any) {
    console.error('External API - Create Event Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// RSVP and send ticket API
router.post('/events/:id/rsvp', async (req, res) => {
  try {
    const eventId = req.params.id;
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Missing required fields: email, name' });
    }

    const eventSnap = await admin.firestore().collection('events').doc(eventId).get();
    if (!eventSnap.exists) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const eventData = eventSnap.data();

    // Create RSVP record
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

    // Generate QR Code
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify({ eventId, ticket: rsvpData.ticketNumber, email }));

    // Send Ticket via SMTP
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
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Hi ${name}, you're going to ${eventData?.title}!</h2>
            <p>Date: ${eventData?.date}</p>
            <p>Ticket Number: ${rsvpData.ticketNumber}</p>
            <p>Here is your QR code for entry:</p>
            <img src="${qrDataUrl}" alt="Ticket QR Code" />
          </div>
        `
      });
    }

    res.json({ success: true, message: 'RSVP successful, ticket sent.', rsvp: { id: rsvpRef.id, ...rsvpData, timestamp: new Date().toISOString() } });

    // Note: We would also trigger the DevOS Webhook here in the future
    // await fetch(WEBHOOK_URL, { method: 'POST', body: JSON.stringify({ type: 'rsvp', data: rsvpData }) });

  } catch (error: any) {
    console.error('External API - RSVP Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
