import { Rnd } from 'react-rnd';
import type { DraggableData } from 'react-rnd';
import type { DraggableEvent } from 'react-draggable';
import { PiMapPin } from "react-icons/pi";
import type { Child } from './DraggableContainer';
import { useEffect, useState } from 'react';

type DragStopHandler = (event: DraggableEvent, data: DraggableData) => void;

interface DraggableProps {
    position: any;
    onDragStop: DragStopHandler;
    onDragStart: DragStopHandler;
    id: number;
    setChildren: React.Dispatch<React.SetStateAction<Child[]>>;
}

export default function Draggable({ position, onDragStop, onDragStart, id, setChildren }: DraggableProps) {

  const [text, setText] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChildren(prev => prev.map(child =>
      child.id === id ? { ...child, text: e.target.value } : child
    ));
    setText(e.target.value);
  }

  return (
    <Rnd
        position={position}
        onDragStop={onDragStop}
        onDragStart={onDragStart}
        enableResizing={false}
        className="draggable-pin"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()} // Prevent click event from propagating to parent
    >
      <div>
        <PiMapPin /> 
        <input 
          type="text"
          placeholder="Enter city name" 
          value={text}
          onChange={handleChange} 
        />
      </div>
    </Rnd>
  );
}
