import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl } from "@solana/web3.js";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { keypairPayer } from "@metaplex-foundation/umi";
import {
  createSignerFromKeypair,
  generateSigner,
  percentAmount,
  signerIdentity,
} from "@metaplex-foundation/umi";

import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { base58 } from "@metaplex-foundation/umi/serializers";

const kp = getKeypairFromEnvironment("SECRET_KEY");

const umi = createUmi(clusterApiUrl("devnet"));

const keypair = umi.eddsa.createKeypairFromSecretKey(kp.secretKey);
const signer = createSignerFromKeypair(umi, keypair);

// Add Token Metadata Program
umi.use(mplTokenMetadata());
umi.use(signerIdentity(signer));

// Replace with YOUR URIs from previous steps
const IMG_URI = "https://devnet.irys.xyz/<IMAGE_HASH>";
const METADATA_URI = "https://devnet.irys.xyz/<METADATA_HASH>";

async function createMyNft() {
  try {
    // Generate a new keypair for the mint account
    const mint = generateSigner(umi);

    // Create the NFT transaction
    let tx = createNft(umi, {
      name: "Comets RUG",
      mint, // The mint account signer
      authority: signer, // Who has authority over this NFT
      sellerFeeBasisPoints: percentAmount(5),
      isCollection: false, // This is not a collection NFT
      uri: METADATA_URI, // Points to our uploaded metadata
    });

    // Send transaction and wait for confirmation
    let result = await tx.sendAndConfirm(umi);
    const [signature] = base58.deserialize(result.signature);

    console.log("✅ Done! with sig:", signature);
    console.log(`🎉 Your NFT mint address: ${mint.publicKey}`);
  } catch (error) {
    console.error("[createMyNft] Failed with:", error);
  }
}

createMyNft();