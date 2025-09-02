import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl } from "@solana/web3.js";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi";
import { readFile } from "fs/promises";

// Load keypair from environment
const kp = getKeypairFromEnvironment("SECRET_KEY");

// Create UMI instance connected to Solana devnet
const umi = createUmi(clusterApiUrl("devnet"));

// Convert keypair and create signer
const keypair = umi.eddsa.createKeypairFromSecretKey(kp.secretKey);
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

const IMAGE_FILE = "rug.png";

export async function uploadImage() {
  try {
    console.log("🕣 Uploading image...");

    // Read the image file from disk
    const img = await readFile(IMAGE_FILE);

    // Convert to UMI-compatible format
    const imgConverted = createGenericFile(new Uint8Array(img), "image/png");

    // Upload to Irys and get the URI
    const [myUri] = await umi.uploader.upload([imgConverted]);

    console.log("✅ Done with URI:", myUri);
  } catch (err) {
    console.error("[uploadImage] Failed with error:", err);
  }
}

// Execute the function
uploadImage();