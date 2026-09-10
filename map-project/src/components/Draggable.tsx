import { Rnd } from 'react-rnd';
import type { DraggableData } from 'react-rnd';
import type { DraggableEvent } from 'react-draggable';
import { PiMapPin } from "react-icons/pi";

type DragStopHandler = (event: DraggableEvent, data: DraggableData) => void;

interface DraggableProps {
    position: any;
    onDragStop: DragStopHandler;
}

export default function Draggable({ onDragStop } : DraggableProps) {
  return (
    <Rnd
        default={{
            x: 20, y: 20, width: 100, height: 100,
        }}
        onDragStop={onDragStop}
    >
        <div><PiMapPin /> City</div>
    </Rnd>
  );
}
