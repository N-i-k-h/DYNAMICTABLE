import { IconButton, Tooltip } from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { setThemeMode } from "../store/tableSlice";

export default function ThemeToggle() {
  const mode = useSelector((s: RootState) => s.table.themeMode);
  const dispatch = useDispatch();
  const next = mode === "light" ? "dark" : "light";
  return (
    <Tooltip title={`Switch to ${next} mode`}>
      <IconButton
        onClick={() => dispatch(setThemeMode(next))}
        aria-label="toggle theme"
        size="large"
      >
        {mode === "light" ? <DarkMode /> : <LightMode />}
      </IconButton>
    </Tooltip>
  );
}
