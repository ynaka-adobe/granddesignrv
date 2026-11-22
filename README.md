# AEM Block Collection

This project provides a foundation for starting an AEM Edge Delivery Services project. It includes many common blocks and features a project might need.

## DA compatible

This specific repo has been _slightly_ modified to be compatible with DA's live preview.

## Getting started

### 1. Github
1. Use this template to make a new repo.
1. Install [AEM Code Sync](https://github.com/apps/aem-code-sync).

### 2. DA content
1. Browse to https://da.live/start.
2. Follow the steps.

### 3. Local development
1. Clone your new repo to your computer.
1. Install the AEM CLI using your terminal: `sudo npm install -g @adobe/aem-cli`
1. Start the AEM CLI: `aem up`.
1. Open the `{repo}` folder in your favorite code editor and buil something.
1. **Recommended:** Install common npm packages like linting and testing: `npm i`.

## AEM experimentation

The vendored experimentation engine runs before content decoration only on pages declaring
experiment, campaign, or audience metadata. It supports raw DA section metadata and published
EDS section attributes. No new runtime dependencies or Adobe Target configuration are needed;
existing Target, Persona, Generate with AI, and Dynamic Media integrations are retained.

The Sidekick now includes **Audiences**, a local palette listing section audience variants
with Preview buttons, and **Experimentation**, which toggles DA's existing experimentation
panel. Both are available in preview, live, and production, matching SureSmile's configuration.
The engine's separate simulation pill loads only on local and AEM/Helix preview hosts.
Audience previews use `?audience=<name>`; Default and Clear select `audience=default`,
which also clears the saved lifecycle persona. Built-in automatic rules include `mobile`
(below 600px), `desktop` (600px or above),
and `shopper`, `owner`, `lifecycle` for demo persona IDs 1, 2, 3 respectively.
Other audiences need site-specific rules in `scripts/experimentation.js` before activation.
SureSmile's country, dental-interest, locale, insights, and credentials are not copied.

To author an A/B test, create Grand Design RV control and challenger documents, and put
**Experiment**, **Experiment Variants** (links to challengers), and **Experiment Status**
(`Inactive` initially) in the control's Metadata or Section Metadata table. Preview all
documents first; publish them and set status to `Active` only when ready. Do not put the
control experiment metadata on challenger documents. With one challenger, allocation is
50/50 by default. For an experiment named `rv-hero-test`, force previews with
`?experiment=rv-hero-test/control` and `?experiment=rv-hero-test/challenger-1`.
No actual experiment documents are created or activated by this code change.

See the vendored [experiments](plugins/experimentation/documentation/experiments.md),
[audiences](plugins/experimentation/documentation/audiences.md), and
[campaigns](plugins/experimentation/documentation/campaigns.md) authoring guides.
The engine emits existing AEM RUM checkpoints and `aem:experimentation` events.
Inline reporting requires this site's own RUM domain key, entered by an authorized author
in the preview pill, never committed. No additional conversion analytics are installed.

Reference: SureSmile main at `c0d5426f5ce977c323aec00350fbf6ab339d356d`.
Its pre-decoration engine invocation, variant cache revalidation, and Sidekick palette/event
configuration are adapted here. Published section attribute parsing is a local adaptation
of its audience metadata-restoration approach.

## Grand Design RV lifecycle personas

The Persona Sidekick card simulates **Shopper → Owner → Upgrader** as one evolving
relationship, with each stage's goals, needs, content, context, activation and outcomes.
Apply uses the canonical AEM selector: `audience=shopper`, `audience=owner`, or
`audience=lifecycle` (the Upgrader card). It preserves `li`, `region` and unrelated page
parameters, and removes stale `p`/`persona` selectors. `head.html` persists the selected
audience in `demoProfile`, with numeric persona 1/2/3 retained for existing Target parameters
and badge labels. Legacy `p=1|2|3` and `persona=1|2|3` links still work when `audience`
is absent, but an explicit `audience` always wins, including `default`, empty or unsupported
values, which clear the lifecycle selection instead of restoring a stale saved persona.
Existing Target activities/offers using IDs 1–3 should be reviewed for the new lifecycle
meaning; this change does not edit remote Target activities or offers.
Legacy persona 4 and invalid values are cleared rather than misidentified as a new persona.
No persona is a selectable default state in the card. Reset removes both canonical and
legacy selectors and clears persisted demo selections via a one-time `demo-profile-reset` query flag,
which is removed from the page URL after processing.

The interest bars and intent map are illustrative demo weights, not measured data.
The Reflection 315RLTS example illustrates a possible Upgrader experience, not real
customer recognition. No ownership tracking, service-history collection, or backend audience
rules are added.

### Persona carousel audience drafts

The AEM audience rules read explicit `audience` first, then legacy `p`/`persona` selectors
when it is absent, then existing `demoProfile` (page state, localStorage, or cookie).
The Upgrader card remains named
**Upgrader**, while its audience identifier is **lifecycle**. A manual `?audience=shopper`,
`?audience=owner`, or `?audience=lifecycle` updates both the Persona selection and AEM
matching; `?audience=default` keeps the control and clears the saved persona.
No selected/valid lifecycle persona also keeps the control.

Original two-slide carousel content is authored as DA drafts:

| DA document | Purpose |
| --- | --- |
| `/fragments/carousel-hero-shopper` | Model/floorplan discovery and dealer consideration |
| `/fragments/carousel-hero-owner` | How-to, maintenance planning, FAQs and support |
| `/fragments/carousel-hero-lifecycle` | Evolving needs, RV comparison, trade-in/dealer questions |
| `/demo/persona-carousel` | Control with the existing homepage hero and three Audience rows |

The control replaces only its first section; its explanatory second section stays unchanged.
The actual homepage `/index.html` is untouched. To use these variants on the homepage after
review, add **Audience: shopper**, **Audience: owner**, and **Audience: lifecycle** rows to
the hero's Section Metadata table, linking to the corresponding fragment documents above.

Drafts are not previewed or live-published by content creation. Deploy the code and explicitly
preview the three fragments and the control before testing on an AEM preview URL.
Live publication is a separate decision. No randomized experiment is configured.
All images are reused from verified existing Grand Design RV content; the copy makes no
inventory, price, specification, trade-in value or warranty promises.

### Dynamic Media key/value block

Author a two-column **dynamic-media** table:

| dynamic-media | |
| --- | --- |
| assetID | REPLACE_WITH_PUBLISHED_ASSET_ID |
| type | image |
| image preset | hero |
| wid | 1200 |
| fmt | webp |
| qlt | 85 |

Replace the placeholder with an actual published asset ID. The required `assetID` row
selects the asset path; it is never sent as a query parameter. The optional `type` row
selects `https://gdrv.scene7.com/is/image/granddesignrv/` for `image` (the default when
absent), or `https://gdrv.scene7.com/is/content/granddesignrv/` for `content`. `type`
is excluded from query parameters; other supplied values, including empty values, are
rejected. Values are case-insensitive.

`image preset` is a special directive: `hero` or `$hero$` produces
the standalone `$hero$` query token, never an `image preset=...` parameter. `imagePreset`,
`image-preset` and `image_preset` spellings are also accepted. Empty names, unpaired dollar
signs and multiple wrapping are rejected. The example builds:
`https://gdrv.scene7.com/is/image/granddesignrv/REPLACE_WITH_PUBLISHED_ASSET_ID?$hero$&wid=1200&fmt=webp&qlt=85`.
This follows [Adobe's image preset URL syntax](https://experienceleague.adobe.com/en/docs/dynamic-media-classic/using/image-sizing/linking-urls-web-application).
Folder paths such as `folder/asset` are supported. Asset path
segments and query values are encoded, so spaces, ampersands and other special characters
remain literal values. Full URLs, empty path segments and `.`/`..` segments are rejected.
All other rows become query parameters, including empty values; duplicate keys use the
last row (parameter names are case-sensitive, `assetID` and image preset aliases are
case-insensitive). Special characters in preset names are encoded inside the dollar signs.

The block renders the authored URL directly as a responsive image without rewriting
parameters, using the asset ID as its image alternative text. Invalid tables, missing
assets and image-loading failures show an author-visible error; there is no fallback
asset, viewer or template behavior. Existing DM auto-blocking remains unchanged.
The `content` type changes endpoint routing only: the renderer still uses an image.
Only image-decodable content is supported, not arbitrary videos, PDFs or other documents.
