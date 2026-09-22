import { Rnd } from 'react-rnd';
import type { DraggableData } from 'react-rnd';
import type { DraggableEvent } from 'react-draggable';
import { PiMapPin } from "react-icons/pi";

type DragStopHandler = (event: DraggableEvent, data: DraggableData) => void;

interface DraggableProps {
    position: any;
    onDragStop: DragStopHandler;
    onDragStart: DragStopHandler;
}

export default function Draggable({ position, onDragStop, onDragStart }: DraggableProps) {
  return (
    <Rnd
        position={position}
        onDragStop={onDragStop}
        onDragStart={onDragStart}
        enableResizing={false}
        className="draggable-pin"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()} // Prevent click event from propagating to parent
    >
        <div><PiMapPin /> City</div>
    </Rnd>
  );
}
