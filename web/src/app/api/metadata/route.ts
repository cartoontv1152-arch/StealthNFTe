import { NextResponse } from "next/server";
import { encodeDataUri, type TokenMetadata } from "@/lib/metadata";

export async function POST(request: Request) {
  const metadata = (await request.json()) as TokenMetadata;
  const pinataJwt = process.env.PINATA_JWT;

  if (!pinataJwt) {
    return NextResponse.json({ uri: encodeDataUri(metadata), storage: "data-uri" });
  }

  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      authorization: `Bearer ${pinataJwt}`,
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
    return NextResponse.json({ uri: encodeDataUri(metadata), storage: "data-uri" }, { status: 200 });
  }

  const data = (await response.json()) as { IpfsHash?: string };
  if (!data.IpfsHash) {
    return NextResponse.json({ uri: encodeDataUri(metadata), storage: "data-uri" }, { status: 200 });
  }

  return NextResponse.json({ uri: `ipfs://${data.IpfsHash}`, storage: "ipfs" });
}
