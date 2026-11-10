# shop-compare

Custom block (no library base). Purpose: product-finder.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: key/value config rows: cell 1 = key (case-insensitive), cell 2 = value. Keys: Data (link to the floor-plan sheet JSON), Category Order (comma-separated), Category / Sleeps / Weight / Length / Hitch-Weight (rich-text tooltips), Dealer Stock Note (rich text), Footnote (text).

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)

## Authored table

| Shop Compare | |
| --- | --- |
| Data | link to the sheet, e.g. `/data/floorplans.json` |
| Category Order | Destination, Travel Trailer, 5th Wheel, Motorized - Class C, Motorized - Class Super C, Motorized - Class B, Toy Hauler - Fifth Wheel, Toy Hauler - Travel Trailers |
| Category | rich text tooltip (p / ul / li / b) |
| Sleeps | rich text tooltip |
| Weight | rich text tooltip |
| Length | rich text tooltip |
| Hitch-Weight | rich text tooltip |
| Dealer Stock Note | rich text shown on Dealer Stock cards |
| Footnote | `*Bathroom Access with slides in` (adds `*` to the Bathroom Access row) |

Only `Data` is required. Keys are case-insensitive; a missing row omits that UI. Categories in the
data but not in `Category Order` are listed after it, alphabetically.

## Data sheet

The block fetches `/content<path>` first (local preview), then `<path>`. Rows with `Show` = `Yes` are
listed. Columns: Year, Brand, Floorplan, Category, Show, Dealer Stock, MSRP, Sleeps, Length,
Length (in), Hitch, UVW, GVWR, Height, Fresh Water, Gray Water, Waste Water, Slides,
Bathroom Access, Image, Details, Inventory, Brochure. Numeric filters strip non-digits; a row with a
missing or non-numeric value (N/A, TBD) passes that range filter. Categories starting with
"Motorized" are filtered on GVWR, all others on UVW.

## UI copy

All UI labels are defaults in the JS and can be overridden from `/placeholders.json` with the keys
in `LABELS` (e.g. `Shop Compare Sort By`, `Shop Compare Status` with `{page}` / `{pages}` tokens).
