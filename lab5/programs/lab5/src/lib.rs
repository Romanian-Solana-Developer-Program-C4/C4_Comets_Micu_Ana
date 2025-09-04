#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use borsh;

declare_id!("E6iuYQ3vEgv47K4ohSQRP2MdQXqcU1WjZDYUXrh5rELM"); // adresa publica a programului

#[program]
pub mod lab5 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn set_lab5(ctx: Context<SetLab5>) -> Result<()> {
        let lab5 = &mut ctx.accounts.lab5; // obtinem referinta la cont
        lab5.number = 1; 
        lab5.color = 2; 
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
#[instruction(id: u64)] // id = argument suplimentar pentru context (nu este cont)
pub struct SetLab5<'info> {
    // aici este contextul: specificam ce conturi trimitem in tranzactie
    // si ce permisiuni avem asupra lor
    // 'info = lifetime annotation (specifica durata de viata a referintei)s
    #[account(mut)] // mut = contul poate fi modificat
    pub user: Signer<'info>, // cel care semneaza tranzactia si o plateste (o lanseaza pe blockchain)
    #[account(init, 
        payer = user, 
        space = 8 + Lab5::INIT_SPACE,
        seeds = [user.key().as_ref()], // determina un cont lab5 unic asociat unui user
        // determina unicitatea contului relativ la program
        // seeds = [b"lab5"] am avea un singur PDA pentru toti userii, nu mai poate crea alt PDA cu acelasi seeds care
        // sa aiba o adresa unica
        // user.key().as_ref() = adresa publica a user-ului (ca bytes)
        // as_ref() = converteste un tip in referinta la acel tip (pentru a putea fi folosit ca seed)
        // daca am folosi doar user.key() am avea o problema de tipuri (Pubkey vs &[u8])
        // PDA = Program Derived Address = adresa derivata a programului (cont care nu are cheia privata, doar programul poate accesa)
        // PDA este generat dintr-un seed si un bump (valoare intre 0-255 care ajuta la evitarea coliziunilor)
        bump
    )] 
    // init = contul va fi creat, payer = contul care va plati pentru crearea contului
    // numele este hash-uit cu un discriminator (8 bytes) pentru a evita coliziunile
    // space = spatiul alocat pentru cont (8 bytes pentru discriminator + spatiu pentru struct)
    // Lab5::INIT_SPACE = spatiul alocat pentru struct (definit in struct)
    // seeds = seminte pentru a genera adresa contului (user.key() = adresa publica a utilizatorului)
    // bump = valoarea bump pentru a evita coliziunile (generata automat de anchor)
    pub lab5: Account<'info, Lab5>, // contul care va fi modificat
    // conturi specifice solana
    pub system_program: Program<'info, System>, // programul sistem (pentru crearea conturilor)
    // programul sistem este un program care ajuta la gestionarea conturilor (creare, alocare spatiu, etc)
    // e prezent mereu intr-o initializare de cont
    pub token_program: Program<'info, anchor_spl::token::Token>, // programul token (pentru crearea conturilor token)
    // programul token este un program care ajuta la gestionarea conturilor token (creare, transfer, etc)
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>, // programul associated token (pentru crearea conturilor associated token)
    // programul associated token este un program care ajuta la gestionarea conturilor token asociate unui portofel
    pub rent: Sysvar<'info, Rent>, // variabila de sistem rent (pentru a verifica daca un cont este rent-exempt)
    // rent-exempt = cont care are suficienti lamporti pentru a ramane pe blockchain
}

#[account]
#[derive(InitSpace)]
pub struct Lab5 {
    pub number: u64, 
    pub color: u8, 
    #[max_len(5, 50)] // max_len = lungimea maxima a vectorului (5 elemente, fiecare de maxim 50 bytes)
    pub hobbies: Vec<String>, // vector de string-uri (lista de hobby-uri)
    pub user: Pubkey, // adresa publica a utilizatorului care a creat contul
}

// InitSpace este un macro care aloca spatiu pentru cont in functie de campurile struct-ului

