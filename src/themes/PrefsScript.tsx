import { DEFAULT_STYLE, STYLE_KEYS } from "@/themes/designStyles";

/**
 * Pre-paint script: applies the persisted style + color scheme (or ?style=)
 * to <html> before first paint, so switching styles never flashes Swiss.
 * PrefsApplier keeps it in sync after hydration.
 */
const code = `(function(){try{
var keys=${JSON.stringify(STYLE_KEYS)};
var d=document.documentElement,s="${DEFAULT_STYLE}",c="light";
var raw=localStorage.getItem("showcase-prefs");
if(raw){var st=(JSON.parse(raw)||{}).state||{};if(keys.indexOf(st.style)>-1)s=st.style;if(st.colorScheme==="dark")c="dark";}
var q=new URLSearchParams(location.search).get("style");if(keys.indexOf(q)>-1)s=q;
d.setAttribute("data-style",s);d.setAttribute("data-color-scheme",c);
}catch(e){}})();`;

export default function PrefsScript() {
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
