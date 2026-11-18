import React, { useContext } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import { ColorModeContext } from "../../contexts/color-mode";

export const AppIcon: React.FC<{ collapsed?: boolean; size?: number }> = ({
  collapsed = false,
  size = 120,
}) => {
  const { mode } = useContext(ColorModeContext);
  const isDark = mode === "dark";
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="flex-start"
      component={Link}
      to="/"
      sx={{
        display: "inline-flex",
      }}
    >
      <Box
        component="img"
        src={isDark ? "/logo-white.png" : "/logo.png"}
        sx={{
          display: "block",
          width: collapsed
            ? 25
            : { xs: Math.min(size, 80), sm: Math.min(size, 100), md: size },
          height: "auto",
          maxWidth: "100%",
        }}
      />
    </Box>
  );
};
