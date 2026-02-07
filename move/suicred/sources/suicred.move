module suicred::suicred {
    use sui::coin::{Self, Coin};
    use sui::display;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    const PRICE: u64 = 10_000_000; // 0.01 SUI
    const TREASURY: address = @0xce5c72750ddcbfbead5c3690c580a7835eab6dacfef98f36cb167fc9f351e87f;

    struct SuiCredBadge has key, store {
        id: UID,
        score: u64,
        tier: vector<u8>,
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>
    }

    public entry fun init_display(ctx: &mut TxContext) {
        let mut d = display::new<SuiCredBadge>(ctx);
        display::add(&mut d, b"name", b"{name}");
        display::add(&mut d, b"description", b"{description}");
        display::add(&mut d, b"image_url", b"{image_url}");
        display::add(&mut d, b"score", b"{score}");
        display::add(&mut d, b"tier", b"{tier}");
        display::update_version(&mut d);
        display::share(d);
    }

    fun tier_for_score(score: u64): vector<u8> {
        if (score >= 500) {
            b"Sui"
        } else if (score >= 350) {
            b"Diamond"
        } else if (score >= 300) {
            b"Gold"
        } else if (score >= 200) {
            b"Silver"
        } else {
            b"Bronze"
        }
    }

    public entry fun mint_score(score: u64, image_url: vector<u8>, payment: Coin<sui::sui::SUI>, ctx: &mut TxContext) {
        assert!(coin::value(&payment) == PRICE, 0);

        transfer::public_transfer(payment, TREASURY);

        let tier = tier_for_score(score);
        let name = b"SuiCred Score Card";
        let description = b"SuiCred on-chain reputation card.";
        let badge = SuiCredBadge {
            id: object::new(ctx),
            score,
            tier,
            name,
            description,
            image_url
        };
        transfer::transfer(badge, tx_context::sender(ctx));
    }
}
