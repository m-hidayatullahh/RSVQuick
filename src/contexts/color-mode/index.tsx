import { ThemeProvider } from "@mui/material/styles";
import { RefineThemes } from "@refinedev/mui";
import React, {
  PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from "react";

type ColorModeContextType = {
  mode: string;
  setMode: () => void;
};

export const ColorModeContext = createContext<ColorModeContextType>(
  {} as ColorModeContextType
);

export const ColorModeContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  // Default "light" — hormati pilihan user yang disimpan di localStorage,
  // tapi abaikan preferensi system (sebelumnya kalau OS dark, app ikut dark).
  const colorModeFromLocalStorage = localStorage.getItem("colorMode");
  const [mode, setMode] = useState(colorModeFromLocalStorage || "light");

  useEffect(() => {
    window.localStorage.setItem("colorMode", mode);
  }, [mode]);

  const setColorMode = () => {
    if (mode === "light") {
      setMode("dark");
    } else {
      setMode("light");
    }
  };

  return (
    <ColorModeContext.Provider
      value={{
        setMode: setColorMode,
        mode,
      }}
    >
      <ThemeProvider
        // you can change the theme colors here. example: mode === "light" ? RefineThemes.Magenta : RefineThemes.MagentaDark
        theme={
          mode === "light" ? RefineThemes.Magenta : RefineThemes.MagentaDark
        }
      >
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
