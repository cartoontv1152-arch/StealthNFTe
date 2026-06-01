import { NextResponse } from "next/server";
import { allowRequest, getClientKey } from "@/lib/rate-limit";
import { getPinataAuthHeaders } from "@/lib/pinata";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  if (!allowRequest(`upload:${getClientKey(request)}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many upload attempts. Try again in a minute." }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are supported." }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image must be 5 MB or smaller." }, { status: 400 });
  }

  const authHeaders = getPinataAuthHeaders();
  if (authHeaders) {
    const pinataForm = new FormData();
    pinataForm.append("file", file, sanitizeFilename(file.name || "stealth-nft-image"));
    pinataForm.append("pinataMetadata", JSON.stringify({ name: sanitizeFilename(file.name || "stealth-nft-image") }));

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: authHeaders,
      body: pinataForm,
    });

    if (response.ok) {
      const data = (await response.json()) as { IpfsHash?: string };
      if (data.IpfsHash) {
        return NextResponse.json({ uri: `ipfs://${data.IpfsHash}`, storage: "ipfs" });
      }
    }
  }

  return NextResponse.json({
    error: "Media uploads require valid Pinata credentials so artwork is stored off-chain. Add Pinata credentials or paste an existing ipfs:// / https:// image URL.",
  }, { status: 503 });
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80) || "stealth-nft-image";
}
