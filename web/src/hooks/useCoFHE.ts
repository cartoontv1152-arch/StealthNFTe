"use client";

import { useState, useCallback } from "react";
import { encrypt, decryptForTx, EncryptedRandom } from "@cofhe/sdk";

export interface EncryptedValue {
  ciphertext: string;
  signature: string;
  random: string;
}

export function useCoFHE() {
  const [encrypting, setEncrypting] = useState(false);
  const [decrypting, setDecrypting] = useState(false);

  const encryptValue = useCallback(async (value: bigint | number): Promise<EncryptedValue | null> => {
    setEncrypting(true);
    try {
      const input = BigInt(value);
      const encrypted = await encrypt({ euint64: input });

      return {
        ciphertext: encrypted.ciphertext,
        signature: encrypted.signature,
        random: encrypted.random || "",
      };
    } catch (error) {
      console.error("Encryption failed:", error);
      return null;
    } finally {
      setEncrypting(false);
    }
  }, []);

  const decryptValue = useCallback(async (encrypted: EncryptedValue): Promise<bigint | null> => {
    setDecrypting(true);
    try {
      const result = await decryptForTx({
        ciphertext: encrypted.ciphertext,
        signature: encrypted.signature,
        random: encrypted.random as EncryptedRandom,
      });
      return BigInt(result);
    } catch (error) {
      console.error("Decryption failed:", error);
      return null;
    } finally {
      setDecrypting(false);
    }
  }, []);

  const encryptMetadata = useCallback(async (metadata: {
    name: string;
    description: string;
    image: string;
    price: string;
    attributes?: Record<string, string>;
  }): Promise<{ encrypted: EncryptedValue; original: typeof metadata } | null> => {
    setEncrypting(true);
    try {
      const combinedValue = `${metadata.name}|${metadata.description}|${metadata.price}|${JSON.stringify(metadata.attributes || {})}`;
      const hash = BigInt(keccak256String(combinedValue));

      const encrypted = await encrypt({ euint64: hash });

      return {
        encrypted: {
          ciphertext: encrypted.ciphertext,
          signature: encrypted.signature,
          random: encrypted.random || "",
        },
        original: metadata,
      };
    } catch (error) {
      console.error("Metadata encryption failed:", error);
      return null;
    } finally {
      setEncrypting(false);
    }
  }, []);

  return {
    encryptValue,
    decryptValue,
    encryptMetadata,
    encrypting,
    decrypting,
  };
}

function keccak256String(str: string): string {
  let hash = "0";
  for (let i = 0; i < str.length; i++) {
    hash = BigInt(parseInt(hash, 16) || 0) + BigInt(str.charCodeAt(i) * 31) + BigInt(i);
    hash = hash % BigInt(2 ** 256);
  }
  return hash.toString(16);
}