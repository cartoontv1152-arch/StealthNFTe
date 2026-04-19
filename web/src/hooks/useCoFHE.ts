"use client";

import { useState, useCallback } from "react";
import { createCofheClient, createCofheConfig, FheTypes, EncryptedItemInput } from "@cofhe/sdk";
import type { PublicClient, WalletClient } from "viem";

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

let cofheClient: ReturnType<typeof createCofheClient> | null = null;

export function useCoFHE() {
  const [encrypting, setEncrypting] = useState(false);
  const [decrypting, setDecrypting] = useState(false);

  const getClient = useCallback(() => {
    if (!cofheClient) {
      const cofheConfig = createCofheConfig({
        fheKeyStorage: "in-memory",
        publicClient: null as unknown as PublicClient,
        walletClient: null as unknown as WalletClient,
      });
      cofheClient = createCofheClient(cofheConfig);
    }
    return cofheClient;
  }, []);

  const encryptValue = useCallback(async (value: bigint | number): Promise<EncryptedValue | null> => {
    setEncrypting(true);
    try {
      const client = getClient();
      const input = BigInt(value);

      const encrypted = await client.encrypt({
        euint64: input,
      });

      if (encrypted && encrypted.length > 0) {
        const result = encrypted[0];
        return {
          ciphertext: result.ciphertext || "",
          signature: result.signature || "",
          random: String(result.random || ""),
          handle: result.handle || BigInt(0),
          inputType: "euint64",
        };
      }
      return null;
    } catch (error) {
      console.error("Encryption failed:", error);
      return null;
    } finally {
      setEncrypting(false);
    }
  }, [getClient]);

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