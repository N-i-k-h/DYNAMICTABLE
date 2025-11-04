import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Dialog, DialogTitle, DialogContent, FormGroup, FormControlLabel,
  Checkbox, Button, TextField
} from "@mui/material";
import type { RootState } from "../store";
import { addColumn, toggleColumnVisibility } from "../store/tableSlice";

const ManageColumnsModal = () => {
  const [open, setOpen] = useState(false);
  const [newColumn, setNewColumn] = useState("");
  const { columns } = useSelector((state: RootState) => state.table);
  const dispatch = useDispatch();

  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Manage Columns
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Manage Columns</DialogTitle>
        <DialogContent>
          <FormGroup>
            {columns.map(col => (
              <FormControlLabel
                key={col.id}
                control={
                  <Checkbox
                    checked={col.visible}
                    onChange={() => dispatch(toggleColumnVisibility(col.id))}
                  />
                }
                label={col.label}
              />
            ))}
          </FormGroup>
          <TextField
            label="Add new column"
            fullWidth
            value={newColumn}
            onChange={(e) => setNewColumn(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 1 }}
            onClick={() => {
              if (newColumn.trim()) {
                dispatch(addColumn(newColumn.trim()));
                setNewColumn("");
              }
            }}
          >
            Add Column
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManageColumnsModal;
