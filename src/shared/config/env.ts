// Next.js ne résout process.env[dynamicKey] que côté serveur.
// Côté client, seule la notation pointée est substituée statiquement.
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!apiBaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_API_BASE_URL');
}

export const env = {
  apiBaseUrl,
  sharedSecret: process.env.API_SHARED_SECRET,
};
