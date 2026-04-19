"use client";

import { useState, useCallback } from "react";
import { useCofheEncrypt, useCofheContext } from "@cofhe/react";
import type { EncryptedItemInput } from "@cofhe/sdk";

export interface EncryptedValue {
  ciphertext: string;
  signature: string;
  random: string;
  handle: bigint;
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
  const [decrypting, setDecrypting] = useState(false);
  const cofhe = useCofheContext();

  const { mutateAsync: encryptMutation } = useCofheEncrypt();

  const encryptValue = useCallback(async (value: bigint | number): Promise<EncryptedValue | null> => {
    setEncrypting(true);
    try {
      const input = BigInt(value);

      const encrypted = await encryptMutation({
        euint64: input,
      });

      if (encrypted && encrypted.length > 0) {
        const result = encrypted[0] as EncryptedItemInput & { handle: bigint };
        return {
          ciphertext: result.ciphertext || "",
          signature: result.signature || "",
          random: (result.random as string) || "",
          handle: result.handle || BigInt(0),
        };
      }
      return null;
    } catch (error) {
      console.error("Encryption failed:", error);
      return null;
    } finally {
      setEncrypting(false);
    }
  }, [encryptMutation]);

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

      const encrypted = await encryptMutation({
        euint64: hash,
      });

      if (encrypted && encrypted.length > 0) {
        const result = encrypted[0] as EncryptedItemInput & { handle: bigint };
        return {
          encrypted: {
            ciphertext: result.ciphertext || "",
            signature: result.signature || "",
            random: (result.random as string) || "",
            handle: result.handle || BigInt(0),
          },
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
  }, [encryptMutation]);

  return {
    encryptValue,
    encryptMetadata,
    encrypting,
    decrypting,
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