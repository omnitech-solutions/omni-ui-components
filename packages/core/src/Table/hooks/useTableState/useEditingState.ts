import * as React from 'react';

export function useEditingState() {
  const [editingCell, setEditingCell] = React.useState<{ rowKey: string; columnKey: string } | null>(null);
  const [editingRowKey, setEditingRowKey] = React.useState<string | null>(null);
  const [editValues, setEditValues] = React.useState<Record<string, Record<string, unknown>>>({});
  const [editErrors, setEditErrors] = React.useState<Record<string, string | null>>({});
  // Persists edits visibly when consumer wires no `onSave`; external `onSave` still fires.
  const [internalCellValues, setInternalCellValues] = React.useState<Record<string, Record<string, unknown>>>({});

  return {
    editingCell,
    setEditingCell,
    editingRowKey,
    setEditingRowKey,
    editValues,
    setEditValues,
    editErrors,
    setEditErrors,
    internalCellValues,
    setInternalCellValues,
  };
}
