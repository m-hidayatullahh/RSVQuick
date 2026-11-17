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
      to="/requests"
      sx={{
        // Dark mode: beri background terang di belakang logo supaya tetap kontras
        // tanpa mengubah warna asli logo.
        bgcolor: isDark ? "#fff" : "transparent",
        px: isDark ? 1 : 0,
        py: isDark ? 0.5 : 0,
        borderRadius: isDark ? 1 : 0,
        display: "inline-flex",
      }}
    >
      <img
        src={collapsed ? "/logo.png" : "/logo.png"}
        width={collapsed ? 25 : size}
        style={{ display: "block" }}
      />
    </Box>
  );
};
