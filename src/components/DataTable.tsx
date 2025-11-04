import { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import {
  setSearch,
  updateRow,
  deleteRow,
  setRows,
  reorderColumns,
  reorderRows,
} from "../store/tableSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  IconButton,
  Stack,
  Button,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  useTheme,
} from "@mui/material";
import {
  Edit,
  Delete,
  Save,
  Close,
  Add,
  DragIndicator,
} from "@mui/icons-material";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type EditMap = Record<number, Record<string, string>>;

function HeaderCellDraggable({ id, label }: { id: string; label: string }) {
  const theme = useTheme();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    userSelect: "none",
    fontWeight: 600,
    backgroundColor:
      theme.palette.mode === "light"
        ? theme.palette.grey[100]
        : theme.palette.background.default,
    color: theme.palette.text.primary,
  } as const;

  return (
    <TableCell
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      align="center"
    >
      {label}
    </TableCell>
  );
}

function DraggableRow({
  row,
  children,
}: {
  row: any;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    background: isDragging ? "rgba(124, 58, 237, 0.1)" : "inherit",
    boxShadow: isDragging
      ? "0 4px 10px rgba(124, 58, 237, 0.3)"
      : "none",
  };

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </TableRow>
  );
}

export default function DataTable() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { rows, columns, search } = useSelector(
    (state: RootState) => state.table
  );

  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [editingRows, setEditingRows] = useState<Set<number>>(new Set());
  const [drafts, setDrafts] = useState<EditMap>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [newRow, setNewRow] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);

  const visibleColumns = useMemo(
    () => columns.filter((c) => c.visible),
    [columns]
  );

  const filteredRows = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((row) =>
      visibleColumns.some((col) =>
        String(row[col.id] ?? "").toLowerCase().includes(q)
      )
    );
  }, [rows, search, visibleColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function onDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const columnIds = visibleColumns.map((c) => c.id);
    const rowIds = filteredRows.map((r) => r.id);

    if (columnIds.includes(active.id)) {
      const oldIndex = columnIds.indexOf(active.id);
      const newIndex = columnIds.indexOf(over.id);
      dispatch(reorderColumns({ fromIndex: oldIndex, toIndex: newIndex }));
    } else if (rowIds.includes(active.id)) {
      const oldIndex = rowIds.indexOf(active.id);
      const newIndex = rowIds.indexOf(over.id);
      dispatch(reorderRows({ fromIndex: oldIndex, toIndex: newIndex }));
    }
  }

  function startEdit(rowId: number) {
    setEditingRows((prev) => new Set(prev).add(rowId));
    const row = rows.find((r) => r.id === rowId);
    if (!row) return;
    setDrafts((prev) => ({
      ...prev,
      [rowId]: visibleColumns.reduce((acc, c) => {
        acc[c.id] = String(row[c.id] ?? "");
        return acc;
      }, {} as Record<string, string>),
    }));
  }

  function onChangeCell(rowId: number, colId: string, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [rowId]: { ...(prev[rowId] || {}), [colId]: value },
    }));
  }

  function cancelAll() {
    setEditingRows(new Set());
    setDrafts({});
  }

  function saveAll() {
    const updated = [...rows];
    for (const rowIdStr of Object.keys(drafts)) {
      const rowId = Number(rowIdStr);
      const draft = drafts[rowId];
      const idx = updated.findIndex((r) => r.id === rowId);
      if (idx !== -1) {
        updated[idx] = {
          ...updated[idx],
          ...Object.fromEntries(Object.entries(draft)),
        };
      }
    }
    dispatch(setRows(updated));
    setEditingRows(new Set());
    setDrafts({});
  }

  function handleAddRow() {
    setIsAdding(true);
    const empty = Object.fromEntries(visibleColumns.map((col) => [col.id, ""]));
    setNewRow(empty);
  }

  function handleSaveNewRow() {
    const isEmpty = Object.values(newRow).some((val) => val.trim() === "");
    if (isEmpty) {
      alert("All fields are required.");
      return;
    }

    const newId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    const newRowData = {
      id: newId,
      name: newRow.name?.trim() || "",
      email: newRow.email?.trim() || "",
      role: newRow.role?.trim() || "",
      age: Number(newRow.age) || 0,
    };

    const updated = [...rows, newRowData];
    dispatch(setRows(updated));
    setIsAdding(false);
    setNewRow({});
  }

  function handleCancelAdd() {
    setIsAdding(false);
    setNewRow({});
  }

  function deleteRowWithConfirm(id: number) {
    setConfirmDeleteId(id);
  }

  function confirmDelete() {
    if (confirmDeleteId != null) {
      dispatch(deleteRow(confirmDeleteId));
    }
    setConfirmDeleteId(null);
  }

  return (
    <Paper
      sx={{
        p: { xs: 1.5, sm: 2.5 },
        borderRadius: 3,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow:
          theme.palette.mode === "light"
            ? "0 4px 20px rgba(0,0,0,0.08)"
            : "0 4px 20px rgba(0,0,0,0.5)",
        overflowX: "auto",
        transition: "all 0.3s ease",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{ mb: 2 }}
      >
        <TextField
          label="Search..."
          variant="outlined"
          fullWidth
          value={search}
          onChange={(e) => dispatch(setSearch(e.target.value))}
        />
        <Button startIcon={<Add />} variant="contained" onClick={handleAddRow}>
          Add Row
        </Button>
        <Button
          startIcon={<Save />}
          variant="contained"
          disabled={Object.keys(drafts).length === 0}
          onClick={saveAll}
        >
          Save All
        </Button>
        <Button
          startIcon={<Close />}
          variant="outlined"
          disabled={Object.keys(drafts).length === 0}
          onClick={cancelAll}
        >
          Cancel All
        </Button>
      </Stack>

      <TableContainer>
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <Table size="small" stickyHeader>
            <SortableContext
              items={visibleColumns.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      width: "40px",
                      backgroundColor:
                        theme.palette.mode === "light"
                          ? theme.palette.grey[100]
                          : theme.palette.background.default,
                    }}
                  />
                  {visibleColumns.map((col) => (
                    <HeaderCellDraggable
                      key={col.id}
                      id={col.id}
                      label={col.label}
                    />
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
            </SortableContext>

            <SortableContext
              items={filteredRows.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <TableBody>
                {isAdding && (
                  <TableRow>
                    <TableCell />
                    {visibleColumns.map((col) => (
                      <TableCell key={col.id}>
                        <TextField
                          variant="standard"
                          fullWidth
                          placeholder={`Enter ${col.label}`}
                          value={newRow[col.id] ?? ""}
                          onChange={(e) =>
                            setNewRow({ ...newRow, [col.id]: e.target.value })
                          }
                        />
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      <Tooltip title="Save New Row">
                        <IconButton color="success" onClick={handleSaveNewRow}>
                          <Save />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel">
                        <IconButton color="warning" onClick={handleCancelAdd}>
                          <Close />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )}

                {filteredRows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    const isEditing = editingRows.has(row.id);
                    const draft = drafts[row.id] || {};
                    return (
                      <DraggableRow key={row.id} row={row}>
                        <TableCell
                          align="center"
                          sx={{
                            width: "40px",
                            padding: "4px",
                            cursor: "grab",
                            color: theme.palette.text.secondary,
                          }}
                        >
                          <DragIndicator fontSize="small" />
                        </TableCell>
                        {visibleColumns.map((col) => {
                          const value = isEditing ? draft[col.id] ?? "" : row[col.id];
                          return (
                            <TableCell key={col.id}>
                              {isEditing ? (
                                <TextField
                                  variant="standard"
                                  fullWidth
                                  value={String(value ?? "")}
                                  onChange={(e) =>
                                    onChangeCell(row.id, col.id, e.target.value)
                                  }
                                />
                              ) : (
                                String(value ?? "")
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            {!isEditing ? (
                              <Tooltip title="Edit row">
                                <IconButton
                                  onClick={() => startEdit(row.id)}
                                  size="small"
                                  color="primary"
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <>
                                <Tooltip title="Save this row">
                                  <IconButton
                                    size="small"
                                    sx={{ color: theme.palette.success.main }}
                                    onClick={() => {
                                      const rowDraft = drafts[row.id] || {};
                                      const updated = { ...row, ...rowDraft };
                                      dispatch(updateRow(updated));
                                      const newEd = new Set(editingRows);
                                      newEd.delete(row.id);
                                      setEditingRows(newEd);
                                      const { [row.id]: _, ...rest } = drafts;
                                      setDrafts(rest);
                                    }}
                                  >
                                    <Save fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel edit">
                                  <IconButton
                                    size="small"
                                    sx={{ color: theme.palette.warning.main }}
                                    onClick={() => {
                                      const newEd = new Set(editingRows);
                                      newEd.delete(row.id);
                                      setEditingRows(newEd);
                                      const { [row.id]: _, ...rest } = drafts;
                                      setDrafts(rest);
                                    }}
                                  >
                                    <Close fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            <Tooltip title="Delete row">
                              <IconButton
                                color="error"
                                onClick={() => deleteRowWithConfirm(row.id)}
                                size="small"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </DraggableRow>
                    );
                  })}
              </TableBody>
            </SortableContext>
          </Table>
        </DndContext>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
      />

      <Dialog open={confirmDeleteId != null} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>Delete row?</DialogTitle>
        <DialogContent>Are you sure you want to delete this row?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
