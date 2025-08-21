import "dotenv/config";
import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    clusterApiUrl,
} from "@solana/web3.js";
import {
    getKeypairFromEnvironment,
    airdropIfRequired,
} from "@solana-developers/helpers";

const connection = new Connection(clusterApiUrl("devnet"));

console.log("Connected to devnet");

const publicKey = new PublicKey("CZ4d8CYUnmFayhmeUuvY5x3sGLwXkoQEVX1M6KoBG2PA");

await airdropIfRequired(
    connection,
    publicKey,
    1 * LAMPORTS_PER_SOL,
    0.5 * LAMPORTS_PER_SOL,
);

const balanceInLamports = await connection.getBalance(publicKey);

const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;

console.log(
    ` The balance of the wallet at address ${publicKey} is ${balanceInSOL} SOL`
);
