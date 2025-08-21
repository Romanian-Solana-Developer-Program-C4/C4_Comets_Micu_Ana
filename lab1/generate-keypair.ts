import { Keypair } from "@solana/web3.js";

const keypair = Keypair.generate(); // cel mai folosit si simplu tip de account (System Account)
                                    // este un wallet cu o cheie publica si una privata

console.log('Public Key:', keypair.publicKey.toBase58());
console.log('Secret Key:', keypair.secretKey);