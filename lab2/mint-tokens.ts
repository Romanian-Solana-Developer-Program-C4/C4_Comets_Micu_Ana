import "dotenv/config";
import { getExplorerLink, getKeypairFromEnvironment } from "@solana-developers/helpers";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

const url = clusterApiUrl("devnet");
const connection = new Connection(url);

const user = getKeypairFromEnvironment("SECRET_KEY");
const tokenMint = new PublicKey("54KUaJSA1eXgwPJyK3S4XiAmysrJR6sD8brT6Xbtwec3");
const recipient = new PublicKey("7w6UA6rC1SsJxRhmydnFiY5mKReVzoB7rKfEkVmQGhXB");

const recipientATA = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    tokenMint,
    user.publicKey // sender is the user
);

const MINDR_UNITS_PER_MAJOR_UNITS = 10 ** 6; // Assuming 6 decimals for the token

const signature = await mintTo(
    connection,
    user,
    tokenMint,
    recipientATA.address,
    user.publicKey, // mint authority
    10 * MINDR_UNITS_PER_MAJOR_UNITS // mint 1 token (assuming 6 decimals)
);

const link = getExplorerLink("transaction", signature, "devnet");
console.log(` Transaction link: ${link} `);


