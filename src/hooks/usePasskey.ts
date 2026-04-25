/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

export function usePasskey() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (userEmail: string, displayName: string) => {
    setIsAuthenticating(true);
    setError(null);

    try {
      // 1. Get registration options from server
      const resp = await fetch(`/api/auth/register-options?email=${encodeURIComponent(userEmail)}&displayName=${encodeURIComponent(displayName)}`, {
        headers: { 'Accept': 'application/json' }
      });
      
      const contentType = resp.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await resp.text();
        console.error('Expected JSON but got:', text.substring(0, 500));
        throw new Error(`Server returned non-JSON response (${resp.status}). Please check server logs.`);
      }
      
      const options = await resp.json();

      if (options.error) throw new Error(options.error);

      // 2. Start browser registration
      const attestationResponse = await startRegistration({ optionsJSON: options });

      // 3. Verify on server
      const verifyResp = await fetch('/api/auth/verify-registration', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: userEmail,
          body: attestationResponse
        }),
      });

      const verifyContentType = verifyResp.headers.get('content-type');
      if (!verifyContentType || !verifyContentType.includes('application/json')) {
        const text = await verifyResp.text();
        console.error('Expected JSON but got:', text.substring(0, 500));
        throw new Error(`Server verification non-JSON response (${verifyResp.status})`);
      }

      const verification = await verifyResp.json();

      if (!verification.verified) {
         throw new Error("Verification failed on server");
      }

      // Return the public data to store in Firestore for the user record
      return {
        credentialId: attestationResponse.id,
        publicKey: btoa(String.fromCharCode(...new Uint8Array(verification.registrationInfo.credentialPublicKey))),
        counter: verification.registrationInfo.counter || 0,
        name: navigator.userAgent.includes("Mac") ? "MacPasskey" : "MobilePasskey",
        createdAt: new Date().toISOString()
      };
    } catch (err: any) {
      console.error("Passkey Register Error:", err);
      const message = err.name === 'NotAllowedError' 
        ? "Passkey registration was cancelled or timed out." 
        : (err.name === 'SecurityError' || err.message?.includes('feature is not enabled'))
        ? "Passkey registration is blocked in the preview iframe. Please open the app in a new tab."
        : err.message || "Failed to register passkey.";
      setError(message);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const authenticateWithPasskey = async (email: string) => {
      setIsAuthenticating(true);
      setError(null);

      try {
        // 1. Get auth options from server
        const resp = await fetch(`/api/auth/login-options?email=${encodeURIComponent(email)}`, {
          headers: { 'Accept': 'application/json' }
        });
        
        const contentType = resp.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await resp.text();
          console.error('Expected JSON but got:', text.substring(0, 500));
          throw new Error(`Server returned non-JSON response (${resp.status})`);
        }
        
        const options = await resp.json();

        if (options.error) throw new Error(options.error);

        // 2. Start browser authentication
        const assertionResponse = await startAuthentication({ optionsJSON: options });

        // 3. Verify on server
        const verifyResp = await fetch('/api/auth/verify-authentication', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email,
            body: assertionResponse
          }),
        });

        const verifyContentType = verifyResp.headers.get('content-type');
        if (!verifyContentType || !verifyContentType.includes('application/json')) {
          const text = await verifyResp.text();
          console.error('Expected JSON but got:', text.substring(0, 500));
          throw new Error(`Server verification non-JSON response (${verifyResp.status})`);
        }

        const verification = await verifyResp.json();

        if (!verification.verified) {
           throw new Error(verification.error || "Verification failed on server");
        }

        return verification.token;
      } catch (err: any) {
        console.error("Passkey Auth Error:", err);
        const message = err.name === 'NotAllowedError' 
          ? "Passkey authentication was cancelled or timed out." 
          : err.message || "Failed to authenticate with passkey.";
        setError(message);
        throw err;
      } finally {
        setIsAuthenticating(false);
      }
  };

  return {
    authenticate: authenticateWithPasskey,
    register,
    isAuthenticating,
    error,
    setError
  };
}
