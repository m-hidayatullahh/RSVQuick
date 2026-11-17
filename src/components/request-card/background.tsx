import React from "react";
import Box from "@mui/material/Box";
import { lighten } from "@mui/material/styles";
import tc from "tinycolor2";

export default function Background({
  children,
  backgroundColor,
  backgroundImage,
  responseView = false,
  background_gradient = false,
}: {
  children: React.ReactNode;
  backgroundColor: string;
  backgroundImage?: string | null;
  background_gradient?: boolean;
  responseView?: boolean;
}) {
  const bgStyle = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : {
        background: background_gradient
          ? `radial-gradient(${lighten(backgroundColor || "#eee", 0.3)}, ${backgroundColor}, ${tc(backgroundColor || "#eee")
              .analogous()
              .toString()})`
          : backgroundColor,
      };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor={backgroundImage ? "transparent" : backgroundColor}
      sx={bgStyle}
      padding={{ xs: 1, md: 8 }}
      minHeight={responseView ? "100vh" : "100%"}
    >
      {children}
    </Box>
  );
}
