import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Column {
  id: string;
  label: string;
  visible: boolean;
}

export interface Row {
  id: number;
  name: string;
  email: string;
  age: number;
  role: string;
  [key: string]: any;
}

interface TableState {
  rows: Row[];
  columns: Column[];
  search: string;
  themeMode: "light" | "dark";
}

const initialState: TableState = {
  rows: [
    { id: 1, name: "Alice", email: "alice@example.com", age: 25, role: "Developer" },
    { id: 2, name: "Bob", email: "bob@example.com", age: 30, role: "Designer" },
  ],
  columns: [
    { id: "name", label: "Name", visible: true },
    { id: "email", label: "Email", visible: true },
    { id: "age", label: "Age", visible: true },
    { id: "role", label: "Role", visible: true },
  ],
  search: "",
  themeMode: (localStorage.getItem("themeMode") as "light" | "dark") || "light",
};

const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    setRows(state, action: PayloadAction<Row[]>) {
      state.rows = action.payload;
    },
    addColumn(state, action: PayloadAction<string>) {
      state.columns.push({ id: action.payload, label: action.payload, visible: true });
    },
    toggleColumnVisibility(state, action: PayloadAction<string>) {
      const column = state.columns.find(c => c.id === action.payload);
      if (column) column.visible = !column.visible;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    updateRow(state, action: PayloadAction<Row>) {
      const idx = state.rows.findIndex(r => r.id === action.payload.id);
      if (idx !== -1) state.rows[idx] = action.payload;
    },
    deleteRow(state, action: PayloadAction<number>) {
      state.rows = state.rows.filter(r => r.id !== action.payload);
    },
    reorderColumns(state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) {
      const { fromIndex, toIndex } = action.payload;
      const visible = state.columns.filter(c => c.visible);
      const hidden = state.columns.filter(c => !c.visible);
      const moved = [...visible];
      const [spliced] = moved.splice(fromIndex, 1);
      moved.splice(toIndex, 0, spliced);
      // Merge visible + hidden
      state.columns = [...moved, ...hidden];
    },

    // 👇 NEW: reorderRows reducer
    reorderRows(state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) {
      const { fromIndex, toIndex } = action.payload;
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= state.rows.length || toIndex >= state.rows.length)
        return;
      const [moved] = state.rows.splice(fromIndex, 1);
      state.rows.splice(toIndex, 0, moved);
    },

    setThemeMode(state, action: PayloadAction<"light" | "dark">) {
      state.themeMode = action.payload;
      localStorage.setItem("themeMode", action.payload);
    },
  },
});

export const {
  setRows,
  addColumn,
  toggleColumnVisibility,
  setSearch,
  updateRow,
  deleteRow,
  reorderColumns,
  reorderRows, // 👈 include this in export
  setThemeMode,
} = tableSlice.actions;

export default tableSlice.reducer;
