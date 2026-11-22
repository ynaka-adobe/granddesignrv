# Grand Design RV — Analytics Build Guide

**Purpose:** Instructions for GitHub Copilot to (A) instrument Adobe Analytics tracking on the Edge Delivery Services (EDS) blocks of `granddesignrv` and (B) configure the matching Adobe Analytics report suite.

- **Site:** https://granddesignrv.xsc.demo.adobe.com
- **Content (DA):** https://da.live/#/ynaka-adobe/granddesignrv
- **Code:** https://github.com/ynaka-adobe/granddesignrv
- **Data layer convention:** Adobe Client Data Layer (ACDL) → Web SDK (`alloy`) → Adobe Analytics via Edge / report suite.

---

## 1. Strategy: one evolving customer, three activation modes

Grand Design is managing **one evolving customer relationship** — `SHOP → OWN → UPGRADE → OWN → UPGRADE` — not three separate audiences. The same managed content (RV product info, specs, floorplans, assets, manuals, lifestyle, service info) is **activated differently** per lifecycle stage. Analytics must therefore capture a **lifecycle stage dimension** on every hit and persona-specific success events, so the same page can be measured against Shopper, Owner, and Upgrader goals.

| Persona | Mindset | What analytics must prove | Primary success events |
|---|---|---|---|
| **Shopper** | "Which RV is right for me?" | Turn anonymous interest into qualified purchase intent | Floorplan views, comparisons, inventory searches, dealer locator, quote/lead starts |
| **Owner** | "Help me get the most from the RV I own." | Turn ownership into engagement & loyalty | Registration, manual/how-to views, service/support, event signups |
| **Upgrader** | "What should I move into next?" | Turn relationship into repeat purchase | Upgrade-guide views, model comparisons (owned vs. new), trade-in starts, dealer reconnect |

The **Upgrader** is the differentiator: a known owner returning to the site should be recognized by lifecycle context, not treated as an anonymous shopper.

---

## 2. Global data layer (set on every page)

Copilot: in `scripts/scripts.js`, push a `page` event to the ACDL on load. Derive values from page path and `metadata.json` / page metadata.

```js
window.adobeDataLayer = window.adobeDataLayer || [];
window.adobeDataLayer.push({
  event: 'page-load',
  web: { webPageDetails: {
    name: document.title,
    URL: window.location.href,
    siteSection: deriveSection(location.pathname),   // see §3
    pageType: derivePageType(location.pathname)       // see §3
  }},
  _granddesignrv: {
    lifecycleStage: resolveLifecycleStage(),  // 'shopper' | 'owner' | 'upgrader' | 'unknown'
    rvCategory: deriveCategory(location.pathname),    // travel-trailers | fifth-wheels | toy-haulers | motorized
    brand: deriveBrand(location.pathname),            // e.g. reflection, solitude, lineage-series-vp
    floorplan: deriveFloorplan(location.pathname),    // e.g. 350rds (model detail pages only)
    ownedModel: getOwnedModel()                       // from auth/profile when known, else undefined
  }
});
```

**`resolveLifecycleStage()`** precedence:
1. `upgrader` — known owner (has `ownedModel`) AND browsing shop/compare/new-model content.
2. `owner` — known owner on `/owners/**`, manuals, service, registration content.
3. `shopper` — everyone else browsing product/shop content.
4. `unknown` — fallback before identity resolves.

Owner identity comes from the member/login state (`closed-user-groups.json` gated content is a strong Owner signal). Where no login exists in the demo, derive stage from section + a persisted cookie flag set when the user hits Owner content.

---

## 3. Page classification (siteSection / pageType)

Map the real content tree (confirmed from DA + published pages):

| Path pattern | siteSection | pageType | Default persona |
|---|---|---|---|
| `/` | home | homepage | shopper |
| `/travel-trailers`, `/fifth-wheels`, `/toy-haulers`, `/motorized` | shop | category | shopper |
| `/{category}/{brand}` (e.g. `/fifth-wheels/reflection`) | shop | brand | shopper |
| `/{category}/{brand}/{floorplan}` (e.g. `/fifth-wheels/reflection/350rds`) | shop | floorplan-detail | shopper |
| `/shop-inventory`, `/shopping-tools/inventory-details` | shop | inventory | shopper |
| `/shop-and-compare` | shop | compare | shopper / upgrader |
| `/shopping-tools/find-a-dealer` | shop | dealer-locator | shopper / upgrader |
| `/shopping-tools/factory-tours` | shop | factory-tour | shopper |
| `/ask-an-expert` | support | lead-form | shopper |
| `/owners`, `/owners/**` | owners | owner-hub | owner |
| `/owners/event-calendar` | owners | events | owner |
| manuals / how-to / service / warranty (`/1-3-5-warranty`, `/solar-faqs`) | owners | support-content | owner |
| `/company`, `/company/our-story`, `/destination`, `/foundation` | brand | editorial | shopper |
| upgrade / "what's new" / launch pages (`*-launch`, `/motorized-launch`) | shop | upgrade | upgrader |

