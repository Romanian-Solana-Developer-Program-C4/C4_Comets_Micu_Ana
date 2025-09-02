import "dotenv/config";

import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { clusterApiUrl } from "@solana/web3.js";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

const kp = getKeypairFromEnvironment("SECRET_KEY");

const umi = createUmi(clusterApiUrl("devnet"));

const keypair = umi.eddsa.createKeypairFromSecretKey(kp.secretKey);
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

// Replace with YOUR image URI from Step 1
const IMG_URI = "https://gateway.irys.xyz/<HASH>";

async function uploadMetadata() {
  try {
    // Create metadata object following Metaplex standard
    const metadata = {
      name: "Comets RUG",
      symbol: "CRUG",
      desciption: "This is a Stellar RUG",
      image: IMG_URI,
      attributes: [
        { trait_type: "Color", value: "red" },
        { trait_type: "Material", value: "wool" },
        { trait_type: "Size", value: "very big" },
      ],
      properties: {
        files: [{ type: "image/png", uri: IMG_URI }],
      },
    };

    // Upload metadata JSON to Irys
    const metadataUri = await umi.uploader.uploadJson(metadata);

    console.log("✅ Done with metadata URI:", metadataUri);
  } catch (error) {
    console.error("[uploadMetadata] Failed with:", error);
  }
}

uploadMetadata();