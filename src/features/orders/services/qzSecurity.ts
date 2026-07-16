import qz from "qz-tray";

import certificate from "../../../assets/qz/digital-certificate.txt?raw";
import privateKey from "../../../assets/qz/private-key.pem?raw";

let configured = false;
let importedPrivateKey: CryptoKey | null = null;

export function configureQzSecurity(): void {
  if (configured) {
    return;
  }
  configured = true;

  qz.security.setCertificatePromise(async () => certificate);
  qz.security.setSignatureAlgorithm("SHA256");
  qz.security.setSignaturePromise(async (dataToSign: string) => {
    const key = await getPrivateKey();
    const signature = await window.crypto.subtle.sign(
      { name: "RSASSA-PKCS1-v1_5" },
      key,
      new TextEncoder().encode(dataToSign),
    );
    return arrayBufferToBase64(signature);
  });
}

async function getPrivateKey(): Promise<CryptoKey> {
  if (importedPrivateKey) {
    return importedPrivateKey;
  }
  importedPrivateKey = await window.crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKey),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );
  return importedPrivateKey;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
}
