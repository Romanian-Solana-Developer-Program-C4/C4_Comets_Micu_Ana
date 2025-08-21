import "dotenv/config";
import { getExplorerLink, getKeypairFromEnvironment } from "@solana-developers/helpers";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";

const user = getKeypairFromEnvironment("SECRET_KEY");

const connection = new Connection(clusterApiUrl("devnet"));

const tokenMint = await createMint(
    connection,
    user,
    user.publicKey, //cine o sa poata trimite tranzactiile cu instructiunile de mint
    null, // nu avem un mint authority, deci null
    6 // numarul de zecimale pentru mint
);

console.log(
    ` Token mint created successfully. Mint address: ${tokenMint.toBase58()}`
);

const link = getExplorerLink("address", tokenMint.toBase58(), "devnet");

console.log(` Token mint link: ${link}`);