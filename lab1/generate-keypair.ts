//fisier de generare a unui keypair nou
//se ruleaza o singura data pentru a genera un nou keypair
//se salveaza undeva cheile generate pentru a fi folosite ulterior
//se ruleaza cu comanda: npx esrun generate-keypair.ts

import { Keypair } from "@solana/web3.js";

const keypair = Keypair.generate(); // cel mai folosit si simplu tip de account (System Account)
                                    // este un wallet cu o cheie publica si una privata

//cheile sunt un set de 32 de bytes (256 biti)

//cheia publica este folosita pentru a identifica account-ul in retea
console.log('Public Key:', keypair.publicKey.toBase58()); //este in format base58 pentru a fi usor de citit
//formatul base58 este folosit in blockchain pentru a reprezenta cheile publice si adresele
//deoarece este mai compact si evita caracterele care pot fi confundate
//cu alte caractere (de exemplu 0 si O, l si I)

//cheia privata este folosita pentru a semna tranzactiile si a demonstra proprietatea asupra account-ului
console.log('Secret Key:', keypair.secretKey);