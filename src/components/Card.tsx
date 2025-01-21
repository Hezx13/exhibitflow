import { useEffect, useRef, useState } from 'react';
import { CardContainer, DeleteTaskButton, EditTaskButton } from '../styles/styles';
import { CardMainText, CardPriceText, CardQuantityText } from '../styles/textStyles';
import { useDrop } from 'react-dnd';
import { useAppState } from '../state/AppStateContext';
import { removeTask, editTask } from '../state/actions';
import { throttle } from 'throttle-debounce-ts';
type CardProps = {
  text: string;
  id: string;
  price: string;
  quantity: number;
  status: string;
  unit: string;
  columnId: string;
  isPreview?: boolean;
};

export const Card = ({
  text,
  id,
  price,
  quantity,
  status,
  unit,
  columnId,
  isPreview,
}: CardProps) => {
  const { dispatch } = useAppState();
  const ref = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPriceSet, setIsPriceSet] = useState(false);

  useEffect(() => {
    let pr = parseFloat(price?.split(' ')[0] || price);
    setIsPriceSet(!Number.isNaN(pr) || status === 'In process' || status === 'Done');
  }, [price]);

  return (
    <CardContainer isPreview={isPreview} ref={ref} isPriceSet={isPriceSet}>
      <div>
        <CardMainText>{text}</CardMainText>
        <span>
          <CardPriceText>{parseFloat(price) * quantity} AED</CardPriceText>
          <CardQuantityText>
            {quantity && quantity.toString()} {unit}
          </CardQuantityText>
        </span>
      </div>
      <div style={{ display: 'flex', gap: 1 }}>
        <DeleteTaskButton onClick={() => dispatch(removeTask(columnId, id))}>
          delete
        </DeleteTaskButton>
      </div>
    </CardContainer>
  );
};
