use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;

// pub mod instructions;

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("CDU3DctPC1v7C8rNCU3jX9pBFY9GyP1CSdrjsL42pujh");

pub const ANCHOR_DISCRIMINATOR: u8 = 8;

#[program]
mod escrow {
    use super::*;

    pub fn make_offer(
        ctx: Context<MakeOffer>,
        id: u64,
        token_a_offered_amount: u64,
        token_b_wanted_amount: u64,
    ) -> Result<()> {
        msg!("Hello");

        ctx.accounts.offer.set_inner(Offer {
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
        );

        Ok(())
    }

    pub fn take_offer() -> Result<()> {
        Ok(())
    }
    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        ctx.accounts.new_account.data = data;
        msg!("Changed data to: {}!", data); // Message will show up in the tx logs
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct MakeOffer<'info> {
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
        space = 8 + Offer::INIT_SPACE,
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
#[derive(InitSpace)]
pub struct Offer {
    pub maker: Pubkey,
    pub token_mint_a: Pubkey,
    pub token_mint_b: Pubkey,
    pub token_a_offered_amount: u64,
    pub token_b_wanted_amount: u64,
}
