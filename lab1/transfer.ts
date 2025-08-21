import "dotenv/config";
import { getExplorerLink, getKeypairFromEnvironment } from "@solana-developers/helpers";
import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    clusterApiUrl,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction
} from "@solana/web3.js";
import { createMemoInstruction } from "@solana/spl-memo";

const sender = getKeypairFromEnvironment("SECRET_KEY");

const connection = new Connection(clusterApiUrl("devnet"));

console.log(
    ` Loaded our keypair securely, using an env file. Our public key 
    is: ${sender.publicKey.toBase58()} `
);

const recipient = new PublicKey("7w6UA6rC1SsJxRhmydnFiY5mKReVzoB7rKfEkVmQGhXB");

console.log(` Attempting to send 0.01 SOL to ${recipient.toBase58()}... `);

const transaction = new Transaction();

const sendSolInstruction = SystemProgram.transfer({
    fromPubkey: sender.publicKey,
    toPubkey: recipient,
    lamports: 0.01 * LAMPORTS_PER_SOL,
});
transaction.add(sendSolInstruction);

const memoText = "Hello from Solana!";

const addMemoInstruction = createMemoInstruction(memoText);

transaction.add(addMemoInstruction);

console.log(` memo is ${memoText}...`);

const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [sender],
);

const link = getExplorerLink("transaction", signature, "devnet");

console.log(` Transaction link: ${link}`);

console.log(
    ` Transaction confirmed with signature: ${signature}. 
    Sent 0.01 SOL to ${recipient.toBase58()}`
);