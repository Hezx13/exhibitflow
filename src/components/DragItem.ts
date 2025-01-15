export type CardDragItem = {
  id: string;
  columnId: string;
  text: string;
  price: string;
  unit: string;
  status: string;
  quantity: number;
  type: 'CARD';
};

export type ColumnDragItem = {
  id: string;
  text: string;
  type: 'COLUMN';
};

export type DragItem = CardDragItem | ColumnDragItem;
