import { Button, Stack } from "@mui/material";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { setRows } from "../store/tableSlice";

function ImportExportButtons() {
  const dispatch = useDispatch();
  const rows = useSelector((state: RootState) => state.table.rows);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const parsed = (results.data as any[]).map((r, i) => ({
          id: i + 1,
          name: r.name ?? "",
          email: r.email ?? "",
          age: Number(r.age) || 0,
          role: r.role ?? "",
        }));
        dispatch(setRows(parsed));
      },
    });
  };

  const handleExport = () => {
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "table_data.csv");
  };

  return (
    <Stack direction="row" spacing={2}>
      <Button variant="contained" component="label">
        Import CSV
        <input type="file" accept=".csv" hidden onChange={handleImport} />
      </Button>
      <Button variant="outlined" onClick={handleExport}>
        Export CSV
      </Button>
    </Stack>
  );
}

export default ImportExportButtons;
