import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_URL = (
  import.meta.env.VITE_SITE_URL || "https://rsvp.jakcation.id"
).replace(/\/$/, "");
const SITE_NAME = "Jakcation RSVPQuick";
const DEFAULT_TITLE = `${SITE_NAME} | Buat & Kelola Undangan RSVP Online dengan Cepat`;
const DEFAULT_DESCRIPTION =
  "Platform untuk membuat, menyebar, dan mengelola undangan RSVP acara secara online. Kustomisasi kartu, QR Code, dan pantau kehadiran tamu realtime.";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

export interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
  canonical?: string;
}

export const Seo: React.FC<SeoProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
  canonical,
}) => {
  const location = useLocation();
  const url = canonical || `${SITE_URL}${location.pathname}`;
  const finalTitle = title
    ? `${title} | ${SITE_NAME}`
    : DEFAULT_TITLE;
  const absoluteImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
    </Helmet>
  );
};

export default Seo;
