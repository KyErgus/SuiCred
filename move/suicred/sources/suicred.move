module suicred::suicred {
    use sui::coin::{Self, Coin};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    const PRICE: u64 = 1_000_000_000; // 1 SUI
    const TREASURY: address = @0xce5c72750ddcbfbead5c3690c580a7835eab6dacfef98f36cb167fc9f351e87f;

    struct SuiCredBadge has key, store {
        id: UID,
        score: u64,
        tier: vector<u8>
    }

    public entry fun mint_score(
        score: u64,
        tier: vector<u8>,
        payment: Coin<sui::sui::SUI>,
        ctx: &mut TxContext
    ) {
        assert!(coin::value(&payment) == PRICE, 0);

        transfer::public_transfer(payment, TREASURY);

        let badge = SuiCredBadge {
            id: object::new(ctx),
            score,
            tier
        };
        transfer::transfer(badge, tx_context::sender(ctx));
    }
}
