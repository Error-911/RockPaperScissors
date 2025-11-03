#![allow(non_snake_case)]
#![no_std]
use soroban_sdk::{contract, contracttype, contractimpl, log, Env, Symbol, Address, symbol_short};

use soroban_sdk::String;

// Game choices
#[contracttype]
#[derive(Clone, PartialEq)]
pub enum Choice {
    Rock,
    Paper,
    Scissors,
}

// Game structure to store game details
#[contracttype]
#[derive(Clone)]
pub struct Game {
    pub game_id: u64,
    pub player1: Address,
    pub player2: Address,
    pub bet_amount: i128,
    pub player1_choice: Choice,
    pub player2_choice: Choice,
    pub winner: Address,
    pub is_completed: bool,
}

// Mapping game ID to Game struct
#[contracttype]
pub enum GameBook {
    Game(u64),
}

// Counter for game IDs
const GAME_COUNT: Symbol = symbol_short!("G_COUNT");

#[contract]
pub struct RPSBettingContract;

#[contractimpl]
impl RPSBettingContract {
    
    // Create a new game with a bet amount
    pub fn create_game(env: Env, player1: Address, bet_amount: i128, choice: Choice) -> u64 {
        player1.require_auth();
        
        let mut game_count: u64 = env.storage().instance().get(&GAME_COUNT).unwrap_or(0);
        game_count += 1;
        
        let game = Game {
            game_id: game_count,
            player1: player1.clone(),
            player2: Address::from_string(&String::from_str(&env, "pending")),
            bet_amount,
            player1_choice: choice,
            player2_choice: Choice::Rock, // placeholder
            winner: Address::from_string(&String::from_str(&env, "none")),
            is_completed: false,
        };
        
        env.storage().instance().set(&GameBook::Game(game_count), &game);
        env.storage().instance().set(&GAME_COUNT, &game_count);
        env.storage().instance().extend_ttl(5000, 5000);
        
        log!(&env, "Game created with ID: {}", game_count);
        game_count
    }
    
    // Join an existing game
    pub fn join_game(env: Env, game_id: u64, player2: Address, choice: Choice) {
        player2.require_auth();
        
        let mut game = Self::view_game(env.clone(), game_id);
        
        if game.is_completed {
            log!(&env, "Game already completed!");
            panic!("Game already completed!");
        }
        
        game.player2 = player2.clone();
        game.player2_choice = choice;
        
        env.storage().instance().set(&GameBook::Game(game_id), &game);
        env.storage().instance().extend_ttl(5000, 5000);
        
        log!(&env, "Player 2 joined game: {}", game_id);
    }
    
    // Determine winner and complete the game
    pub fn complete_game(env: Env, game_id: u64) -> Address {
        let mut game = Self::view_game(env.clone(), game_id);
        
        if game.is_completed {
            log!(&env, "Game already completed!");
            panic!("Game already completed!");
        }
        
        let winner = Self::determine_winner(
            env.clone(),
            game.player1_choice.clone(),
            game.player2_choice.clone(),
            game.player1.clone(),
            game.player2.clone(),
        );
        
        game.winner = winner.clone();
        game.is_completed = true;
        
        env.storage().instance().set(&GameBook::Game(game_id), &game);
        env.storage().instance().extend_ttl(5000, 5000);
        
        log!(&env, "Game completed. Winner: {:?}", winner);
        winner
    }
    
    // View game details
    pub fn view_game(env: Env, game_id: u64) -> Game {
        let key = GameBook::Game(game_id);
        
        env.storage().instance().get(&key).unwrap_or(Game {
            game_id: 0,
            player1: Address::from_string(&String::from_str(&env, "none")),
            player2: Address::from_string(&String::from_str(&env, "none")),
            bet_amount: 0,
            player1_choice: Choice::Rock,
            player2_choice: Choice::Rock,
            winner: Address::from_string(&String::from_str(&env, "none")),
            is_completed: false,
        })
    }
    
    // Helper function to determine winner
    fn determine_winner(
        env: Env,
        choice1: Choice,
        choice2: Choice,
        player1: Address,
        player2: Address,
    ) -> Address {
        if choice1 == choice2 {
            log!(&env, "It's a draw!");
            Address::from_string(&String::from_str(&env, "draw"))
        } else if (choice1 == Choice::Rock && choice2 == Choice::Scissors)
            || (choice1 == Choice::Paper && choice2 == Choice::Rock)
            || (choice1 == Choice::Scissors && choice2 == Choice::Paper)
        {
            log!(&env, "Player 1 wins!");
            player1
        } else {
            log!(&env, "Player 2 wins!");
            player2
        }
    }
}