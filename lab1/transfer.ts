//fisier pentru efectuarea unui transfer de SOL intre doua conturi pe Solana
//include instructiunea de memo in tranzactie
//foloseste un keypair incarcat dintr-un fisier de mediu (.env)
//se ruleaza folosind comanda: npx esrun transfer.ts

import "dotenv/config";
import { getExplorerLink, getKeypairFromEnvironment } from "@solana-developers/helpers";
import {
    Connection, //ca sa interactionam cu blockchain-ul
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

const recipient = new PublicKey("7w6UA6rC1SsJxRhmydnFiY5mKReVzoB7rKfEkVmQGhXB"); //cui vrem sa trimitem

console.log(` Attempting to send 0.01 SOL to ${recipient.toBase58()}... `);

const transaction = new Transaction(); //cream o tranzactie noua

//exista doua metode de a crea tranzactii:
//legacy transaction and transaction v0
//legacy transaction e mai simpla si o folosim aici
//pentru tranzactii mai complexe, cu mai multe instructiuni, se recomanda transaction v0
//pentru a folosi transaction v0, trebuie sa folosim si un "address lookup table"


//adaugam instructiunea de transfer in tranzactie
const sendSolInstruction = SystemProgram.transfer({ //folosim instructiunea de transfer din account-ul SystemProgram
    fromPubkey: sender.publicKey, //de unde trimitem
    toPubkey: recipient, //catre cine trimitem
    lamports: 0.01 * LAMPORTS_PER_SOL, //cat trimitem (in lamports)
});
transaction.add(sendSolInstruction);

//putem include si alte instructiuni in tranzactie
//de exemplu, o instructiune de memo
//instructiunea de memo adauga un text la tranzactie, care poate fi vazut in explorer
//este util pentru a adauga informatii suplimentare la tranzactie
const memoText = "Hello from Solana!";

const addMemoInstruction = createMemoInstruction(memoText);

transaction.add(addMemoInstruction);

console.log(` memo is ${memoText}...`);

const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [sender], //semnatarii tranzactiei (aici doar sender-ul, dar este un array de signeri)
              //un signer este un keypair, are atat cheia publica cat si cea privata
              //un exemplu de tranzactie cu mai multi signeri este mint de token-uri
              //unde atat autoritatea de mint (Mint Account-ul la token-ul pe care il creezi) 
              //cat si destinatarul (portofelul in care dai mint) trebuie sa semneze tranzactia
              //un alt exemplu este un multisig wallet, unde mai multe chei private trebuie sa semneze tranzactia
              //indiferent cine o trimite pe blockchain, toti signarii trebuie sa semneze tranzactia
); //semneaza tranzactia si o trimite pe blockchain prin obiectul connection
   //asteptam confirmarea tranzactiei si primim inapoi un "signature" (hash-ul tranzactiei)

//getExplorerLink ne ajuta sa generam un link catre un explorer pentru a vedea tranzactia
//semnatura tranzactiei este o  informatie care nu se schimba si poate fi inclusa ca parte din URL
const link = getExplorerLink("transaction", signature, "devnet");

console.log(` Transaction link: ${link}`);

console.log(
    ` Transaction confirmed with signature: ${signature}. 
    Sent 0.01 SOL to ${recipient.toBase58()}`
);