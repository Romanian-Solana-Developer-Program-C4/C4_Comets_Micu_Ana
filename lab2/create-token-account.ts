import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

const url = clusterApiUrl("devnet");
const connection = new Connection(url);

const user = getKeypairFromEnvironment("SECRET_KEY");

const tokenMint = new PublicKey("54KUaJSA1eXgwPJyK3S4XiAmysrJR6sD8brT6Xbtwec3");
const recipient = new PublicKey("7w6UA6rC1SsJxRhmydnFiY5mKReVzoB7rKfEkVmQGhXB");

const recipientATA = await getOrCreateAssociatedTokenAccount(connection, user, tokenMint, recipient); // arata relatia dintre un Mint si un System Account
                                                                                                      // ca rezultat primim un obiect account asociat cu mint-ul
console.log(
    ` For mint ${tokenMint.toBase58()} for owner ${recipient.toBase58()} the ATA is ${recipientATA.address}`
);




