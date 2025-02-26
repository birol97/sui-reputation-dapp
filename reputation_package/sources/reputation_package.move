/*
/// Module: reputation_package
module reputation_package::reputation_package;
*/

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions

module reputation_package::reputation_package {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use reputation_package::nft_registry;

    /// Represents a Dynamic NFT with reputation points
    public struct ReputationNFT has key, store {
        id: UID,
        name: String,
        description: String,
        reputation_points: u64,
        level: u8,
        image_url: String
    }

    /// Creates a new ReputationNFT
    public fun create_reputation_nft(
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        ctx: &mut TxContext
    ) {
        let nft = ReputationNFT {
            id: object::new(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            reputation_points: 0, // Initial reputation points
            level: 1, // Initial level
            image_url: string::utf8(image_url)
        };

        // Transfer the NFT to the transaction sender
        transfer::transfer(nft, tx_context::sender(ctx));
    }

    /// Getter for reputation points
    public fun get_reputation_points(nft: &ReputationNFT): u64 {
        nft.reputation_points
    }

    /// Getter for level
    public fun get_level(nft: &ReputationNFT): u8 {
        nft.level
    }

    /// Getter for name
    public fun get_name(nft: &ReputationNFT): &String {
        &nft.name
    }

    /// Getter for description
    public fun get_description(nft: &ReputationNFT): &String {
        &nft.description
    }

    /// Getter for image URL
    public fun get_image_url(nft: &ReputationNFT): &String {
        &nft.image_url
    }

    public entry fun mint_and_register(
        registry: &mut nft_registry::NFTRegistry,
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        ctx: &mut TxContext
    ) {
        let nft = ReputationNFT {
            id: object::new(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            reputation_points: 0,
            level: 1,
            image_url: string::utf8(image_url)
        };

        let nft_id = object::uid_to_inner(&nft.id);
        let sender = tx_context::sender(ctx);
        
        // Register the NFT before transferring
        nft_registry::register_nft(registry, sender, nft_id, ctx);
        
        // Transfer the NFT to the sender
        transfer::transfer(nft, sender);
    }
}


