import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

export default function ScrollToTop() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrollY(y);
        const max =
          document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(max > 0 ? Math.min((y / max) * 100, 100) : 0);
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const show = scrollY > 300;

  return (
    <Box
      aria-hidden={!show}
      sx={{
        position: "fixed",
        bottom: { xs: 16, sm: 24, md: 32 },
        right: { xs: 16, sm: 24, md: 32 },
        zIndex: 1300,
        opacity: show ? 1 : 0,
        transform: show
          ? "translateY(0) scale(1)"
          : "translateY(16px) scale(0.85)",
        pointerEvents: show ? "auto" : "none",
        transition:
          "opacity 0.3s ease, transform 0.35s cubic-bezier(.34,1.56,.64,1)",
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "inline-flex",
          width: { xs: 52, md: 60 },
          height: { xs: 52, md: 60 },
        }}
      >
        <CircularProgress
          variant="determinate"
          value={100}
          size="100%"
          thickness={3}
          sx={{ color: (theme) => `${theme.palette.primary.main}22`, position: "absolute", inset: 0 }}
        />
        <CircularProgress
          variant="determinate"
          value={scrollProgress}
          size="100%"
          thickness={3}
          sx={{
            color: "primary.main",
            position: "absolute",
            inset: 0,
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
              transition: "stroke-dashoffset 0.1s linear",
            },
          }}
        />
        <IconButton
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          sx={{
            position: "absolute",
            inset: 4,
            bgcolor: "background.paper",
            boxShadow: 3,
            transition: "transform 0.25s ease, background-color 0.2s ease",
            "&:hover": {
              bgcolor: "primary.main",
              color: "primary.contrastText",
              transform: "scale(1.08)",
            },
          }}
        >
          <KeyboardArrowUpIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
