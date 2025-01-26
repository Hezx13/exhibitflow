import { RowDragEndEvent, RowDragLeaveEvent, CellEditRequestEvent } from 'ag-grid-community';
import { generateJitteredKeyBetween } from 'fractional-indexing-jittered';
import { useMemo, useState } from 'react';
import { Status, useLoadSingleListQuery, usePatchTaskMutation } from '../../../store/api/listsApi';

const useDatagrid = (tableId: string) => {
  const [patchTask] = usePatchTaskMutation();
  const { data: list, isLoading, isFetching } = useLoadSingleListQuery(tableId);

  const columnDefs = useMemo(
    () => [
      {
        rowDrag: true,
        field: 'text' as keyof Task,
        headerName: 'Material',
        editable: true,
        flex: 1,
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
          return params.value ? new Date(params.value).toLocaleString() : '';
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
        editable: true,
        flex: 1,
        cellEditor: 'agDateCellEditor',
        cellEditorPopup: true,
        valueFormatter: (params) => {
          return params.value ? new Date(params.value).toLocaleDateString() : '';
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
        editable: true,
        flex: 1,
      },
      {
        field: 'status',
        headerName: 'Status',
        cellEditor: 'agSelectCellEditor',
        editable: true,
        flex: 1,
        valueFormatter: (params) => {
          return params.value ? params.value.charAt(0).toUpperCase() + params.value.slice(1) : '';
        },
        resizable: false,
        cellEditorParams: {
          values: Object.values(Status),
        },
      },
    ],
    []
  );

  const processRowDrag = async (event: RowDragEndEvent | RowDragLeaveEvent) => {
    console.log(event);
    const rows = list?.tasks || [];
    let newPos: string;
    if (rows.length < 2) return;

    if (event.overIndex === -1) {
      newPos = generateJitteredKeyBetween(rows[rows.length - 1].positionKey as string, null);
    } else if (event.overIndex === 0) {
      newPos = generateJitteredKeyBetween(null, rows[0].positionKey as string);
    } else if (event.overIndex > rows.findIndex((row) => row._id === event.node.data._id)) {
      newPos = generateJitteredKeyBetween(
        rows[event.overIndex].positionKey as string,
        event.overIndex + 1 < rows.length ? (rows[event.overIndex + 1].positionKey as string) : null
      );
    } else {
      const pos1 = rows[event.overIndex - 1].positionKey as string;
      const pos2 = rows[event.overIndex].positionKey as string;
      // Ensure pos1 is less than pos2 by swapping if necessary
      newPos = generateJitteredKeyBetween(pos1 < pos2 ? pos1 : pos2, pos1 < pos2 ? pos2 : pos1);
    }
    console.log(newPos);
    await patchTask({
      listId: tableId,
      taskId: event.node.data._id as string,
      payload: { positionKey: newPos },
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
