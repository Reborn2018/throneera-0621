# Product and conversion decisions

## Primary metric

Contribution margin per paid click cohort, not raw click-through rate.

Track separately:

- landing → start
- start → personalized consequence
- consequence → paywall
- paywall → checkout
- checkout → verified purchase
- purchase → paid completion
- completion → cross-sell/replay/bundle purchase
- refund/dispute rate

## Paywall trigger

Use narrative milestones, not elapsed time. A user must first see that the world remembers them. Target 3.5–5 minutes for cold traffic; test faster versus standard only after the baseline is stable.

## First-purchase value

The first paid scene must immediately answer the cliffhanger and reuse the user's choice/wording. The user should perceive value before another long exposition block.

## Session length

Aim for roughly 12–18 minutes of paid play. Density matters more than word count. Prefer a consequential decision or character reversal every 1.5–2.5 minutes.

## Replay economics

A replay is a new paid campaign, but it will convert only when the product visibly promises a different historical path. Each major route needs exclusive scenes, a different relationship reversal, a different climax consequence, and a meaningfully different ending.

## Upgrade strategy

MVP:

- sell the current campaign;
- cross-sell the other completed simulator after the ending;
- expose same-theme replay with a “new campaign, separate payment” disclosure;
- keep bundles/credits behind a feature flag until the promised inventory exists;
- do not launch a subscription with only two campaigns.

After sufficient inventory and purchase data, test a real multi-campaign credit pack before testing a subscription.

## Experiment order

1. Queen vs Napoleon theme demand at identical price and funnel structure.
2. Faster vs standard milestone sequence on the winning theme.
3. Price or real bundle test.
4. Ending CTA ordering and cross-sell offer.

Do not change theme, price, paywall timing, and package simultaneously.
