import Draggable from './Draggable';
import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import geoData from '../assets/DEGeo.json';
import type { DraggableData } from 'react-rnd';

interface DraggableContainerProps {
    width: number;
    height: number;
}

type Child = {
    id: number;
    position: { x: number; y: number };
}

interface DragStopEvent {
  type: string;
}

const featureCollection = {
  type: 'FeatureCollection',
  features: geoData,
};

export default function DraggableContainer({ width, height }: DraggableContainerProps) {
    const [position, setPosition] = useState({ x: 15, y: 15 });
    const [children, setChildren] = useState<Child[]>([]);
    const [childrenCount, setChildrenCount] = useState(0);
    const parentRef = useRef<HTMLButtonElement | null>(null);
    
    const [relativePos, setRelativePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        setRelativePos({ x, y });
    };

    const handleDragStop = (e: DragStopEvent, d: DraggableData, id: number): void => {
        
        const parentBox = parentRef.current?.getBoundingClientRect();

        if (!parentBox) return;

        const inside =
            d.x >= 0 &&
            d.y >= 0 &&
            d.x <= parentBox.width &&
            d.y <= parentBox.height;

        setPosition({ x: d.x, y: d.y });
        
        if (inside) {
            setChildren(prev =>
                prev.filter(child => child.id !== id)
            );
        }
        return;
    };

    const handleDragStart = (e: DragStopEvent, d: DraggableData): void => {
        console.log('Drag started at:', d.x, d.y);
    };

    useEffect(() => {
        const projection = d3.geoMercator().fitSize([width, height], featureCollection as any);
        console.log(projection.invert?.([position.x, position.y])); // Log the geographic coordinates of the draggable's position
      
    }, [position]);

    const handleClick = () => {
        setChildren(prev => [...prev, { id: childrenCount, position: relativePos }]);
        setChildrenCount(prev => prev + 1);
    }

    return (
    <button id="draggable-container" ref={parentRef} onClick={handleClick} onMouseMove={handleMouseMove}>
        City Box {relativePos.x}, {relativePos.y}
        {children.map((child) => (
            <Draggable 
                key={child.id}
                position={child.position}
                onDragStop={(e, d) => handleDragStop(e, d, child.id)} 
                onDragStart={handleDragStart}
            />
        ))}
    </button>
)};