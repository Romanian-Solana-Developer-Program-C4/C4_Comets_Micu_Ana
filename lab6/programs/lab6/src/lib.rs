use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_2022::{transfer_checked, TransferChecked},
    token_interface::{Mint, TokenAccount, TokenInterface},
};
// pub mod instructions;

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("CDU3DctPC1v7C8rNCU3jX9pBFY9GyP1CSdrjsL42pujh");

pub const ANCHOR_DISCRIMINATOR: u8 = 8;
pub const INIT_SPACE: usize = 8 + 32 + 32 + 32 + 8 + 8;

#[program]
mod escrow {

    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        msg!("Hello debug");
        // msg!("Greetings from: {{:?}}", ctx.program_id);
        Ok(())
    }

    pub fn make_offer(
        ctx: Context<MakeOffer>,
        id: u64,
        token_a_offered_amount: u64,
        token_b_wanted_amount: u64,
    ) -> Result<()> {
        ctx.accounts.offer.set_inner(Offer {
            id: id,
            maker: ctx.accounts.maker.key(),
            token_mint_a: ctx.accounts.token_mint_a.key(),
            token_mint_b: ctx.accounts.token_mint_b.key(),
            token_a_offered_amount: token_a_offered_amount,
            token_b_wanted_amount,
            // bump: ctx.bumps.borrow().
        });

        let transfer_accounts = TransferChecked {
            from: ctx.accounts.maker_token_account_a.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
            mint: ctx.accounts.token_mint_a.to_account_info(),
            authority: ctx.accounts.maker.to_account_info(),
        };

        let cpi_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_accounts,
        );

        transfer_checked(
            cpi_context,
            token_a_offered_amount,
            ctx.accounts.token_mint_a.decimals,
        )
        .unwrap();

        Ok(())
    }

    pub fn take_offer(ctx: Context<TakeOffer>) -> Result<()> {
        // taker sends token B to maker
        // vault sends token A to taker

        let offer = &ctx.accounts.offer;

        let vault_token_a_amount = ctx.accounts.vault.amount;

        require!(
            vault_token_a_amount == offer.token_a_offered_amount,
            EscrowError::InvalidVaultAmount
        );

        let signer_seeds: [&[&[u8]]; 1] = [&[
            b"offer".as_ref(),
            &ctx.accounts.maker.key().to_bytes(),
            &ctx.accounts.offer.id.to_le_bytes(),
            &[ctx.bumps.offer],
        ]];

        let transfer_accounts = TransferChecked {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.taker_token_account_a.to_account_info(),
            mint: ctx.accounts.token_mint_a.to_account_info(),
            authority: ctx.accounts.offer.to_account_info(),
        };

        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_accounts,
            &signer_seeds,
        );

        transfer_checked(
            cpi_context,
            ctx.accounts.offer.token_a_offered_amount,
            ctx.accounts.token_mint_a.decimals,
        )
        .unwrap();

        let transfer_accounts: TransferChecked<'_> = TransferChecked {
            from: ctx.accounts.taker_token_account_b.to_account_info(),
            to: ctx.accounts.maker_token_account_b.to_account_info(),
            mint: ctx.accounts.token_mint_b.to_account_info(),
            authority: ctx.accounts.taker.to_account_info(),
        };

        let cpi_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_accounts,
        );

        transfer_checked(
            cpi_context,
            offer.token_b_wanted_amount,
            ctx.accounts.token_mint_b.decimals,
        )
        .unwrap();

        ctx.accounts
            .offer
            .close(ctx.accounts.maker.to_account_info())
            .map_err(|_| EscrowError::CloseAccountError)?;

        Ok(())
    }
}

// Add custom error codes for Anchor
#[error_code]
pub enum EscrowError {
    #[msg("The vault token A amount does not match the offer.")]
    InvalidVaultAmount,
    #[msg("Failed to close the offer account.")]
    CloseAccountError,
}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct MakeOffer<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    pub token_mint_a: InterfaceAccount<'info, Mint>,
    pub token_mint_b: InterfaceAccount<'info, Mint>,

    #[account(mut,
        associated_token::authority = maker,
        associated_token::mint = token_mint_a,
        )]
    pub maker_token_account_a: InterfaceAccount<'info, TokenAccount>,

    #[account(init,
        payer = maker,
        seeds = [b"offer", maker.key().as_ref(), id.to_le_bytes().as_ref()],
        space = 8 + INIT_SPACE,
        bump
    )]
    pub offer: Account<'info, Offer>,

    #[account(init,
        payer = maker,
        associated_token::mint = token_mint_a,
        associated_token::authority = offer,
        associated_token::token_program = token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
}

// Taker --> calls take_offer instruction created by Maker
// Taker --> sends token B to Maker
// Taker --> receives token A from vault
#[derive(Accounts)]
#[instruction(id: u64)]
pub struct TakeOffer<'info> {
    // accounts
    // 1. Signer
    // 2. Token Mint B
    // 3. Taker Associated Token Account for Token A
    // 4. Maker Token Associated Token Account for Token B
    // 5. Token Mint A
    // 5. Token Program
    // 6. Vault Token Account for Token Account A
    // 7. Taker Token Associated Token Account for Token B
    // 8. Offer
    #[account(mut)]
    pub taker: Signer<'info>,

    #[account(mut)]
    /// CHECK: This account is verified through the PDA seeds
    pub maker: AccountInfo<'info>,

    #[account(mut)]
    pub token_mint_a: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub token_mint_b: InterfaceAccount<'info, Mint>,
    #[account(init_if_needed,
        payer = taker,
        associated_token::authority = taker,
        associated_token::mint = token_mint_a,
        associated_token::token_program = token_program,
    )]
    pub taker_token_account_a: InterfaceAccount<'info, TokenAccount>,

    #[account(mut,
        associated_token::authority = taker,
        associated_token::mint = token_mint_b,
        associated_token::token_program = token_program,
    )]
    pub taker_token_account_b: InterfaceAccount<'info, TokenAccount>,

    #[account(mut,
        associated_token::authority = maker,
        associated_token::mint = token_mint_b,
        associated_token::token_program = token_program,
    )]
    pub maker_token_account_b: InterfaceAccount<'info, TokenAccount>,

    #[account(mut,
        associated_token::authority = offer,
        associated_token::mint = token_mint_a
        )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        close = maker,
        seeds = [b"offer", maker.key().as_ref(), id.to_le_bytes().as_ref()],
        bump
    )]
    pub offer: Account<'info, Offer>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    // We must specify the space in order to initialize an account.
    // First 8 bytes are default account discriminator,
    // next 8 bytes come from NewAccount.data being type u64.
    // (u64 = 64 bits unsigned integer = 8 bytes)
    #[account(init, payer = signer, space = 8 + 8)]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct NewAccount {
    data: u64,
}

#[account]
pub struct Offer {
    pub maker: Pubkey,
    id: u64,
    pub token_mint_a: Pubkey,
    pub token_mint_b: Pubkey,
    pub token_a_offered_amount: u64,
    pub token_b_wanted_amount: u64,
}
