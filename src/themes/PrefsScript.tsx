import { DEFAULT_STYLE, STYLE_KEYS } from "@/themes/designStyles";
import {
  BRAND_FONT_KEYS,
  BRAND_FONTS,
  BRAND_NAME_MAX,
  BRAND_PARAM,
  BRAND_STORAGE_KEY,
  BUSINESS_TYPES,
  brandVarsFor,
  decodeBrandRaw,
} from "@/themes/brand";

/**
 * Pre-paint script: applies the persisted style + color scheme (or ?style=)
 * to <html> before first paint, so switching styles never flashes Swiss.
 * Also applies the visitor's brand (localStorage or ?brand=) as CSS vars +
 * data-brand, using the same self-contained functions as the client
 * (brandVarsFor / decodeBrandRaw are inlined via toString).
 * PrefsApplier / BrandApplier keep it in sync after hydration.
 */
const code = `(function(){var d=document.documentElement;try{
var keys=${JSON.stringify(STYLE_KEYS)};
var s="${DEFAULT_STYLE}",c="light";
var raw=localStorage.getItem("showcase-prefs");
if(raw){var st=(JSON.parse(raw)||{}).state||{};if(keys.indexOf(st.style)>-1)s=st.style;if(st.colorScheme==="dark")c="dark";}
var q=new URLSearchParams(location.search).get("style");if(keys.indexOf(q)>-1)s=q;
d.setAttribute("data-style",s);d.setAttribute("data-color-scheme",c);
}catch(e){}
try{
var bv=(${brandVarsFor.toString()}),bd=(${decodeBrandRaw.toString()}),bf=${JSON.stringify(BRAND_FONTS)};
var b=null,rb=localStorage.getItem(${JSON.stringify(BRAND_STORAGE_KEY)});
if(rb){b=((JSON.parse(rb)||{}).state||{}).brand||null;}
var qb=bd(new URLSearchParams(location.search).get(${JSON.stringify(BRAND_PARAM)}),${JSON.stringify(BRAND_FONT_KEYS)},${JSON.stringify(BUSINESS_TYPES)},${BRAND_NAME_MAX});
if(qb)b=qb;
if(b&&/^#[0-9a-f]{6}$/.test(b.color)){var r=bv(b.color,bf[b.font]||null);for(var k in r.vars)d.style.setProperty(k,r.vars[k]);d.setAttribute("data-brand",r.focus);if(r.font)d.setAttribute("data-brand-font","");}
}catch(e){}})();`;

/** Exported for tests (the script is executed against jsdom). */
export const PREFS_SCRIPT = code;

export default function PrefsScript() {
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
