import './App.css';
import { useState, useRef } from 'react';
import Draggable from './components/Draggable';
import Map from './components/Map';
import type { DraggableData } from 'react-rnd';


interface DragStopEvent {
  type: string;
}

function App() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dropZoneRef = useRef<HTMLDivElement | null>(null);

  const handleDragStop = (e: DragStopEvent, d: DraggableData): void => {
    console.log('Drag stopped at:', d.x, d.y);
    setPosition({ x: d.x, y: d.y });
  };

  return (
    <div className="App">
      <div id="map-container">
        <div ref={dropZoneRef} id="map" style={{ height: '80vh', width: '100%' }}>
          <Map width={1000} height={1000} />
        </div>
        <div id="draggable-container">
          <Draggable position={position} onDragStop={handleDragStop} />
        </div>
      </div>
    </div>
  )
}

export default App
