import Draggable from './Draggable';
import Map from './Map';
import { useState, useRef, useEffect } from 'react';
import type { DraggableData } from 'react-rnd';
import * as d3 from 'd3';
import geoData from '../assets/DEGeo.json';

const featureCollection = {
  type: 'FeatureCollection',
  features: geoData,
};

interface DragStopEvent {
  type: string;
}

export default function MapController() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [{width, height}, setWH] = useState({ width: 1000, height: 1000 });
    const dropZoneRef = useRef<HTMLDivElement | null>(null);
    
    useEffect(() => {
        const projection = d3.geoMercator().fitSize([width, height], featureCollection as any);
        console.log(projection.invert?.([position.x, position.y])); // Log the geographic coordinates of the draggable's position
        
    }, [position]);

    const handleDragStop = (e: DragStopEvent, d: DraggableData): void => {
        console.log('Drag stopped at:', d.x, d.y);
        setPosition({ x: d.x, y: d.y });
    };

    return (
    <div ref={dropZoneRef} id="map" style={{ height: '80vh', width: '100%' }}>
          <div id="draggable-container">
            <Draggable position={position} onDragStop={handleDragStop} />
          </div>
          <Map width={width} height={height} />
        </div>
)};
