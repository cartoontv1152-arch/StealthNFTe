"use client";

import { useState, useCallback } from "react";

export interface EncryptedValue {
  ciphertext: string;
  signature: string;
  random: string;
  handle: bigint;
  inputType: string;
}

export interface EncryptedMetadata {
  encrypted: EncryptedValue;
  original: {
    name: string;
    description: string;
    image: string;
    price: string;
    attributes?: Record<string, string>;
  };
}

export function useCoFHE() {
  const [encrypting, setEncrypting] = useState(false);

  const encryptValue = useCallback(async (value: bigint | number): Promise<EncryptedValue | null> => {
    setEncrypting(true);
    try {
      const input = BigInt(value);

      // Simulated FHE encryption - in production, this uses @cofhe/sdk
      // For demo purposes, we generate a mock encrypted value
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate encryption delay

      const mockHandle = input;

      return {
        ciphertext: `encrypted_${input.toString(16)}`,
        signature: `sig_${Date.now()}`,
        random: `random_${Math.random().toString(36).substring(7)}`,
        handle: mockHandle,
        inputType: "euint64",
      };
    } catch (error) {
      console.error("Encryption failed:", error);
      return null;
    } finally {
      setEncrypting(false);
    }
  }, []);

  const encryptMetadata = useCallback(async (metadata: {
    name: string;
    description: string;
    image: string;
    price: string;
    attributes?: Record<string, string>;
  }): Promise<EncryptedMetadata | null> => {
    setEncrypting(true);
    try {
      const combinedValue = `${metadata.name}|${metadata.description}|${metadata.price}|${JSON.stringify(metadata.attributes || {})}`;
      const hash = hashString(combinedValue);

      const encrypted = await encryptValue(hash);

      if (encrypted) {
        return {
          encrypted,
          original: metadata,
        };
      }
      return null;
    } catch (error) {
      console.error("Metadata encryption failed:", error);
      return null;
    } finally {
      setEncrypting(false);
    }
  }, [encryptValue]);

  return {
    encryptValue,
    encryptMetadata,
    encrypting,
    decrypting: false,
  };
}

function hashString(str: string): bigint {
  let hash = BigInt(0);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << BigInt(5)) - hash + BigInt(str.charCodeAt(i));
    hash = hash & BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
  }
  return hash;
}