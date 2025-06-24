import { RowDragEndEvent, RowDragLeaveEvent, CellEditRequestEvent } from 'ag-grid-community';
import { generateJitteredKeyBetween, generateKeyBetween } from 'fractional-indexing-jittered';
import { useMemo, useState } from 'react';
import {
  Payment,
  Status,
  useLoadSingleListQuery,
  usePatchTaskMutation,
} from '../../../store/api/listsApi';
import { formatDateTime } from '../../../utils/timeUtils';
import { useAppSelector } from '../../../store';

const useDatagrid = (tableId: string) => {
  const { isAdmin, isManager } = useAppSelector((state) => state.auth);
  const [patchTask] = usePatchTaskMutation();
  const { data: list, isLoading, isFetching } = useLoadSingleListQuery(tableId);

  const columnDefs = useMemo(
    () => [
      {
        rowDrag: true,
        field: 'name' as keyof Task,
        headerName: 'Material',
        editable: true,
        flex: 2,
      },
      {
        field: 'article',
        headerName: 'Article №',
        editable: true,
        flex: 1,
      },
      {
        field: 'price',
        headerName: 'Price',
        editable: true,
        flex: 1,
      },
      {
        field: 'quantity',
        headerName: 'Quantity',
        editable: true,
        flex: 1,
      },
      {
        field: 'date',
        headerName: 'Date',
        editable: false,
        flex: 1,
        cellRenderer: (params) => {
          return params.value ? formatDateTime(params.value) : '';
        },
      },
      {
        field: 'unit',
        headerName: 'Unit',
        editable: true,
        flex: 1,
      },
      {
        field: 'comment',
        headerName: 'Comment',
        editable: true,
        flex: 1,
      },
      {
        field: 'deliveryDate',
        headerName: 'Delivery Date',
        editable: isAdmin || isManager,
        flex: 1,
        cellEditor: 'agDateCellEditor',
        cellEditorPopup: true,
        valueFormatter: (params) => {
          if (!params.value) return '';
          const date = new Date(params.value);
          // Format as DD.MM.YYYY
          return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
        },
        valueSetter: (params) => {
          if (params.newValue) {
            const date = new Date(params.newValue);
            date.setHours(12, 0, 0, 0);
            params.data[params.column.getColId()] = date.toISOString();
            return true;
          }
          return false;
        },
        filter: 'agDateColumnFilter',
        filterParams: {
          comparator: (filterLocalDateAtMidnight, cellValue) => {
            const dateAsString = cellValue;
            if (dateAsString == null) return -1;
            const dateParts = dateAsString.split('/');
            const cellDate = new Date(
              Number(dateParts[2]),
              Number(dateParts[1]) - 1,
              Number(dateParts[0])
            );
            if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
              return 0;
            }
            if (cellDate < filterLocalDateAtMidnight) {
              return -1;
            }
            if (cellDate > filterLocalDateAtMidnight) {
              return 1;
            }
            return 0;
          },
        },
      },
      {
        field: 'orderedBy',
        headerName: 'Ordered By',
        editable: false,
        flex: 1,
      },
      {
        field: 'status',
        headerName: 'Status',
        cellEditor: 'agRichSelectCellEditor',
        editable: isAdmin || isManager,
        flex: 1,
        valueFormatter: (params) => {
          return params.value ? params.value.charAt(0).toUpperCase() + params.value.slice(1) : '';
        },
        resizable: false,
        cellEditorParams: {
          values: Object.values(Status),
        },
      },
      {
        field: 'payment',
        headerName: 'Payment',
        editable: isAdmin || isManager,
        flex: 1,
        valueFormatter: (params) => {
          return params.value ? params.value.charAt(0).toUpperCase() + params.value.slice(1) : '';
        },
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: Object.values(Payment),
        },
      },
    ],
    []
  );

  const processRowDrag = async (event: RowDragEndEvent | RowDragLeaveEvent) => {
    const rows = list?.tasks || [];
    if (rows.length < 2) return;

    const currentItemIndex = rows.findIndex((row) => row._id === event.node.data._id);
    const newIndex = event.overIndex;
    
    let newKey: string;
    if (newIndex === 0) {
      // Moving to the start
      const afterKey = rows[0]?.positionKey || null;
      // TODO: weird bug here, lower null is generating last key, check & fix
      // temp fix hardcoded a0
      newKey = generateJitteredKeyBetween('a0', afterKey);
    } else if (newIndex >= rows.length - 1 || newIndex === -1) {
      // Moving to the end
      const beforeKey = rows[rows.length - 1]?.positionKey || null;
      newKey = generateJitteredKeyBetween(beforeKey, null);
    } else {
      // Moving between two items
      const isMovingDown = newIndex > currentItemIndex;
      const beforeKey = rows[newIndex + (isMovingDown ? 0 : -1)]?.positionKey;
      const afterKey = rows[newIndex + (isMovingDown ? 1 : 0)]?.positionKey;
      newKey = generateJitteredKeyBetween(beforeKey, afterKey);
    }

    console.log(newKey);
    await patchTask({
      listId: tableId,
      taskId: event.node.data._id as string,
      payload: { positionKey: newKey },
    });
  };

  const onCellValueChanged = (newRow: CellEditRequestEvent<Task>) => {
    const column = newRow.colDef.field as string;
    const newRowData = newRow.newValue;
    const id = newRow.data._id;

    patchTask({
      listId: tableId,
      taskId: id as string,
      payload: { [column]: newRowData },
    });
  };

  const rows = useMemo(() => list?.tasks || [], [list?.tasks]);

  return {
    rows,
    isLoading,
    isFetching,
    columnDefs,
    processRowDrag,
    onCellValueChanged,
  };
};

export default useDatagrid;
