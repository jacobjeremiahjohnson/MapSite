import { Rnd } from 'react-rnd';
import type { DraggableData } from 'react-rnd';
import type { DraggableEvent } from 'react-draggable';
import type { Child } from './DraggableContainer';
import pinImg from '../assets/pin.webp';
import holeImg from '../assets/white-paper-hole-with-pure-transparency-free-png.webp'
import { useEffect, useState } from 'react';

type DragStopHandler = (event: DraggableEvent, data: DraggableData) => void;

interface DraggableProps {
    position: any;
    onDragStop: DragStopHandler;
    onDragStart: DragStopHandler;
    id: number;
    setChildren: React.Dispatch<React.SetStateAction<Child[]>>;
    trigger?: boolean;
}

export default function Draggable({ position, onDragStop, onDragStart, id, setChildren, trigger }: DraggableProps) {

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
        style={{
          visibility: trigger ? 'visible' : 'visible'
        }}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()} // Prevent click event from propagating to parent
    >
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.2rem',
      }}>
        <img src={trigger ? holeImg : pinImg} alt="Pin" draggable='false' style={{ 
          width: trigger ? '25px' : '50px', 
          height: trigger ? '25px' : '50px',
          transform: trigger ? 'translateY(30px)' : 'translateY(0px)',
        }} />
        {!trigger && <input 
          type="text"
          placeholder="Enter city name" 
          value={text}
          onChange={handleChange} 
          style={{
            all: 'unset',
            fontSize: '1.5rem',
            fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
            width: '200px',
            textAlign: 'left',
            color: 'grey',
          }}
        />}
      </div>
    </Rnd>
  );
}
