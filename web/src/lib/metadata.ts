import type { Hex } from "viem";

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
        version: "wave-4",
        privacyCommitment,
        privateMetadataEncrypted: Boolean(input.privateNotes.trim()),
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
  try {
    const response = await fetch("/api/metadata", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error(`metadata upload failed: ${response.status}`);
    }

    const data = (await response.json()) as { uri?: string };
    if (data.uri) {
      return data.uri;
    }
  } catch {
    // The API route returns a data URI unless server-side IPFS credentials are configured.
  }

  return encodeDataUri(metadata);
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

async function sha256Hex(input: string): Promise<Hex> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `0x${hex}`;
}
