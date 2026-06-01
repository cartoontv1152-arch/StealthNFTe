export function getPinataAuthHeaders(): HeadersInit | null {
  const apiKey = process.env.PINATA_API_KEY?.trim();
  const apiSecret = process.env.PINATA_API_SECRET?.trim();
  if (apiKey && apiSecret) {
    return {
      pinata_api_key: apiKey,
      pinata_secret_api_key: apiSecret,
    };
  }

  const jwt = process.env.PINATA_JWT?.trim();
  if (jwt) {
    return {
      authorization: `Bearer ${jwt}`,
    };
  }

  return null;
}
