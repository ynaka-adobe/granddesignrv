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
Audience previews use `?audience=<name>`; Default forces unmatched content, and Clear removes
the override. Built-in automatic rules are `mobile` (below 600px) and `desktop` (600px or above).
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
The existing numeric profile contract is retained: `p=1` is Shopper, `p=2` is Owner,
and `p=3` is Upgrader. Apply still passes `p`, `li` and `region` to the page, where
`head.html` persists `demoProfile` and exposes the same Target profile parameters.
Existing Target activities/offers using IDs 1–3 should be reviewed for the new lifecycle
meaning; this change does not edit remote Target activities or offers.
Legacy persona 4 and invalid values are cleared rather than misidentified as a new persona.
Reset clears persisted demo selections via a one-time `demo-profile-reset` query flag,
which is removed from the page URL after processing.

The interest bars and intent map are illustrative demo weights, not measured data.
The Reflection 315RLTS example illustrates a possible Upgrader experience, not real
customer recognition. No ownership tracking, service-history collection, backend audience
rules, or new experimentation audiences are added.
