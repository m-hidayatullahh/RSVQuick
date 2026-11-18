import { useEffect } from "react";

const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;
const PLAUSIBLE_HOST =
  (import.meta.env.VITE_PLAUSIBLE_HOST as string | undefined) || "https://plausible.io";

export function Analytics() {
  useEffect(() => {
    if (!PLAUSIBLE_DOMAIN) return;
    if (document.querySelector('script[data-domain]')) return;

    const script = document.createElement("script");
    script.defer = true;
    script.setAttribute("data-domain", PLAUSIBLE_DOMAIN);
    script.src = `${PLAUSIBLE_HOST.replace(/\/$/, "")}/js/script.js`;
    document.head.appendChild(script);
  }, []);

  return null;
}

export default Analytics;
