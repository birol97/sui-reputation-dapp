module reputation_package::nft_registry {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::table::{Self, Table};
    use sui::vec_set::{Self, VecSet};
    use sui::event;

    // Registry to track NFT ownership
    public struct NFTRegistry has key {
        id: UID,
        // Maps user address to their NFT IDs
        user_nfts: Table<address, VecSet<ID>>
    }

    // Events
    public struct NFTRegistered has copy, drop {
        owner: address,
        nft_id: ID
    }

    public struct NFTUnregistered has copy, drop {
        owner: address,
        nft_id: ID
    }

    // Create a new registry
    fun init(ctx: &mut TxContext) {
        let registry = NFTRegistry {
            id: object::new(ctx),
            user_nfts: table::new(ctx)
        };
        // Share the registry as an immutable object
        transfer::share_object(registry);
    }

    // Register an NFT to a user
    public fun register_nft(
        registry: &mut NFTRegistry,
        owner: address,
        nft_id: ID,
        _ctx: &mut TxContext
    ) {
        if (!table::contains(&registry.user_nfts, owner)) {
            table::add(&mut registry.user_nfts, owner, vec_set::empty());
        };
        
        let owner_nfts = table::borrow_mut(&mut registry.user_nfts, owner);
        vec_set::insert(owner_nfts, nft_id);

        event::emit(NFTRegistered { owner, nft_id });
    }

    // Unregister an NFT from a user
    public fun unregister_nft(
        registry: &mut NFTRegistry,
        owner: address,
        nft_id: ID,
        _ctx: &mut TxContext
    ) {
        assert!(table::contains(&registry.user_nfts, owner), 0);
        
        let owner_nfts = table::borrow_mut(&mut registry.user_nfts, owner);
        vec_set::remove(owner_nfts, &nft_id);

        event::emit(NFTUnregistered { owner, nft_id });
    }

    // Get all NFTs owned by a user
    public fun get_user_nfts(registry: &NFTRegistry, owner: address): VecSet<ID> {
        if (table::contains(&registry.user_nfts, owner)) {
            *table::borrow(&registry.user_nfts, owner)
        } else {
            vec_set::empty()
        }
    }

    // Check if a user owns a specific NFT
    public fun has_nft(registry: &NFTRegistry, owner: address, nft_id: &ID): bool {
        if (table::contains(&registry.user_nfts, owner)) {
            let owner_nfts = table::borrow(&registry.user_nfts, owner);
            vec_set::contains(owner_nfts, nft_id)
        } else {
            false
        }
    }
} 