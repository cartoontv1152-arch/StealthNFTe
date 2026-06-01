"use client";

import { useCallback, useMemo, useState } from "react";
import { getAddress, type Hex } from "viem";
import { useAccount, useChainId, usePublicClient, useWalletClient } from "wagmi";
import type { CofheClient, DecryptForTxResult, EncryptedUint64Input } from "@cofhe/sdk";
import { APP_CHAIN_ID } from "@/lib/contracts";

export interface EncryptedMetadata {
  encrypted: EncryptedUint64Input;
  commitment: Hex;
  original: {
    name: string;
    description: string;
    image: string;
    price: string;
    attributes?: Record<string, string>;
    privateNotes?: string;
  };
}

type CofheStatus = {
  label: string;
  detail?: string;
};

let cofheClientPromise: Promise<CofheClient> | null = null;

async function getCofheClient() {
  if (!cofheClientPromise) {
    cofheClientPromise = Promise.all([import("@cofhe/sdk/web"), import("@cofhe/sdk/chains")]).then(
      ([webSdk, chainSdk]) => {
        const config = webSdk.createCofheConfig({
          supportedChains: [chainSdk.chains.sepolia],
          useWorkers: true,
        });

        return webSdk.createCofheClient(config);
      }
    );
  }

  return cofheClientPromise;
}

export function normalizeDecryptedAddress(value: unknown): `0x${string}` {
  if (typeof value === "string") {
    return getAddress(value) as `0x${string}`;
  }

  const bigintValue = BigInt(value as bigint);
  return getAddress(`0x${bigintValue.toString(16).padStart(40, "0").slice(-40)}`) as `0x${string}`;
}

export function useCoFHE() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: APP_CHAIN_ID });
  const { data: walletClient } = useWalletClient({ chainId: APP_CHAIN_ID });
  const [encrypting, setEncrypting] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [status, setStatus] = useState<CofheStatus | null>(null);

  const ready = useMemo(
    () => Boolean(isConnected && address && publicClient && walletClient && chainId === APP_CHAIN_ID),
    [address, chainId, isConnected, publicClient, walletClient]
  );

  const connectClient = useCallback(async () => {
    if (!isConnected || !address) {
      throw new Error("Connect a wallet before using encrypted actions.");
    }

    if (chainId !== APP_CHAIN_ID) {
      throw new Error("Switch your wallet to Sepolia before using CoFHE actions.");
    }

    if (!publicClient || !walletClient) {
      throw new Error("Wallet client is not ready yet. Try again after the wallet finishes connecting.");
    }

    const client = await getCofheClient();
    const snapshot = client.getSnapshot();
    const connectedToCurrentWallet =
      snapshot.connected &&
      snapshot.chainId === APP_CHAIN_ID &&
      snapshot.account?.toLowerCase() === address.toLowerCase();

    if (!connectedToCurrentWallet) {
      setStatus({ label: "Connecting CoFHE client", detail: "Preparing browser encryption context." });
      await client.connect(publicClient as never, walletClient as never);
    }

    return client;
  }, [address, chainId, isConnected, publicClient, walletClient]);

  const encryptUint64 = useCallback(
    async (value: bigint): Promise<EncryptedUint64Input> => {
      setEncrypting(true);
      setStatus({ label: "Preparing encryption", detail: "Loading FHE keys and proof worker." });

      try {
        const [{ Encryptable }, client] = await Promise.all([import("@cofhe/sdk"), connectClient()]);
        const [encrypted] = await client
          .encryptInputs([Encryptable.uint64(value)])
          .setAccount(address!)
          .setChainId(APP_CHAIN_ID)
          .onStep((step, context) => {
            setStatus({
              label: context?.isEnd ? `Completed ${step}` : `Running ${step}`,
              detail: "Generating a signed encrypted input for the contract.",
            });
          })
          .execute();

        setStatus({ label: "Encryption ready", detail: "Encrypted input is ready for the transaction." });
        return encrypted;
      } finally {
        setEncrypting(false);
      }
    },
    [address, connectClient]
  );

  const decryptForTx = useCallback(
    async (ctHash: bigint | string): Promise<DecryptForTxResult> => {
      setDecrypting(true);
      setStatus({ label: "Requesting threshold decrypt", detail: "Fetching a verifiable signature for settlement." });

      try {
        const client = await connectClient();
        const result = await client.decryptForTx(ctHash).withoutPermit().execute();
        setStatus({ label: "Decrypt proof ready", detail: "The proof can now be submitted on-chain." });
        return result;
      } finally {
        setDecrypting(false);
      }
    },
    [connectClient]
  );

  const decryptAddressForTx = useCallback(
    async (ctHash: bigint | string) => {
      const result = await decryptForTx(ctHash);
      return {
        ...result,
        decryptedValue: normalizeDecryptedAddress(result.decryptedValue),
      };
    },
    [decryptForTx]
  );

  const decryptUint64ForTx = useCallback(
    async (ctHash: bigint | string) => {
      const result = await decryptForTx(ctHash);
      return {
        ...result,
        decryptedValue: BigInt(result.decryptedValue as bigint),
      };
    },
    [decryptForTx]
  );

  const ensureSelfPermit = useCallback(async () => {
    const client = await connectClient();
    return client.permits.getOrCreateSelfPermit();
  }, [connectClient]);

  const encryptMetadata = useCallback(
    async (metadata: EncryptedMetadata["original"]): Promise<EncryptedMetadata> => {
      const commitment = await sha256Hex(JSON.stringify(metadata));
      const commitment64 = BigInt(`0x${commitment.slice(2, 18)}`);
      const encrypted = await encryptUint64(commitment64);

      return { encrypted, commitment, original: metadata };
    },
    [encryptUint64]
  );

  return {
    ready,
    status,
    encrypting,
    decrypting,
    busy: encrypting || decrypting,
    connectClient,
    encryptUint64,
    encryptMetadata,
    decryptForTx,
    decryptAddressForTx,
    decryptUint64ForTx,
    ensureSelfPermit,
  };
}

async function sha256Hex(input: string): Promise<Hex> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `0x${hex}`;
}
