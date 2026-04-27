import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
// import { createServer as createViteServer } from 'vite'; -- Moved to dynamic import inside block
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';
import fs from 'fs';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type { 
  RegistrationResponseJSON, 
  AuthenticationResponseJSON 
} from '@simplewebauthn/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin globally with robust error handling
let databaseId: string | undefined;
let projectId = 'ultra-badge-470321-a1';

try {
  const configPath = path.join(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    databaseId = config.firestoreDatabaseId;
    projectId = config.projectId || projectId;
  }
} catch (e) {
  console.error('Failed to read firebase-applet-config.json:', e);
}

try {
  if (admin.apps.length === 0) {
    const saVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (saVar) {
      try {
        const serviceAccount = JSON.parse(saVar);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id
        });
        console.log('Firebase Admin initialized with service account.');
      } catch (e) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT. Falling back.', e);
        admin.initializeApp({ projectId });
      }
    } else {
      admin.initializeApp({ projectId });
    }
  }
} catch (error) {
  console.error('Critical Firebase Admin Initialization Failure:', error);
}

const db = databaseId ? getFirestore(databaseId) : getFirestore();

export async function createServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for correct hostname and protocol detection behind Nginx
  app.set('trust proxy', true);

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  // Request logger for debugging path issues on Vercel
  app.use((req, res, next) => {
    if (process.env.VERCEL) {
      console.log(`[Express Debug] ${req.method} ${req.url} (mount: ${req.baseUrl}, original: ${req.originalUrl})`);
    }
    next();
  });

  // In-memory store for WebAuthn challenges and OTPs
  const challenges = new Map<string, string>();
  const otpStore = new Map<string, { code: string; expires: number }>();

  // Use a router for all API routes to ensure they are handled as a group
  const apiRouter = express.Router();
  
  const getRpID = (hostname: string) => {
    // Dynamic RpID extraction - use the base domain
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      // If it's a subdomain or www, take the last two parts (e.g. vuxevents.zone.id)
      // Special case for triple-part domains like .name.ng or .zone.id
      if (hostname.endsWith('.name.ng') || hostname.endsWith('.zone.id') || hostname.endsWith('.id.au')) {
         return parts.slice(-3).join('.');
      }
      return parts.slice(-2).join('.');
    }
    return hostname;
  };

  // Register the API router
  app.use('/api', apiRouter);

  // --- OTP Endpoints (on apiRouter) ---

  apiRouter.post('/auth/send-otp', async (req, res) => {
    const rid = Math.random().toString(36).substring(7);
    try {
      const email = req.body?.email;
      console.log(`[OTP][${rid}] Request for: ${email}`);

      if (!email) {
        console.warn(`[OTP][${rid}] Email missing`);
        return res.status(400).json({ error: 'Email is required' });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(email, { code, expires: Date.now() + 10 * 60 * 1000 });
      console.log(`[OTP][${rid}] Code generated`);

      const user = process.env.SMTP_USER || 'vuxevents@gmail.com';
      const pass = process.env.SMTP_PASS;

      if (!pass) {
        console.error(`[OTP][${rid}] SMTP_PASS is missing`);
        return res.status(503).json({ 
          error: 'Email service is not configured. please add SMTP_PASS to Secrets.',
          requestId: rid
        });
      }

      console.log(`[OTP][${rid}] Config host=${process.env.SMTP_HOST || 'smtp.gmail.com'}, user=${user}`);
      const transportConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: { user, pass },
      };
      
      const transporter = nodemailer.createTransport(transportConfig);

      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      console.log(`[OTP][${rid}] Attempting sendMail...`);
      const logoUrl = req ? `${protocol}://${req.get('host')}/logo.svg` : 'https://vuxevents.zone.id/logo.svg';
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || `"VUX Events" <${user}>`,
        to: email,
        subject: `${code} is your VUX verification code`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="background-color: #0b0b0f; padding: 40px; font-family: 'Inter', sans-serif;">
            <div style="max-width: 500px; margin: 0 auto; background-color: #0d0d12; border-radius: 40px; padding: 48px; color: #ffffff; text-align: center; border: 1px solid rgba(255,255,255,0.05); shadow: 0 40px 100px rgba(0,0,0,0.5);">
              <img src="${logoUrl}" style="width: 64px; border-radius: 18px; margin-bottom: 32px;" />
              <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.02em;">VERIFICATION CODE</h1>
              <p style="color: rgba(255,255,255,0.4); font-size: 14px; margin-bottom: 40px; font-weight: 500;">Enter this code on the website to sign in.</p>
              
              <div style="background: rgba(168, 85, 247, 0.05); padding: 32px; border-radius: 24px; font-size: 48px; font-weight: 800; letter-spacing: 0.2em; color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.2); margin-bottom: 32px;">
                ${code}
              </div>
              
              <p style="font-size: 11px; color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 0.3em; font-weight: 900; margin-top: 40px;">THE PREMIER EVENT PLATFORM</p>
            </div>
          </body>
          </html>
        `,
      });
      console.log(`[OTP][${rid}] Email sent successfully to ${email}`);
      return res.json({ success: true, requestId: rid });
    } catch (error: any) {
      console.error(`[OTP][${rid}] FATAL ERROR:`, {
        email: req.body?.email,
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      return res.status(500).json({ 
        error: 'Failed to send verification code',
        message: error.message,
        requestId: rid
      });
    }
  });
  
  apiRouter.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(), 
      env: process.env.NODE_ENV,
      smtpConfigured: !!process.env.SMTP_PASS,
      firebaseAdminStatus: admin.apps.length > 0 ? 'initialized' : 'not-initialized'
    });
  });

  apiRouter.post('/email/welcome', async (req, res) => {
    try {
      const email = req.body?.email;
      const displayName = req.body?.displayName;
      if (!email) return res.status(400).json({ error: 'Email is required' });

      console.log(`[SMTP] Sending welcome email to: ${email}`);

      const welcomes = ['👋', '🎉', '🚀', '🌟', '💎', '🤘', '🎈'];
      const randomWelcome = welcomes[Math.floor(Math.random() * welcomes.length)];

      const userSmtp = process.env.SMTP_USER || 'vuxevents@gmail.com';
      const pass = process.env.SMTP_PASS;

      if (!pass) {
        console.error('[SMTP] ERROR: SMTP_PASS not configured');
        return res.status(503).json({ error: 'SMTP_PASS not configured' });
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: { user: userSmtp, pass },
      });

      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const logoUrl = req ? `${protocol}://${req.get('host')}/logo.svg` : 'https://vuxevents.zone.id/logo.svg';
      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0b0f; color: white; padding: 48px; border-radius: 48px; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
          <img src="${logoUrl}" width="72" height="72" style="border-radius: 20px; margin-bottom: 32px;" />
          <h1 style="font-size: 32px; font-weight: 900; letter-spacing: -0.04em; font-style: italic; text-transform: uppercase; margin-bottom: 16px;">WELCOME TO VUX</h1>
          <p style="color: rgba(255,255,255,0.5); font-size: 16px; line-height: 1.6; margin-bottom: 40px;">
            Hi ${displayName || 'Explorer'}, welcome to the platform. You've successfully joined the world's most advanced event infrastructure.
          </p>
          <div style="background: rgba(255,255,255,0.03); padding: 32px; border-radius: 32px; border: 1px dashed rgba(255,255,255,0.1); margin-bottom: 40px;">
             <p style="font-size: 11px; font-weight: 900; color: #a855f7; letter-spacing: 0.3em; margin: 0 0 8px 0; text-transform: uppercase;">ACCOUNT VERIFIED</p>
             <p style="font-size: 14px; font-weight: 500; color: white; margin: 0;">Connected as ${email}</p>
          </div>
          <p style="font-size: 10px; color: rgba(255,255,255,0.2); font-weight: 900; text-transform: uppercase; letter-spacing: 0.4em;">VUX: EVENTS DONE RIGHT.</p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"VUX Events" <${userSmtp}>`,
        to: email,
        subject: `${randomWelcome} Welcome to VUX Events, ${displayName || 'Explorer'}!`,
        html: htmlContent
      });

      console.log('[SMTP] Welcome email sent successfully');
      res.json({ success: true });
    } catch (error: any) {
      console.error('[SMTP] Welcome Email Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  const generateICS = (event: { title: string, description: string, date: string, time: string, location: string }) => {
    try {
      const dateParts = (event.date || '').split('-');
      if (dateParts.length < 3) return null;
      
      const [year, month, day] = dateParts.map(Number);
      const timeToSplit = (event.time || '12:00').includes(':') ? event.time : '12:00';
      const [hour, min] = timeToSplit.split(':').map(Number);
      
      const start = new Date(year, month - 1, day, hour, min);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); 
      
      const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      return [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PROID:-//VUX Network//Event//EN',
          'CALSCALE:GREGORIAN',
          'METHOD:PUBLISH',
          'BEGIN:VEVENT',
          `DTSTAMP:${formatDate(new Date())}`,
          `DTSTART:${formatDate(start)}`,
          `DTEND:${formatDate(end)}`,
          `SUMMARY:${event.title}`,
          `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`,
          `LOCATION:${event.location || 'TBA'}`,
          `UID:${Math.random().toString(36).substring(2)}@vux.network`,
          'STATUS:CONFIRMED',
          'SEQUENCE:0',
          'BEGIN:VALARM',
          'TRIGGER:-PT24H',
          'ACTION:DISPLAY',
          'DESCRIPTION:Reminder',
          'END:VALARM',
          'END:VEVENT',
          'END:VCALENDAR'
      ].join('\r\n');
    } catch (e) {
      console.error('ICS Generation failed:', e);
      return null;
    }
  };

  apiRouter.post('/email/rsvp-confirmation', async (req, res) => {
    try {
      const { email, displayName, eventTitle, eventDescription, eventDate, eventLocation, rawDate, rawTime, rsvpId, eventId } = req.body || {};
      if (!email || !eventTitle) return res.status(400).json({ error: 'Missing required fields' });

      console.log(`[SMTP] Sending ticket email to: ${email} for ${eventTitle}`);

      const tickets = ['🎟️', '🎫', '✨', '⚡', '🔥', '🎭', '🎬'];
      const randomTicket = tickets[Math.floor(Math.random() * tickets.length)];

      const userSmtp = process.env.SMTP_USER || 'vuxevents@gmail.com';
      const pass = process.env.SMTP_PASS;

      if (!pass) {
        console.error('[SMTP] ERROR: SMTP_PASS not configured');
        return res.status(503).json({ error: 'SMTP_PASS not configured' });
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: { user: userSmtp, pass },
      });

      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.get('host');
      const baseUrl = `${protocol}://${host}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${rsvpId}&color=a855f7&bgcolor=08080c`;
      const logoUrl = `${baseUrl}/logo.svg`;
      
      const icsContent = generateICS({
        title: eventTitle,
        description: eventDescription || '',
        date: rawDate,
        time: rawTime,
        location: eventLocation
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800;900&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #050508; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050508; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #08080c; border-radius: 48px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; box-shadow: 0 50px 100px rgba(0,0,0,0.8);">
                  
                  <!-- Header/Brand -->
                  <tr>
                    <td style="padding: 48px 48px 24px 48px;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td>
                            <img src="${logoUrl}" width="48" height="48" style="border-radius: 14px; margin-bottom: 24px;" />
                            <p style="margin: 0; font-size: 10px; font-weight: 900; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.5em; margin-bottom: 8px;">CONFIRMATION SECURED</p>
                            <h1 style="margin: 0; font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.04em; line-height: 1.1;">You're going to<br/><span style="color: #a855f7; font-style: italic;">${eventTitle}</span></h1>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Ticket / QR Section -->
                  <tr>
                    <td style="padding: 0 48px;">
                      <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(0,0,0,0) 100%); border-radius: 32px; border: 1px solid rgba(168, 85, 247, 0.1); padding: 40px; text-align: center; position: relative; overflow: hidden;">
                        <img src="${qrUrl}" width="180" height="180" style="border-radius: 16px; margin-bottom: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); border: 1px solid rgba(168, 85, 247, 0.2);" />
                        <p style="margin: 0; font-size: 9px; font-weight: 900; color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 0.3em; margin-bottom: 8px;">DIGITAL ACCESS PROTOCOL</p>
                        <div style="display: inline-block; background: rgba(0,0,0,0.3); padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                          <code style="font-family: monospace; font-size: 16px; font-weight: 800; color: #a855f7;">VUX-${rsvpId.substring(0, 8).toUpperCase()}</code>
                        </div>
                      </div>
                    </td>
                  </tr>

                  <!-- Info Section -->
                  <tr>
                    <td style="padding: 40px 48px;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="padding-bottom: 32px;">
                            <p style="margin: 0; font-size: 10px; font-weight: 900; color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 12px;">TIME & DATE</p>
                            <p style="margin: 0; font-size: 18px; font-weight: 700; color: #ffffff;">${eventDate}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: 40px;">
                            <p style="margin: 0; font-size: 10px; font-weight: 900; color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 12px;">LOCATION</p>
                            <p style="margin: 0; font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">${eventLocation} <span style="color: #a855f7;">↗</span></p>
                            <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.4);">Verified Venue Infrastructure</p>
                          </td>
                        </tr>
                        
                        <!-- CTA Section -->
                        <tr>
                          <td style="padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05);">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td>
                                  <a href="${baseUrl}/events/${eventId}" style="display: inline-block; background-color: rgba(168, 85, 247, 0.1); color: #a855f7; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 12px; font-weight: 800; margin-right: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Event Page</a>
                                  <a href="${baseUrl}/profile" style="display: inline-block; background-color: rgba(255, 255, 255, 0.05); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">My Ticket</a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 32px 48px; background-color: rgba(255,255,255,0.02); text-align: center;">
                      <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.2); font-weight: 600; line-height: 1.6;">
                        You're using VUX NETWORK. The world's fastest event check-in system.<br/>
                        &copy; ${new Date().getFullYear()} VUX.ZONE — All Rights Reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      const attachments = [];
      if (icsContent) {
        attachments.push({
            filename: 'invite.ics',
            content: icsContent,
            contentType: 'text/calendar; method=PUBLISH'
        });
      }

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"VUX Events" <${userSmtp}>`,
        to: email,
        subject: `${randomTicket} Registration Confirmed: ${eventTitle}`,
        html: htmlContent,
        attachments
      });

      console.log('[SMTP] Ticket email sent successfully with ICS');
      res.json({ success: true });
    } catch (error: any) {
      console.error('[SMTP] Ticket Email Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  apiRouter.post('/email/login-notification', async (req, res) => {
    try {
      const { email, displayName, timestamp } = req.body || {};
      if (!email) return res.status(400).json({ error: 'Email is required' });

      console.log(`[SMTP] Sending login notification to: ${email}`);

      const alerts = ['🔒', '🛡️', '⚠️', '🚨', '👤', '🔐', '🤫'];
      const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];

      const userSmtp = process.env.SMTP_USER || 'vuxevents@gmail.com';
      const pass = process.env.SMTP_PASS;

      if (!pass) {
        console.error('[SMTP] ERROR: SMTP_PASS not configured');
        return res.status(503).json({ error: 'SMTP_PASS not configured' });
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: { user: userSmtp, pass },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"VUX Security" <${userSmtp}>`,
        to: email,
        subject: `${randomAlert} New Login Detected - VUX Events`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0b0f; color: white; padding: 40px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1);">
            <h2 style="color: #a855f7;">New Login Logged ${randomAlert}</h2>
            <p>Hi ${displayName || 'User'},</p>
            <p>A new login was detected for your VUX Events account.</p>
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin: 20px 0;">
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.5);">TIME: ${timestamp}</p>
              <p style="margin: 5px 0 0; font-size: 12px; color: rgba(255,255,255,0.5);">LOCATION: Detected via Web Access</p>
            </div>
            <p style="font-size: 11px; color: rgba(255,255,255,0.3);">If this wasn't you, please secure your account immediately.</p>
          </div>
        `
      });

      console.log('[SMTP] Login notification sent successfully');
      res.json({ success: true });
    } catch (error: any) {
      console.error('[SMTP] Login Email Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  apiRouter.post('/admin/broadcast', async (req, res) => {
    try {
      const { recipients, subject, body } = req.body;
      
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ error: 'Recipients list is required' });
      }

      console.log(`[SMTP] Starting broadcast to ${recipients.length} recipients...`);

      const user = process.env.SMTP_USER || 'vuxevents@gmail.com';
      const pass = process.env.SMTP_PASS;

      if (!pass) {
        console.error('[SMTP] ERROR: SMTP_PASS is not configured');
        return res.status(503).json({ error: 'SMTP_PASS is not configured' });
      }

      const transportConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: { user, pass },
      };
      
      const transporter = nodemailer.createTransport(transportConfig);

      const results = [];
      for (const email of recipients) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || `"VUX Events Admin" <${user}>`,
            to: email,
            subject: subject || 'Announcement from VUX Events',
            html: body
          });
          results.push({ email, status: 'sent' });
        } catch (err: any) {
          console.error(`[SMTP] Failed to send to ${email}:`, err);
          results.push({ email, status: 'failed', error: err.message });
        }
      }

      console.log(`[SMTP] Broadcast complete. Success: ${results.filter(r => r.status === 'sent').length}, Failed: ${results.filter(r => r.status === 'failed').length}`);
      return res.json({ success: true, count: recipients.length, results });
    } catch (error: any) {
      console.error('[SMTP] Broadcast Error:', error);
      return res.status(500).json({ error: error.message || 'Broadcast failed' });
    }
  });

  apiRouter.post('/auth/verify-otp', async (req, res) => {
    try {
      const { email, code } = req.body || {};
      if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });
      
      const stored = otpStore.get(email);

      if (!stored || stored.code !== code || Date.now() > stored.expires) {
        return res.status(400).json({ error: 'Invalid or expired code' });
      }

      const customToken = await admin.auth().createCustomToken(email, {
        email: email,
        email_verified: true
      });
      otpStore.delete(email);
      return res.json({ success: true, token: customToken });
    } catch (error: any) {
      console.error('Verification error:', error);
      return res.status(500).json({ error: error.message || 'Verification failed' });
    }
  });

  const origin = process.env.APP_URL || `http://localhost:${PORT}`;

  // --- WebAuthn Endpoints (on apiRouter) ---

  apiRouter.get('/auth/register-options', async (req, res) => {
    console.log('GET /api/auth/register-options hit', req.query);
    try {
      const { email, displayName } = req.query;
      const hostname = req.hostname;
      const rpID = getRpID(hostname);

      if (!email) {
         return res.status(400).json({ error: 'Email is required' });
      }

      const options = await generateRegistrationOptions({
        rpName: 'VUX Events',
        rpID,
        userID: Buffer.from(email as string),
        userName: email as string,
        userDisplayName: (displayName as string) || (email as string),
        attestationType: 'none',
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
          authenticatorAttachment: 'platform'
        },
      });

      challenges.set(`reg_${email}`, options.challenge);
      res.json(options);
    } catch (error: any) {
      console.error('Register Options Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  apiRouter.post('/auth/verify-registration', async (req, res) => {
    try {
      const { email, body } = req.body || {};
      if (!email || !body) return res.status(400).json({ error: 'Email and body are required' });
      
      const hostname = req.hostname;
      const rpID = getRpID(hostname);
      const expectedChallenge = challenges.get(`reg_${email}`);

    if (!expectedChallenge) {
      return res.status(400).json({ error: 'Challenge not found' });
    }

    try {
      // Get the origin dynamically, supporting both http and https (useful for proxies)
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.get('host');
      const origin = `${protocol}://${host}`;
      const headerOrigin = req.get('origin');
      const referer = req.get('referer');
      
      const expectedOrigin = [origin, `http://${host}`, `https://${host}`];
      if (headerOrigin) expectedOrigin.push(headerOrigin);
      if (referer) {
        try {
          const refUrl = new URL(referer);
          expectedOrigin.push(refUrl.origin);
        } catch (e) {}
      }

      console.log('Verifying registration with:', { 
        rpID, 
        expectedOrigin: [...new Set(expectedOrigin)],
        actualOrigin: origin,
        host
      });

      const verification = await verifyRegistrationResponse({
        response: body as RegistrationResponseJSON,
        expectedChallenge,
        expectedOrigin: [...new Set(expectedOrigin)],
        expectedRPID: rpID,
      });

      if (verification.verified) {
        challenges.delete(`reg_${email}`);
        res.json({ verified: true, registrationInfo: verification.registrationInfo });
      } else {
        res.status(400).json({ error: 'Verification failed' });
      }
    } catch (error: any) {
      console.error('Verify Registration Error:', error);
      res.status(400).json({ error: error.message });
    }
  } catch (error: any) {
    console.error('Outer Verify Reg Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

  apiRouter.get('/auth/login-options', async (req, res) => {
    console.log('GET /api/auth/login-options hit', req.query);
    try {
      const { email } = req.query;
      const hostname = req.hostname;
      const rpID = getRpID(hostname);

      const options = await generateAuthenticationOptions({
        rpID,
        userVerification: 'preferred',
      });

      // We store the challenge by email if provided, or a generic one if not (autofill support)
      const key = email ? `auth_${email as string}` : 'auth_generic';
      challenges.set(key, options.challenge);
      res.json(options);
    } catch (error: any) {
      console.error('Login Options Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  apiRouter.post('/auth/verify-authentication', async (req, res) => {
    try {
      const { email, body } = req.body || {};
      if (!email || !body) return res.status(400).json({ error: 'Email and body are required' });

      const hostname = req.hostname;
    const rpID = getRpID(hostname);
    const key = email ? `auth_${email}` : 'auth_generic';
    const expectedChallenge = challenges.get(key);

    if (!expectedChallenge) {
      return res.status(400).json({ error: 'Challenge not found' });
    }

    try {
      // Fetch user profile from Firestore to get their stored passkeys
      const profileSnap = await db.collection('users').doc(email).get();
      if (!profileSnap.exists) {
        throw new Error('User not found');
      }

      const userData = profileSnap.data();
      const passkeys = userData?.passkeys || [];

      // Find the specific passkey being used
      const passkey = passkeys.find((k: any) => k.credentialId === body.id);

      if (!passkey) {
        throw new Error('Passkey not recognized for this account');
      }

      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.get('host');
      const origin = `${protocol}://${host}`;
      const headerOrigin = req.get('origin');
      const referer = req.get('referer');
      
      const expectedOrigin = [origin, `http://${host}`, `https://${host}`];
      if (headerOrigin) expectedOrigin.push(headerOrigin);
      if (referer) {
        try {
          const refUrl = new URL(referer);
          expectedOrigin.push(refUrl.origin);
        } catch (e) {}
      }

      console.log('Verifying authentication with:', { 
        rpID, 
        expectedOrigin: [...new Set(expectedOrigin)],
        actualOrigin: origin,
        host,
        email
      });

      const verification = await verifyAuthenticationResponse({
        response: body as AuthenticationResponseJSON,
        expectedChallenge,
        expectedOrigin: [...new Set(expectedOrigin)],
        expectedRPID: rpID,
        authenticator: {
          credentialID: passkey.credentialId,
          credentialPublicKey: Buffer.from(passkey.publicKey, 'base64'),
          counter: passkey.counter || 0,
        },
      });

      if (verification.verified) {
        challenges.delete(key);

        // Update the counter in Firestore
        const updatedPasskeys = passkeys.map((k: any) => {
          if (k.credentialId === body.id) {
            return { ...k, counter: verification.authenticationInfo.newCounter };
          }
          return k;
        });

        await db.collection('users').doc(email).update({
          passkeys: updatedPasskeys
        });

        // Generate custom token for Firebase login
        const customToken = await admin.auth().createCustomToken(email, {
          email: email,
          email_verified: true
        });
        res.json({ verified: true, token: customToken });
      } else {
        res.status(400).json({ error: 'Verification failed' });
      }
    } catch (error: any) {
      console.error('Passkey Auth Verification Error:', error);
      res.status(400).json({ error: error.message });
    }
  } catch (error: any) {
    console.error('Outer Verify Auth Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

  apiRouter.post('/admin/reminders/trigger', async (req, res) => {
    try {
      console.log('[Automation] Starting manual reminder scan...');
      const now = new Date();
      const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const twentyFiveHoursFromNow = new Date(now.getTime() + 25 * 60 * 60 * 1000);

      // Find events starting in the next 24-25 hours
      const eventsSnap = await db.collection('events')
        .where('status', '==', 'published')
        .get();

      const eventsToRemind = eventsSnap.docs.filter(doc => {
        const data = doc.data();
        const eventDate = new Date(`${data.date}T${data.time || '00:00'}`);
        return eventDate >= twentyFourHoursFromNow && eventDate <= twentyFiveHoursFromNow;
      });

      console.log(`[Automation] Found ${eventsToRemind.length} events for reminders.`);

      const userSmtp = process.env.SMTP_USER || 'vuxevents@gmail.com';
      const pass = process.env.SMTP_PASS;

      if (!pass) return res.status(503).json({ error: 'SMTP not configured' });

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: { user: userSmtp, pass },
      });

      let sentCount = 0;
      for (const eventDoc of eventsToRemind) {
        const event = eventDoc.data();
        const rsvpsSnap = await eventDoc.ref.collection('rsvps').where('status', '==', 'approved').get();
        
        console.log(`[Automation] Sending reminders for "${event.title}" to ${rsvpsSnap.size} guests.`);

        for (const rsvpDoc of rsvpsSnap.docs) {
          const rsvp = rsvpDoc.data();
          try {
            await transporter.sendMail({
              from: process.env.SMTP_FROM || `"VUX Reminders" <${userSmtp}>`,
              to: rsvp.userEmail,
              subject: `⏰ 24 Hours To Go: ${event.title}`,
              html: `
                <div style="font-family: sans-serif; background: #0b0b0f; color: white; padding: 40px; border-radius: 24px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
                  <h1 style="color: #a855f7; font-style: italic; font-weight: 900;">REMINDER 💡</h1>
                  <p style="font-size: 20px; font-weight: 700;">${event.title} starts in 24 hours!</p>
                  <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: 16px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px;">📍 ${event.location}</p>
                    <p style="margin: 5px 0 0; font-size: 14px;">🕒 ${event.date} at ${event.time}</p>
                  </div>
                  <p style="font-size: 12px; color: rgba(255,255,255,0.4);">We look forward to seeing you there!</p>
                </div>
              `
            });
            sentCount++;
          } catch (e) {
            console.error(`[Automation] Failed to send reminder to ${rsvp.userEmail}`, e);
          }
        }
      }

      res.json({ success: true, eventsProcessed: eventsToRemind.length, remindersSent: sentCount });
    } catch (error: any) {
      console.error('[Automation] Trigger Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // API 404 handler for any unmatched routes inside the apiRouter
  apiRouter.use((req, res) => {
    console.log(`[API 404] ${req.method} ${req.url}`);
    res.status(404).json({ 
      error: 'Not Found', 
      message: `API endpoint ${req.method} ${req.originalUrl} does not exist.` 
    });
  });

  // Global API error handler
  apiRouter.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled API Error:', err);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal Server Error', 
        message: err.message || 'An unexpected error occurred on the server.' 
      });
    }
  });

  // --- Vite Middleware / Static Serving ---
  
  // On Vercel, we don't serve static files through Express because vercel.json handles it
  if (!process.env.VERCEL) {
    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      app.use(express.static(path.join(__dirname, 'dist')));
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
      });
    }
  }

  console.log('Express server created and routes initialized.');
  return app;
}

// Start server if not running on Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  createServer().then(app => {
    const PORT = 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  });
}
