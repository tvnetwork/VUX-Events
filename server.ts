import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
// import { createServer as createViteServer } from 'vite'; -- Moved to dynamic import inside block
import admin from 'firebase-admin';
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
        admin.initializeApp({ projectId: 'ultra-badge-470321-a1' });
      }
    } else {
      admin.initializeApp({ projectId: 'ultra-badge-470321-a1' });
    }
  }
} catch (error) {
  console.error('Critical Firebase Admin Initialization Failure:', error);
}

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
    try {
      const email = req.body?.email;
      const rid = Math.random().toString(36).substring(7);
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

      console.log(`[OTP][${rid}] Attempting sendMail...`);
      const logoUrl = 'https://imgcdn.dev/i/YV1TaK';

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || `"VUX Events" <${user}>`,
        to: email,
        subject: `${code} is your VUX Events verification code`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              .container {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                max-width: 500px;
                margin: 0 auto;
                background-color: #0b0b0f;
                border-radius: 32px;
                padding: 48px;
                color: #ffffff;
                text-align: center;
                border: 1px solid rgba(255,255,255,0.08);
              }
              .logo-container {
                margin-bottom: 32px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
              }
              .logo-image {
                width: 72px;
                height: 72px;
                border-radius: 18px;
                box-shadow: 0 8px 16px rgba(0,0,0,0.4);
                object-fit: cover;
              }
              .logo-text {
                font-weight: 900;
                font-style: italic;
                text-transform: uppercase;
                letter-spacing: -0.05em;
                font-size: 24px;
                color: #ffffff;
                margin-top: 8px;
              }
              .title {
                font-size: 28px;
                font-weight: 800;
                margin: 0 0 16px 0;
                letter-spacing: -0.02em;
                color: #ffffff;
              }
              .description {
                color: rgba(255,255,255,0.6);
                line-height: 1.6;
                font-size: 15px;
                margin-bottom: 32px;
              }
              .code-container {
                margin: 32px 0;
              }
              .code-box {
                display: inline-block;
                background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.05));
                padding: 24px 40px;
                border-radius: 24px;
                font-size: 48px;
                font-weight: 800;
                letter-spacing: 14px;
                color: #a855f7;
                border: 1px solid rgba(168, 85, 247, 0.3);
                text-shadow: 0 0 25px rgba(168, 85, 247, 0.4);
              }
              .copy-helper {
                font-size: 12px;
                color: rgba(168, 85, 247, 0.6);
                margin-top: 12px;
                font-weight: 500;
              }
              .footer {
                color: rgba(255,255,255,0.3);
                font-size: 12px;
                margin-top: 48px;
                border-top: 1px solid rgba(255,255,255,0.05);
                padding-top: 24px;
                line-height: 1.5;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo-container">
                <img src="${logoUrl}" class="logo-image" alt="VUX Logo" />
                <div class="logo-text">VUX Events</div>
              </div>
              
              <h1 class="title">Verify your identity</h1>
              <p class="description">Copy the 6-digit code below and paste it into the VUX Events app to complete your sign-in.</p>
              
              <div class="code-container">
                <div class="code-box">${code}</div>
                <div class="copy-helper">↑ Copy this code ↑</div>
              </div>
              
              <p style="color: rgba(255,255,255,0.4); font-size: 14px;">This code is valid for 10 minutes.</p>
              
              <div class="footer">
                This verification code was requested for <strong>${email}</strong>.<br/>
                If you did not request this, please ignore this email.<br/>
                <br/>
                &copy; ${new Date().getFullYear()} VUX Events. All rights reserved.
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log(`[OTP] Email sent successfully to ${req.body?.email}`);
      return res.json({ success: true });
    } catch (error: any) {
      console.error(`[OTP] FATAL ERROR for ${req.body?.email}:`, {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      return res.status(500).json({ 
        error: 'Failed to send verification code',
        message: error.message,
        code: error.code
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

      const logoUrl = 'https://imgcdn.dev/i/YV1TaK';
      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0b0f; color: white; padding: 40px; border-radius: 24px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${logoUrl}" width="80" height="80" style="border-radius: 20px;" />
            <h1 style="font-style: italic; text-transform: uppercase;">VUX Events</h1>
          </div>
          <h2>Welcome aboard! ${randomWelcome}</h2>
          <p>Hi ${displayName || 'Explorer'}, we're thrilled to have you in the VUX ecosystem.</p>
          <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 16px; margin: 20px 0;">
            <p>Explore the network, connect with creators, and secure your spot at the most exclusive gatherings.</p>
          </div>
          <p style="color: #a855f7;">See you at the next pulse.</p>
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

  apiRouter.post('/email/rsvp-confirmation', async (req, res) => {
    try {
      const { email, displayName, eventTitle, eventDate, eventLocation, rsvpId } = req.body || {};
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

      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${rsvpId}&color=a855f7&bgcolor=0b0b0f`;
      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0b0f; color: white; padding: 40px; border-radius: 48px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
          <div style="margin-bottom: 30px;">
              <p style="font-[10px] font-bold uppercase tracking-[0.3em] text-purple-400">RSVP CONFIRMED ${randomTicket}</p>
              <h1 style="font-style: italic; text-transform: uppercase; font-size: 32px; margin: 10px 0;">${eventTitle}</h1>
          </div>

          <div style="background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.1); border-radius: 32px; padding: 30px; margin-bottom: 30px;">
              <img src="${qrUrl}" width="150" height="150" style="margin-bottom: 20px; border-radius: 12px; border: 4px solid rgba(168, 85, 247, 0.2);" />
              <p style="font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 5px;">TICKET ID</p>
              <code style="font-size: 14px; color: #a855f7;">${rsvpId}</code>
          </div>

          <div style="text-align: left; padding: 0 20px;">
              <p style="font-size: 14px; color: rgba(255,255,255,0.6); margin-bottom: 20px;">Hi ${displayName || 'Guest'}, you're all set! Present this ticket at the entrance.</p>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                  <div>
                      <p style="font-size: 10px; color: rgba(255,255,255,0.3); font-weight: bold; text-transform: uppercase;">DATE</p>
                      <p style="font-size: 14px; color: white;">${eventDate}</p>
                  </div>
                  <div>
                      <p style="font-size: 10px; color: rgba(255,255,255,0.3); font-weight: bold; text-transform: uppercase;">LOCATION</p>
                      <p style="font-size: 14px; color: white;">${eventLocation}</p>
                  </div>
              </div>
          </div>

          <p style="font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
              Operated by VUX Network. Digital Ticket #VUX-${Math.floor(Math.random()*100000)}
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"VUX Events" <${userSmtp}>`,
        to: email,
        subject: `${randomTicket} Your Ticket: ${eventTitle}`,
        html: htmlContent
      });

      console.log('[SMTP] Ticket email sent successfully');
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
      const profileSnap = await admin.firestore().collection('users').doc(email).get();
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
        credential: {
          id: passkey.credentialId,
          publicKey: Buffer.from(passkey.publicKey, 'base64'),
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

        await admin.firestore().collection('users').doc(email).update({
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
