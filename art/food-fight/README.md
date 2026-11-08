# Food Fight v1 artwork

Derived locally from the approved hand-drawn mockups in `art/food-fight/mockups/` outside the arcade tree. No new image-generation call needed.

- `strawberry-pip.png`: one complete strawberry from card_7_strawberry.png; background flood-trimmed to transparency.
- `lemon-pip.png`: one complete lemon from rule_card_v2.png, background trimmed.
- `muffin.png`: fallback friend from rule_card_v2.png, stray placemat/name-tag fragments removed.
- `wild.png`, `back.png`: cropped and downscaled approved cards.

Numbered cards are rendered in HTML with exact classic pip positions, rather than reusing a picture with a fixed numeral or a guessed number of pips. The rule card is live HTML, not a flattened mockup, so it fits phone and tablet and uses the current player's friend.
