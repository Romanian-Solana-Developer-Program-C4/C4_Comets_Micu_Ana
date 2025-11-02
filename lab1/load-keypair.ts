//fisier de incarcare a unui keypair dintr-o variabila de mediu
//se ruleaza de fiecare data cand avem nevoie sa incarcam un keypair salvat anterior
//se ruleaza cu comanda: npx esrun load-keypair.ts

import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";

const keypair = getKeypairFromEnvironment("SECRET_KEY"); //incarca keypair-ul din variabila de mediu numita SECRET_KEY

console.log(
    ` We've loaded our keypair securely, using an env file. Our public 
    key is: ${keypair.publicKey.toBase58()} ` 
);