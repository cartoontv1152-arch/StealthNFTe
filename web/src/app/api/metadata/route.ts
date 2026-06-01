import { NextResponse } from "next/server";
import { encodeDataUri, isSafeOnchainTokenUri, type TokenMetadata } from "@/lib/metadata";
import { allowRequest, getClientKey } from "@/lib/rate-limit";
import { getPinataAuthHeaders } from "@/lib/pinata";

const MAX_METADATA_BYTES = 64 * 1024;

export async function POST(request: Request) {
  if (!allowRequest(`metadata:${getClientKey(request)}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many metadata requests. Try again in a minute." }, { status: 429 });
  }

  let metadata: TokenMetadata;
  try {
    metadata = (await request.json()) as TokenMetadata;
  } catch {
    return NextResponse.json({ error: "Invalid metadata JSON." }, { status: 400 });
  }

  const metadataBytes = new TextEncoder().encode(JSON.stringify(metadata)).byteLength;
  if (!metadata.name?.trim() || !metadata.description?.trim() || !metadata.image?.trim()) {
    return NextResponse.json({ error: "Metadata requires name, description, and image." }, { status: 400 });
  }

  if (metadataBytes > MAX_METADATA_BYTES) {
    return NextResponse.json({ error: "Metadata is too large." }, { status: 413 });
  }

  const authHeaders = getPinataAuthHeaders();
  const fallbackUri = encodeDataUri(metadata);

  if (!authHeaders) {
    if (isSafeOnchainTokenUri(fallbackUri)) {
      return NextResponse.json({ uri: fallbackUri, storage: "data-uri" });
    }

    return NextResponse.json(
      { error: "Metadata is too large for the bounded on-chain fallback. Configure Pinata credentials or use shorter metadata." },
      { status: 413 }
    );
  }

  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      ...authHeaders,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: `${metadata.name || "stealth-nft"}.json`,
      },
    }),
  });

  if (!response.ok) {
    if (isSafeOnchainTokenUri(fallbackUri)) {
      return NextResponse.json({ uri: fallbackUri, storage: "data-uri" }, { status: 200 });
    }

    return NextResponse.json(
      { error: "IPFS metadata pinning failed and metadata is too large for the bounded on-chain fallback." },
      { status: 502 }
    );
  }

  const data = (await response.json()) as { IpfsHash?: string };
  if (!data.IpfsHash) {
    if (isSafeOnchainTokenUri(fallbackUri)) {
      return NextResponse.json({ uri: fallbackUri, storage: "data-uri" }, { status: 200 });
    }

    return NextResponse.json(
      { error: "IPFS metadata response did not include a CID and metadata is too large for the bounded on-chain fallback." },
      { status: 502 }
    );
  }

  return NextResponse.json({ uri: `ipfs://${data.IpfsHash}`, storage: "ipfs" });
}