---

## 4. Block-level instrumentation

Copilot: add an event decorator in each block's `decorate()` (EDS `blocks/<name>/<name>.js`). Use event delegation on the block root; push ACDL events on interaction. Keep tracking additive — never block rendering.

### 4.1 Shopper blocks

**`cards` / brand grid (homepage "Explore Our Brands", category pages)**
- On "Shop This Brand" / card click → `product-interest`
```js
adobeDataLayer.push({ event:'product-interest', eventInfo:{
  action:'brand-click', brand, rvCategory, listPosition, floorplanCount, baseMSRP }});
```

**`floorplan` cards (brand pages, e.g. Reflection 303RLS…367BHS)**
- On floorplan link click → `floorplan-view-intent`; on floorplan-detail page load → `floorplan-view`
```js
adobeDataLayer.push({ event:'floorplan-view', eventInfo:{
  brand, floorplan, hitchWeight, uvw, length, dealerStockOnly }});
```

**`columns`/specs "Product Line Specifications" table**
- On tab/row expand → `spec-interaction` ({ brand, specGroup }).

**Inventory (`/shop-inventory`, inventory-details) — "Get Started" / location**
- On location submit → `inventory-search` ({ zip, radius, brand?, resultCount }).
- On inventory result click → `inventory-result-click`.

**`find-a-dealer` block**
- On dealer search → `dealer-search` ({ zip, resultCount }).
- On "Get Directions" / dealer select → `dealer-select` ({ dealerId, dealerName }).

**CTA links: "Find Local Inventory", "Shop & Compare", "Request a Quote", "Ask an Expert"**
- → `cta-click` ({ ctaText, destination, persona }). Quote/Ask-an-Expert also fire the lead events in §4.4.

**`shop-and-compare` block**
- On add model to compare → `compare-add` ({ brand, floorplan, compareCount }).
- On compare view (2+ models) → `compare-view` ({ modelsCompared:[...] }).

### 4.2 Owner blocks

**`owners` hub + support content (manuals, how-to, maintenance, warranty, solar-faqs)**
- On manual/how-to open or download → `owner-resource` ({ resourceType:'manual|howto|maintenance|warranty', title, ownedModel }).
- On FAQ expand → `faq-interaction` ({ title, question }).

**`event-calendar` / events block**
- On event signup/RSVP → `event-signup` ({ eventName, eventDate, location }).

**Registration / account**
- On registration complete → `owner-registration` ({ model, modelYear }).

### 4.3 Upgrader blocks

**Upgrade & "what's new" content (featured-innovation carousel, `*-launch` pages, new motorized)**
- On known owner viewing new-model content → `upgrade-consideration` ({ ownedModel, viewedBrand, viewedFloorplan }).

**Compare — owned vs. new (reuse `shop-and-compare`)**
- When one side is the `ownedModel` → `upgrade-compare` ({ ownedModel, candidateModel }).

**Trade-in / reconnect-with-dealer CTAs**
- On trade-in start → `tradein-start` ({ ownedModel }).
- On dealer reconnect → `dealer-reconnect` ({ ownedModel, dealerId }).

### 4.4 Conversion / lead blocks (shared)

**`form` / `ask-an-expert` / `grand-design-marketing-requests` / quote**
- On form view → `lead-form-view` ({ formName, persona }).
- On form start (first field focus) → `lead-form-start`.
- On submit success → `lead-submit` ({ formName, leadType:'quote|expert|marketing|tradein', persona, brand?, floorplan? }).

---

## 5. Web SDK (alloy) → XDM & Analytics mapping

Copilot: add an ACDL event-listener bridge that converts each pushed event into an `alloy('sendEvent', …)` XDM payload. Map to Adobe Analytics via the Edge datastream's Analytics mapping (or Web SDK → AA bridge). Use `web.webPageDetails.name` as the page name and `commerce`/custom `_granddesignrv` XDM group for persona fields.

```js
window.adobeDataLayer.push(function () {
  this.addEventListener('floorplan-view', (e) => {
    alloy('sendEvent', { xdm: {
      eventType: 'web.webpagedetails.pageViews',
      web: { webPageDetails: { name: e.web?.webPageDetails?.name, pageViews:{ value:1 } } },
      _granddesignrv: { lifecycleStage, rvCategory:e.rvCategory, brand:e.eventInfo.brand,
                        floorplan:e.eventInfo.floorplan, floorplanView:1 }
    }});
  });
  // repeat per event name in §4
});
```

