# model-subnav

Custom **custom** block. Purpose: sticky model sub-navigation with floorplan dropdown, section jump links and brochure download.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: two columns, three rows. Row 1: model name | Download Brochure link (PDF). Row 2: "Floorplans" | bulleted list, one item per floorplan: thumbnail image, floorplan name linked to its page, then lines "Hitch 3,500", "UVW 15,910", "Length 39' 11"" and optionally "Dealer stock only" (separate lines or one line). Row 3: "Links" | bulleted list of in-page links (Exterior -> #brand-360spin, Construction -> #brand-construction, Specification -> #brand-floorplanspecs, Testimonials -> #brand-testimonials). Floorplans and Links rows are optional.

## Behaviour

- Floorplans button opens a full-width panel of floorplan cards (4 columns from 900px, 2 from 600px, 1 below). Dealer-stock floorplans are greyed with a "Dealer stock only" flag over the drawing.
- Jump links show from 900px up. Below 900px the actions (Download Brochure) fold behind a red toggle at the right end of the bar, as on the source.
- Escape, clicking outside, or focus leaving a menu closes it. Opening one menu closes the other.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
