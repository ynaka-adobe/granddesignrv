/* eslint-disable no-console */
/**
 * Builds the Shop and Compare data sheet (content/data/floorplans.json, EDS sheet format) from the
 * source site's floor plan feed. Re-run to refresh the snapshot:
 *
 *   node tools/importer/data/build-floorplans.mjs [--feed <file.json>] [--shown <titles.json>]
 *
 * --feed   use a saved copy of https://www.granddesignrv.com/bin/fetchAllFloorPlanDetails
 * --shown  JSON array of card titles ("2027 Transcend ONE 151BH") the source listing shows;
 *          rows in it get Show = Yes, all others No. Without it, existing Show values in the
 *          sheet are kept and new rows default to Yes when they have a category and a price.
 */
import fs from 'fs';

const FEED_URL = 'https://www.granddesignrv.com/bin/fetchAllFloorPlanDetails?nocache=true';
const SOURCE = 'https://www.granddesignrv.com';
const OUT = 'content/data/floorplans.json';
const IMAGE_RENDITION = '/jcr:content/renditions/cq5dam.web.1280.1280.jpeg';

// details-page path and inventory modelName per brand, as the source listing links them
// (Transcend Lite and Momentum MAV Fifth Wheel are not listed on the source; their paths come from
// the Shop menu)
const BRAND_LINKS = {
  Foundation: ['/destination/foundation', 'Foundation'],
  Imagine: ['/travel-trailers/imagine', 'Imagine'],
  'Imagine AIM': ['/travel-trailers/imagine-aim', 'Imagine-AIM'],
  'Imagine XLS': ['/travel-trailers/imagine-xls', 'Imagine-XLS'],
  Influence: ['/fifth-wheels/influence', 'Influence'],
  'Lineage Series E': ['/motorized/lineage-series-e', 'Lineage Series E'],
  'Lineage Series F': ['/motorized/lineage-series-f', 'Lineage-series-f'],
  'Lineage Series M': ['/motorized/lineage-series-m', 'Lineage-series-m'],
  'Lineage Series VP': ['/motorized/lineage-series-vp', 'Lineage-series-vp'],
  'Lineage Series VT': ['/motorized/lineage-series-vt', 'Lineage-series-vt'],
  Momentum: ['/toy-haulers/momentum', 'momentum'],
  'Momentum G-Class Fifth Wheel': ['/toy-haulers/momentum-g-class', 'momentum-g-class'],
  'Momentum G-Class Travel Trailer': ['/toy-haulers/momentum-g-class-travel-trailers', 'momentum-g-class-travel-trailers'],
  'Momentum MAV': ['/toy-haulers/momentum-mav', 'momentum-mav'],
  'Momentum MAV Fifth Wheel': ['/toy-haulers/momentum-mav-fifth-wheels', 'momentum-mav-fifth-wheels'],
  'Momentum MAV Travel Trailer': ['/toy-haulers/momentum-mav', 'momentum-mav'],
  Reflection: ['/fifth-wheels/reflection', 'Reflection'],
  'Reflection 100 Series': ['/fifth-wheels/reflection-100-series', 'Reflection-100'],
  'Reflection 150 Series': ['/fifth-wheels/reflection-150-series', 'Reflection-150'],
  'Reflection Travel Trailer': ['/travel-trailers/reflection-travel-trailer', 'Reflection-Travel-Trailer'],
  Solitude: ['/fifth-wheels/solitude', 'Solitude'],
  Transcend: ['/travel-trailers/transcend', 'Transcend'],
  'Transcend Lite': ['/travel-trailers/transcend-lite', 'Transcend-lite'],
  'Transcend ONE': ['/travel-trailers/transcend-one', 'Transcend-one'],
  'Transcend XPLOR': ['/travel-trailers/transcend-xplor', 'Transcend-xplor'],
};

// brands the feed leaves uncategorised, filled in from where the Shop menu lists them
const CATEGORY_FALLBACK = {
  'Transcend Lite': 'Travel Trailer',
  'Momentum MAV Fifth Wheel': 'Toy Hauler - Fifth Wheel',
  'Momentum MAV Travel Trailer': 'Toy Hauler - Travel Trailers',
};

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : null;
};
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const clean = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
const absolute = (path) => (path ? new URL(path, SOURCE).href : '');

const feedFile = arg('--feed');
const feed = feedFile ? readJson(feedFile) : await (await fetch(FEED_URL)).json();
const shownFile = arg('--shown');
const shown = shownFile ? new Set(readJson(shownFile)) : null;
const previous = fs.existsSync(OUT)
  ? Object.fromEntries(readJson(OUT).data.map((r) => [`${r.Year} ${r.Brand} ${r.Floorplan}`, r.Show]))
  : {};

const brands = Object.fromEntries(feed.brands.map((b) => [b.brandName, b]));
const priced = (msrp) => /\d/.test(msrp || '');

const data = feed.floorplans.map((f) => {
  const brand = brands[f.brand] || {};
  const category = clean(brand.brandCategory) || CATEGORY_FALLBACK[f.brand] || '';
  const [path, modelName] = BRAND_LINKS[f.brand] || [];
  if (!path) console.warn(`no link pattern for brand "${f.brand}"`);
  const title = `${f.modelYear} ${f.brand} ${f.trueName}`;
  let show;
  if (shown) show = shown.has(title);
  else if (previous[title]) show = previous[title] === 'Yes';
  else show = Boolean(clean(brand.brandCategory)) && priced(f.msrp);
  return {
    Year: clean(f.modelYear),
    Brand: clean(f.brand),
    Floorplan: clean(f.trueName),
    Category: category,
    Show: show ? 'Yes' : 'No',
    'Dealer Stock': f.isDealerStock === 'true' ? 'Yes' : 'No',
    MSRP: clean(f.msrp),
    Sleeps: clean(f.sleeps),
    Length: clean(f.fieldLength),
    'Length (in)': clean(f.fieldInches).replace(/"/g, ''),
    Hitch: clean(f.fieldHitch),
    UVW: clean(f.fieldUvw),
    GVWR: clean(f.fieldGVWR),
    Height: clean(f.fieldHeight),
    'Fresh Water': clean(f.freshWaterCapacity),
    'Gray Water': clean(f.grayWater),
    'Waste Water': clean(f.wasteWater),
    Slides: clean(f.fieldNumSlides),
    'Bathroom Access': clean(f.bathroomAccess),
    Image: f.floorplanImage ? absolute(`${f.floorplanImage}${IMAGE_RENDITION}`) : '',
    Details: path ? `${path}/${clean(f.trueName).toLowerCase()}` : '',
    Inventory: path ? `/shopping-tools/inventory-details?modelName=${encodeURIComponent(modelName)}&floorPlan=${encodeURIComponent(clean(f.trueName))}` : '',
    Brochure: clean(brand.brochureLink),
  };
});

const sheet = {
  total: data.length, offset: 0, limit: data.length, data, ':type': 'sheet',
};
fs.mkdirSync('content/data', { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(sheet, null, 2)}\n`);
console.log(`wrote ${OUT}: ${data.length} floor plans, ${data.filter((r) => r.Show === 'Yes').length} shown`);