---

## 6. Adobe Analytics report suite configuration

Create/configure one report suite (e.g. `granddesignrv-prod`, dev `granddesignrv-dev`). Set: time zone, currency USD, default page = Home, internal URL filters for `*.xsc.demo.adobe.com`.

### 6.1 Success events

| # | Event name | Type | Persona | Serialization |
|---|---|---|---|---|
| event1 | Floorplan Views | Counter | Shopper | event |
| event2 | Inventory Searches | Counter | Shopper | — |
| event3 | Dealer Searches | Counter | Shopper/Upgrader | — |
| event4 | Dealer Selects | Counter | Shopper/Upgrader | — |
| event5 | Compare Adds | Counter | Shopper/Upgrader | — |
| event6 | Compare Views | Counter | Shopper/Upgrader | — |
| event7 | Lead Form Views | Counter | All | — |
| event8 | Lead Form Starts | Counter | All | — |
| event9 | Lead Submits | Counter | All | event (unique by form id) |
| event10 | Owner Resource Views | Counter | Owner | — |
| event11 | Owner Registrations | Counter | Owner | event |
| event12 | Event Signups | Counter | Owner | event |
| event13 | Upgrade Consideration | Counter | Upgrader | — |
| event14 | Upgrade Compares | Counter | Upgrader | — |
| event15 | Trade-in Starts | Counter | Upgrader | event |
| event16 | Brand/Product Interest Clicks | Counter | Shopper | — |
| event17 | CTA Clicks | Counter | All | — |

### 6.2 eVars (conversion / persistence)

| # | eVar | Expiration | Allocation | Source |
|---|---|---|---|---|
| eVar1 | Lifecycle Stage | Visit | Most Recent | `lifecycleStage` |
| eVar2 | RV Category | Hit→Visit | Most Recent | `rvCategory` |
| eVar3 | Brand | Visit | Most Recent | `brand` |
| eVar4 | Floorplan | Visit | Most Recent | `floorplan` |
| eVar5 | Owned Model | Visit (persist) | Most Recent | `ownedModel` |
| eVar6 | Page Type | Hit | Most Recent | `pageType` |
| eVar7 | Site Section | Hit | Most Recent | `siteSection` |
| eVar8 | CTA Text | Hit | Most Recent | `ctaText` |
| eVar9 | Form Name | Visit | Most Recent | `formName` |
| eVar10 | Lead Type | Visit | Most Recent | `leadType` |
| eVar11 | Dealer Name | Visit | Most Recent | `dealerName` |
| eVar12 | Compare Set | Hit | Most Recent | `modelsCompared` |
| eVar13 | Base MSRP Band | Hit | Most Recent | derived from `baseMSRP` |

### 6.3 props (traffic)

| # | prop | Source |
|---|---|---|
| prop1 | Lifecycle Stage | `lifecycleStage` |
| prop2 | Page Type | `pageType` |
| prop3 | Site Section | `siteSection` |
| prop4 | Brand | `brand` |
| prop5 | Floorplan | `floorplan` |

### 6.4 Marketing channels / classifications
- Classify **Brand** (eVar3) by `rvCategory` and towable-vs-motorized.
- Classify **Floorplan** (eVar4) by length / UVW bands and `dealerStockOnly`.

---

## 7. Segments & funnels (build in Analysis Workspace)

**Segments**
- Shopper / Owner / Upgrader (eVar1 = each stage).
- Known Owner (eVar5 is set).
- Motorized intent (eVar2 = motorized).

**Shopper funnel:** brand view → floorplan view (event1) → inventory search (event2) → dealer search (event3) → lead submit (event9).
**Owner funnel:** registration (event11) → owner resource (event10) → event signup (event12).
**Upgrader funnel:** upgrade consideration (event13) → upgrade compare (event14) → trade-in start (event15) → lead submit (event9) scoped to Known Owner.

---

## 8. QA checklist
- [ ] `page-load` fires once per page with correct `siteSection`/`pageType`/`rvCategory`/`brand`/`floorplan`.
- [ ] Lifecycle stage resolves and persists across pages within a visit.
- [ ] Each block event fires once per interaction (no double-fire on delegated clicks).
- [ ] Known-owner path flips stage to `owner`/`upgrader`.
- [ ] All events land on the correct eVar/event in the report suite (validate with Edge debugger / AA debugger).
- [ ] No PII in eVars/props (dealer/zip handling reviewed).
