# Reward tier estimate: rule research and implementation

## Official sources

- [Google Skills Arcade 2026 Tiers, June 10](https://discuss.google.dev/t/google-skills-arcade-2026-tiers/371066): Legend 120+/2,500, Champion 95–119/3,000, Ranger 75–94/4,000 and Trooper 50–74/6,000; overflowing tiers cascade downward.
- [Riding the Waterfall in the Cloud, October 8](https://discuss.google.dev/t/riding-the-waterfall-in-the-cloud/402709): the announcement's first post clarifies first-to-cross, not an end-of-season score leaderboard. Allocation is tied to Google's registration/verification timestamp; completion timestamps resolve bonus-batch ties. Checking a third-party calculator earlier does not reserve a place.

Only the announcement author's first post is treated as official policy. Replies discussing whether a previously secured Champion place is retained after a failed Legend upgrade are community interpretations, not a confirmed additional rule.

## Conclusions

A user observed at 128 points while Legend is open has evidence supporting Legend. Seeing zero remaining places later must not erase that evidence. A first observation of 128 points after Legend is full does not prove the user missed Legend: they may have crossed before the counter filled. A current-slot waterfall scenario is therefore separate from inferred historical allocation. The dashboard now shows both the historically supported tier **and** a lower crawler-snapshot waterfall scenario where they differ, including when historical Legend evidence remains and the crawler later reports zero Legend slots. It does not silently downgrade or falsely confirm a reservation.

No numeric probability is emitted. There is no personal queue, Google threshold timestamp or calibrated outcome dataset. Percentage certainty would be fabricated. Increasing 128 to 150 does not itself improve priority over someone who crossed 120 earlier.

## Data and safeguards

Each successful profile analysis creates an observation of the API base score and explicit score-completeness flag. Restoring cached dashboard state, opening the page, changing a local bonus toggle and fake preview profiles create no new score observation. Estimated Facilitator bonuses are excluded; their completion/verification time cannot be reconstructed from a local toggle. This can underestimate the user's actual official tier and is stated in the interface.

The UI pairs an observation only with the most recent actual crawler snapshot at or before the check time. Imported snapshots marked `git-commit` are excluded because their time is not a guaranteed crawl time. A 48-hour maximum pairing age is a conservative product heuristic, not an official Arcade rule. A fresh crawl can still contain stale upstream counts; UI copy expressly says slots may lag. Unknown values never count as zero. The UI exposes the elapsed time between each score check and its paired snapshot (including the supportive historical snapshot). Even a one-minute gap can contain allocation changes. A snapshot older than 48 hours displays an outdated-data warning and cannot drive a current-slot fallback. When crawler slots for a score-qualified tier reach zero, the UI explicitly says that a previously secured slot remains possible, and separately shows the next known available tier or that all eligible pools appear full. Neither case establishes the official result.

History is scoped by profile URL, version and 2026 season in browser localStorage. It contains no badge collection or email. The earliest positive evidence at each threshold is retained alongside at most 40 recent checks (maximum 44 total). The last five checks are visible. Storage denial or corrupt records cannot prevent analysis. Users can delete this profile's evidence; another browser/device has no access to this history. Nothing is uploaded to a new backend.

A later lower score or incomplete classification triggers review instead of silently downgrading the inferred reward. Higher scores do not erase previously observed lower-tier evidence. A higher tier without evidence remains uncertain even if lower-tier evidence exists. No result claims an officially confirmed allocation.

## Verification and scope

Pure inference tests cover 128-point repeated checks, preservation of Legend evidence while the crawler's fallback becomes Champion, crawler-snapshot lag, over-48-hour invalidation of fallback, multiple waterfall levels, all pools full, unknown counts, stale/future/imported times, lower scores, incomplete scores, season boundaries, upgrade uncertainty, bounded retention and malformed storage. Locale tests cover all 13 catalogs and placeholders. Browser visual QA remains subject to the existing managed Next.js preview limitation.

Future work: optional cross-device storage requires a distinct design for profile ownership, retention and data deletion. A historical rate-of-fill chart may describe scenarios but cannot supply an individual's probability without validation against actual allocation outcomes.
