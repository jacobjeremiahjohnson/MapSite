import { Rnd } from 'react-rnd';
import type { DraggableData } from 'react-rnd';
import type { DraggableEvent } from 'react-draggable';
import type { Child } from './DraggableContainer';
import pinImg from '../assets/pin.webp';
import holeImg from '../assets/woodhole.png'
import { useState } from 'react';

type DragStopHandler = (event: DraggableEvent, data: DraggableData) => void;

interface DraggableProps {
    position: any;
    onDragStop: DragStopHandler;
    onDragStart: DragStopHandler;
    id: number;
    setChildren: React.Dispatch<React.SetStateAction<Child[]>>;
    labelOffset: { x: number; y: number };
    trigger?: boolean;
    inputRef?: React.RefObject<HTMLInputElement | null>;
}

export default function Draggable({ position, onDragStop, onDragStart, id, setChildren, labelOffset, trigger, inputRef }: DraggableProps) {
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
        disableDragging={trigger}
        className="draggable-pin"
        style={{
          visibility: trigger ? 'visible' : 'visible'
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: trigger ? '25px' : '50px',
        height: trigger ? '25px' : '50px',
      }}>
        <img src={trigger ? holeImg : pinImg} alt="Pin" draggable='false' style={{ 
          width: trigger ? '25px' : '50px', 
          height: trigger ? '25px' : '50px',
          zIndex: 100,
          transform: trigger ? 'translateY(30px)' : 'translateY(0px)',
        }} />
        {!trigger && <input 
          type="text"
          placeholder="Enter city name" 
          ref={inputRef}
          value={text}
          onChange={handleChange} 
          style={{
            all: 'unset',
            position: 'absolute',
            left: `${labelOffset.x}px`,
            top: `${labelOffset.y}px`,
            fontSize: '1.5rem',
            fontFamily: 'cursive',
            width: '200px',
            textAlign: 'left',
            color: 'grey',
            zIndex: 99,
          }}
        />}
      </div>
    </Rnd>
  );
}
