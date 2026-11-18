import { forwardRef, useContext, useImperativeHandle, useRef } from "react";
import Box from "@mui/material/Box";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { ColorModeContext } from "../../contexts/color-mode";

export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as
  | string
  | undefined;

export const captchaEnabled = Boolean(TURNSTILE_SITE_KEY);

export interface CaptchaHandle {
  reset: () => void;
  getResponse: () => string | undefined;
}

interface CaptchaProps {
  onToken: (token: string | null) => void;
}

/**
 * Cloudflare Turnstile captcha wrapper.
 *
 * Returns null when VITE_TURNSTILE_SITE_KEY is not set, so the form continues
 * to work in dev without any widget.
 */
const Captcha = forwardRef<CaptchaHandle, CaptchaProps>(function Captcha(
  { onToken },
  ref,
) {
  const turnstileRef = useRef<TurnstileInstance>(null);
  const { mode } = useContext(ColorModeContext);

  useImperativeHandle(ref, () => ({
    reset: () => {
      turnstileRef.current?.reset();
      onToken(null);
    },
    getResponse: () => turnstileRef.current?.getResponse(),
  }));

  if (!TURNSTILE_SITE_KEY) return null;

  return (
    <Box display="flex" justifyContent="center" my={1}>
      <Turnstile
        ref={turnstileRef}
        siteKey={TURNSTILE_SITE_KEY}
        options={{
          theme: mode === "dark" ? "dark" : "light",
          size: "flexible",
        }}
        onSuccess={(token) => onToken(token)}
        onError={() => onToken(null)}
        onExpire={() => onToken(null)}
      />
    </Box>
  );
});

export default Captcha;
