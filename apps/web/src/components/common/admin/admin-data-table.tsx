"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { AdminTableContainer } from "./admin-table-container";

type AdminDataTableProps<TData extends RowData> = {
  ariaLabel: string;
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  emptyContent?: ReactNode;
  getRowId?: (row: TData, index: number) => string;
};

function sortIcon(direction: false | "asc" | "desc") {
  if (direction === "asc") {
    return <ArrowUp aria-hidden="true" className="size-3.5" />;
  }
  if (direction === "desc") {
    return <ArrowDown aria-hidden="true" className="size-3.5" />;
  }
  return <ChevronsUpDown aria-hidden="true" className="size-3.5" />;
}

export function AdminDataTable<TData extends RowData>({
  ariaLabel,
  columns,
  data,
  emptyContent,
  getRowId,
}: AdminDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });
  const rows = table.getRowModel().rows;

  return (
    <AdminTableContainer>
      <Table aria-label={ariaLabel}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const direction = header.column.getIsSorted();
                const canSort = header.column.getCanSort();

                return (
                  <TableHead
                    aria-sort={
                      canSort
                        ? direction === "asc"
                          ? "ascending"
                          : direction === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
                    key={header.id}
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <Button
                        className="-ml-3 min-h-11 gap-1.5 px-3 text-xs font-medium uppercase text-muted-foreground hover:text-foreground"
                        onClick={header.column.getToggleSortingHandler()}
                        type="button"
                        variant="ghost"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {sortIcon(direction)}
                      </Button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow
                data-state={row.getIsSelected() ? "selected" : undefined}
                key={row.id}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : emptyContent ? (
            <TableRow>
              <TableCell className="h-28 text-center" colSpan={columns.length}>
                {emptyContent}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </AdminTableContainer>
  );
}
