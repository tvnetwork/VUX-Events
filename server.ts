import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
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

  // In-memory store for WebAuthn challenges and OTPs
  const challenges = new Map<string, string>();
  const otpStore = new Map<string, { code: string; expires: number }>();

  // Initialize Firebase Admin
  if (admin.apps.length === 0) {
    admin.initializeApp({
      projectId: 'ultra-badge-470321-a1',
    });
  }

  // Initialize SMTP Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER || 'coolshotsystemsofficial@gmail.com',
      pass: process.env.SMTP_PASS,
    },
  });

  const getRpID = (hostname: string) => {
    if (hostname.includes('vuxevents.zone.id')) return 'vuxevents.zone.id';
    if (hostname.includes('firebaseapp.com')) return 'ultra-badge-470321-a1.firebaseapp.com';
    return hostname;
  };

  // --- OTP Endpoints ---

  app.post('/api/auth/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { code, expires: Date.now() + 10 * 60 * 1000 });

    try {
      const user = process.env.SMTP_USER || 'coolshotsystemsofficial@gmail.com';
      const pass = process.env.SMTP_PASS;

      if (!pass) {
        throw new Error('SMTP_PASS is not configured. Please add it to your project secrets in Settings.');
      }

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"VUX Events" <${user}>`,
        to: email,
        subject: `${code} is your VUX Events verification code`,
        html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; background: #0b0b0f; border-radius: 24px; padding: 40px; color: white;">
            <h2 style="color: white; margin-top: 0;">Verification Code</h2>
            <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">Use the following code to sign in to VUX Events. This code will expire in 10 minutes.</p>
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 16px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; border: 1px solid rgba(255,255,255,0.1); margin: 30px 0;">
              ${code}
            </div>
            <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin-bottom: 0;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
      res.json({ success: true });
    } catch (error: any) {
      console.error('SMTP Error:', error);
      res.status(500).json({ error: error.message || 'Failed to send email. Check SMTP configuration.' });
    }
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    const { email, code } = req.body;
    const stored = otpStore.get(email);

    if (!stored || stored.code !== code || stored.expires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    try {
      const customToken = await admin.auth().createCustomToken(email);
      otpStore.delete(email);
      res.json({ success: true, token: customToken });
    } catch (error) {
      console.error('Token generation error:', error);
      res.status(500).json({ error: 'Failed to generate auth token' });
    }
  });

  const origin = process.env.APP_URL || `http://localhost:${PORT}`;

  // --- WebAuthn Endpoints ---

  app.get('/api/auth/register-options', async (req, res) => {
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
      const verification = await verifyRegistrationResponse({
        response: body as RegistrationResponseJSON,
        expectedChallenge,
        expectedOrigin: [`${req.protocol}://${req.get('host')}`],
        expectedRPID: rpID,
      });

      if (verification.verified) {
        challenges.delete(`reg_${email}`);
        res.json({ verified: true, registrationInfo: verification.registrationInfo });
      } else {
        res.status(400).json({ error: 'Verification failed' });
      }
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/auth/login-options', async (req, res) => {
    const { email } = req.query;
    const hostname = req.hostname;
    const rpID = getRpID(hostname);

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'preferred',
    });

    // We store the challenge by email if provided, or a generic one if not (autofill support)
    const key = email ? `auth_${email}` : 'auth_generic';
    challenges.set(key, options.challenge);
    res.json(options);
  });

  app.post('/api/auth/verify-authentication', async (req, res) => {
    const { email, body, credential } = req.body;
    const hostname = req.hostname;
    const rpID = getRpID(hostname);
    const key = email ? `auth_${email}` : 'auth_generic';
    const expectedChallenge = challenges.get(key);

    if (!expectedChallenge) {
      return res.status(400).json({ error: 'Challenge not found' });
    }

    try {
      // In a real app, you'd fetch the user's stored public key from DB
      // For this demo, we'll assume the client sends the credential data or we retrieve it
      // Since this is a serverless frontend-heavy app, we'll return a verification success 
      // if the signature matches the standard WebAuthn flow.
      
      const verification = await verifyAuthenticationResponse({
        response: body as AuthenticationResponseJSON,
        expectedChallenge,
        expectedOrigin: `${req.protocol}://${req.get('host')}`,
        expectedRPID: rpID,
        credential: {
          id: credential.id,
          publicKey: Buffer.from(credential.publicKey, 'base64'),
          counter: credential.counter || 0,
        },
      });

      if (verification.verified) {
        challenges.delete(key);
        // Generate custom token for Firebase login
        const customToken = await admin.auth().createCustomToken(email);
        res.json({ verified: true, token: customToken });
      } else {
        res.status(400).json({ error: 'Verification failed' });
      }
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
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
