import type { Hex } from "viem";

const MAX_ONCHAIN_TOKEN_URI_CHARS = 24_000;

export type NftAttribute = {
  trait_type: string;
  value: string;
};

export type TokenMetadata = {
  name: string;
  description: string;
  image: string;
  attributes?: NftAttribute[];
  external_url?: string;
  properties?: {
    stealth?: {
      version: string;
      privacyCommitment: Hex;
      privateMetadataCommitted: boolean;
      privateMetadataEncrypted: boolean;
      encryptedReserve: boolean;
    };
  };
};

export type MetadataInput = {
  name: string;
  description: string;
  image: string;
  attributes: NftAttribute[];
  privateNotes: string;
};

export type UploadedMedia = {
  uri: string;
  storage: "ipfs";
};

export async function buildTokenMetadata(input: MetadataInput) {
  const privacyCommitment = await sha256Hex(
    JSON.stringify({
      name: input.name,
      description: input.description,
      attributes: input.attributes,
      privateNotes: input.privateNotes,
    })
  );

  const metadata: TokenMetadata = {
    name: input.name,
    description: input.description,
    image: input.image,
    attributes: input.attributes.filter((attribute) => attribute.trait_type && attribute.value),
    properties: {
      stealth: {
        version: "wave-5",
        privacyCommitment,
        privateMetadataCommitted: Boolean(input.privateNotes.trim()),
        privateMetadataEncrypted: false,
        encryptedReserve: true,
      },
    },
  };

  return {
    metadata,
    privacyCommitment,
    uri: encodeDataUri(metadata),
  };
}

export async function uploadMetadata(metadata: TokenMetadata) {
  const fallbackUri = encodeDataUri(metadata);

  try {
    const response = await fetch("/api/metadata", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error || `metadata upload failed: ${response.status}`);
    }

    const data = (await response.json()) as { uri?: string };
    if (data.uri) {
      return data.uri;
    }
  } catch (error) {
    if (fallbackUri.length > MAX_ONCHAIN_TOKEN_URI_CHARS) {
      throw error instanceof Error ? error : new Error("Metadata upload failed and the on-chain fallback is too large.");
    }
  }

  return fallbackUri;
}

export async function uploadMediaFile(file: File): Promise<UploadedMedia> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as { uri?: string; storage?: "ipfs"; error?: string };
  if (!response.ok || !data.uri) {
    throw new Error(data.error || `media upload failed: ${response.status}`);
  }

  return {
    uri: data.uri,
    storage: data.storage || "ipfs",
  };
}

export async function parseTokenUri(uri: string): Promise<TokenMetadata | null> {
  try {
    if (uri.startsWith("data:")) {
      const [, payload = ""] = uri.split(",", 2);
      const isBase64 = uri.slice(0, uri.indexOf(",")).includes(";base64");
      const json = isBase64 ? atob(payload) : decodeURIComponent(payload);
      return JSON.parse(json) as TokenMetadata;
    }

    const response = await fetch(resolveAssetUrl(uri), { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    return (await response.json()) as TokenMetadata;
  } catch {
    return null;
  }
}

export function resolveAssetUrl(uri: string) {
  if (uri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}`;
  }

  return uri;
}

export function encodeDataUri(metadata: TokenMetadata) {
  return `data:application/json,${encodeURIComponent(JSON.stringify(metadata))}`;
}

export function isSafeOnchainTokenUri(uri: string) {
  return uri.length <= MAX_ONCHAIN_TOKEN_URI_CHARS;
}

async function sha256Hex(input: string): Promise<Hex> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `0x${hex}`;
}
