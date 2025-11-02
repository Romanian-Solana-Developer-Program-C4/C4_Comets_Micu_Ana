//fisier de verificare a balance-ului unui account
//se ruleaza de fiecare data cand vrem sa verificam balance-ul unui account
//se ruleaza cu comanda: npx esrun check-balance.ts

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

//pentru a face un request catre blockchain, a citi date sau a trimite tranzactii, a scrie date intr-un cluster
//avem nevoie de o conexiune (Connection) la un cluster (network)
//in acest caz ne conectam la devnet, reteaua de testare a Solana
//clusterApiUrl este o functie care returneaza URL-ul corespunzator pentru un cluster dat (devnet, testnet, mainnet-beta)
//mainnet-beta este reteaua principala unde se desfasoara tranzactiile reale cu valoare reala
const url = clusterApiUrl("devnet");
const connection = new Connection(url);

console.log("Connected to devnet");
console.log(`RPC URL: ${url}`);

const keypair = getKeypairFromEnvironment("SECRET_KEY"); //avem nevoie de keypair

//pentru a verifica balance-ul, asiguram ca avem suficienti lamports in account
//daca nu avem, facem un airdrop de 1 SOL (1 SOL = 1_000_000_000 lamports)
//airdropIfRequired este o functie helper care verifica balance-ul si face airdrop daca este necesar
//pentru a nu face airdrop inutil de fiecare data
await airdropIfRequired(
    connection,
    keypair.publicKey,
    1 * LAMPORTS_PER_SOL, //cat vrem sa facem airdrop (1 SOL)
    0.5 * LAMPORTS_PER_SOL, //daca balance-ul este sub acest prag, se face airdrop
);
//aceasta metoda exista doar pe devnet si testnet, nu pe mainnet-beta

//un json rpc method care returneaza balance-ul unui account
//balance-ul este returnat in lamports (1 SOL = 1_000_000_000 lamports)
const balanceInLamports = await connection.getBalance(keypair.publicKey); 

//convertim lamports in SOL pentru a fi mai usor de citit
const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;

console.log(
    ` The balance of the wallet at address ${keypair.publicKey} is ${balanceInSOL} SOL`
);
