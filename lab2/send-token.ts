import "dotenv/config";
import { getKeypairFromEnvironment, getExplorerLink } from "@solana-developers/helpers";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

const url = clusterApiUrl("devnet");
const connection = new Connection(url);

const user = getKeypairFromEnvironment("SECRET_KEY");

console.log(` Loaded our keypair securely, using an env file. Our
    public key is ${user.publicKey.toBase58()} `);

const tokenMint = new PublicKey("54KUaJSA1eXgwPJyK3S4XiAmysrJR6sD8brT6Xbtwec3");
const recipient = new PublicKey("7w6UA6rC1SsJxRhmydnFiY5mKReVzoB7rKfEkVmQGhXB");

console.log(` Attempting to send token to ${recipient.toBase58()} from mint ${tokenMint.toBase58()} `);

const senderATA = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    tokenMint,
    user.publicKey // sender is the user
);

const recipientATA = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    tokenMint,
    recipient
);

const MINDR_UNITS_PER_MAJOR_UNITS = 10 ** 6; // Assuming 6 decimals for the token

const signature = await transfer(
    connection,
    user,
    senderATA.address,
    recipientATA.address,
    user, // mint authority
    5 * MINDR_UNITS_PER_MAJOR_UNITS // mint 1 token (assuming 6 decimals)
);

const link = getExplorerLink("transaction", signature, "devnet");
console.log(` Transaction link: ${link} `);


