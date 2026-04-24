/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';

export function usePasskey() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticate = async () => {
    setIsAuthenticating(true);
    setError(null);

    try {
      if (!window.PublicKeyCredential) {
          throw new Error("Passkeys are not supported on this browser.");
      }

      // This is a simplified WebAuthn call. 
      // In a real app, 'challenge' and 'allowCredentials' come from the backend.
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [], // In real use, this would be empty for conditional UI or populated for specific keys
          userVerification: "preferred",
          timeout: 60000,
        }
      });

      if (!credential) {
        throw new Error("Passkey authentication failed.");
      }

      console.log("Passkey Credential:", credential);
      return credential;
    } catch (err: any) {
      console.error("Passkey Error:", err);
      const message = err.name === 'NotAllowedError' 
        ? "Passkey authentication was cancelled or timed out." 
        : (err.name === 'SecurityError' || err.message?.includes('feature is not enabled'))
        ? "Passkey access is blocked in the preview iframe. Please open the app in a new tab to use this feature."
        : err.message || "Failed to authenticate with passkey.";
      setError(message);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  return {
    authenticate,
    isAuthenticating,
    error,
    setError
  };
}
