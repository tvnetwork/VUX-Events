import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  
  // Request logger
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // In-memory store for WebAuthn challenges and OTPs
  const challenges = new Map<string, string>();
  const otpStore = new Map<string, { code: string; expires: number }>();

  // Initialize Firebase Admin
  if (admin.apps.length === 0) {
    const saVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (saVar) {
      try {
        const serviceAccount = JSON.parse(saVar);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id
        });
        console.log('Firebase Admin initialized with service account certificate from environment.');
      } catch (e) {
        console.error('Failed to initialize with FIREBASE_SERVICE_ACCOUNT secret. Falling back to default credentials.', e);
        admin.initializeApp({
          projectId: 'ultra-badge-470321-a1',
        });
      }
    } else {
      admin.initializeApp({
        projectId: 'ultra-badge-470321-a1',
      });
    }
  }

  const getRpID = (hostname: string) => {
    if (hostname.includes('vuxevents.zone.id')) return 'vuxevents.zone.id';
    if (hostname.includes('firebaseapp.com')) return 'ultra-badge-470321-a1.firebaseapp.com';
    return hostname;
  };

  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
  });

  // --- OTP Endpoints ---

  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      console.log('--- Auth Request ---');
      console.log('Method: POST, URL: /api/auth/send-otp');
      console.log('Target Email:', req.body.email);

      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required' });

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(email, { code, expires: Date.now() + 10 * 60 * 1000 });

      const user = process.env.SMTP_USER || 'coolshotsystemsofficial@gmail.com';
      const pass = process.env.SMTP_PASS;

      if (!pass) {
        console.error('CRITICAL: SMTP_PASS is missing in environment variables. Please add it to Secrets.');
        return res.status(503).json({ 
          error: 'Email service is not configured. please add SMTP_PASS to Secrets in the Settings menu.' 
        });
      }

      console.log('Configuring SMTP transporter for user:', user);
      const transportConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: { user, pass },
      };
      
      const transporter = nodemailer.createTransport(transportConfig);

      console.log('Sending email...');
      
      const logoUrl = 'https://imgcdn.dev/i/YV1TaK';

      await transporter.sendMail({
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
      console.log('Email sent successfully');
      return res.json({ success: true });
    } catch (error: any) {
      console.error('SMTP Error:', error);
      return res.status(500).json({ error: error.message || 'Failed to send verification email' });
    }
  });
  
  app.post('/api/admin/broadcast', async (req, res) => {
    try {
      const { recipients, subject, body } = req.body;
      
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ error: 'Recipients list is required' });
      }

      const user = process.env.SMTP_USER || 'coolshotsystemsofficial@gmail.com';
      const pass = process.env.SMTP_PASS;

      if (!pass) {
        return res.status(503).json({ error: 'SMTP_PASS is not configured' });
      }

      const transportConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: { user, pass },
      };
      
      const transporter = nodemailer.createTransport(transportConfig);

      console.log(`Starting broadcast to ${recipients.length} recipients...`);

      const results = [];
      // We send emails in chunks or sequential for simplicity here
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
          console.error(`Failed to send to ${email}:`, err);
          results.push({ email, status: 'failed', error: err.message });
        }
      }

      return res.json({ success: true, count: recipients.length, results });
    } catch (error: any) {
      console.error('Broadcast Error:', error);
      return res.status(500).json({ error: error.message || 'Broadcast failed' });
    }
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const { email, code } = req.body;
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

  // --- WebAuthn Endpoints ---

  app.get('/api/auth/register-options', async (req, res) => {
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

  app.post('/api/auth/verify-registration', async (req, res) => {
    const { email, body } = req.body;
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

      const verification = await verifyRegistrationResponse({
        response: body as RegistrationResponseJSON,
        expectedChallenge,
        expectedOrigin: [origin, `http://${host}`, `https://${host}`],
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
  });

  app.get('/api/auth/login-options', async (req, res) => {
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

  app.post('/api/auth/verify-authentication', async (req, res) => {
    const { email, body } = req.body;
    const hostname = req.hostname;
    const rpID = getRpID(hostname);
    const key = email ? `auth_${email}` : 'auth_generic';
    const expectedChallenge = challenges.get(key);

    if (!expectedChallenge) {
      return res.status(400).json({ error: 'Challenge not found' });
    }

    try {
      // Fetch user profile from Firestore to get their stored passkey
      const profileSnap = await admin.firestore().collection('users').doc(email).get();
      if (!profileSnap.exists) {
        throw new Error('User not found');
      }

      const userData = profileSnap.data();
      const passkey = userData?.passkeys?.[0]; // Get the first passkey

      if (!passkey) {
        throw new Error('No passkey found for this account');
      }

      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.get('host');
      const origin = `${protocol}://${host}`;

      const verification = await verifyAuthenticationResponse({
        response: body as AuthenticationResponseJSON,
        expectedChallenge,
        expectedOrigin: [origin, `http://${host}`, `https://${host}`],
        expectedRPID: rpID,
        credential: {
          id: passkey.credentialId,
          publicKey: Buffer.from(passkey.publicKey, 'base64'),
          counter: passkey.counter || 0,
        },
      });

      if (verification.verified) {
        challenges.delete(key);
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
  });

  // Final API fallback to prevent falling through to HTML index for missing API routes
  app.use('/api', (req, res, next) => {
    // If we are here, it means no /api route matched above
    console.log(`[API 404 Fallback] ${req.method} ${req.url}`);
    res.status(404).json({ 
      error: 'Not Found', 
      message: `API endpoint ${req.method} ${req.url} does not exist.` 
    });
  });

  // --- Vite Middleware ---

  if (process.env.NODE_ENV !== 'production') {
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
