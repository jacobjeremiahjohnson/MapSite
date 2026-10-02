import Draggable from './Draggable';
import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import geoData from '../assets/DEGeo.json';
import testData from '../assets/DE_cities.json';
import type { DraggableData } from 'react-rnd';

interface DraggableContainerProps {
    width: number;
    height: number;
    setTrigger: (trigger: boolean) => void;
    setScore: (score: number) => void;
    trigger: boolean;
}

type Child = {
    id: number;
    position: { x: number; y: number };
    text: string;
}

interface DragStopEvent {
  type: string;
}

const featureCollection = {
  type: 'FeatureCollection',
  features: geoData,
};

export default function DraggableContainer({ width, height, setTrigger, trigger, setScore }: DraggableContainerProps) {
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
        setChildren(prev => prev.map(child =>
            child.id === id ? { ...child, position: { x: d.x, y: d.y } } : child
        ))

        const parentBox = parentRef.current?.getBoundingClientRect();

        if (!parentBox) return;

        const inside =
            d.x >= 0 &&
            d.y >= 0 &&
            d.x <= parentBox.width &&
            d.y <= parentBox.height;
        
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

    const handleClick = () => {
        setChildren(prev => [...prev, { id: childrenCount, position: relativePos, text: '' }]);
        setChildrenCount(prev => prev + 1);
    }

    const handleCheckButtonClick = () => {
        setTrigger(!trigger);
    }

    useEffect(() => {
        const projection = d3.geoMercator().fitSize([width, height], featureCollection as any);
        console.log(projection.invert?.([position.x, position.y])); // Log the geographic coordinates of the draggable's position
      
    }, [position]);

    useEffect(() => {
        for (const child of children) {
            const projection = d3.geoMercator().fitSize([width, height], featureCollection as any);
            const geoCoords = projection.invert?.([child.position.x, child.position.y]);
            let score = 0;
            for (const city of testData) {
                if (geoCoords && city.latitude && city.longitude) {
                    const distance = Math.sqrt(Math.pow(geoCoords[0] - Number(city.longitude), 2) + Math.pow(geoCoords[1] - Number(city.latitude), 2));
                    if (distance < 0.05) { // Adjust the threshold as needed
                        console.log(`Child ID: ${child.id} is near city: ${city.name}`);
                        score = score + (1 - distance);
                    }
                }
            }
            setScore(score);
        }
    }, [trigger]);

    return (
    <div>
        <button
            ref={parentRef}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            style={{
                background: 'brown',
                color: 'inherit',
                border: 'none',
                padding: 0,
                margin: 0,
                font: 'inherit',
                cursor: 'pointer',
                outline: 'inherit',
                appearance: 'none',
                width: '20%',
                height: '20%',
                position: 'absolute',
                textAlign: 'center',
            }}
        >
            {children.map((child) => (
                <Draggable 
                    key={child.id}
                    position={child.position}
                    onDragStop={(e, d) => handleDragStop(e, d, child.id)} 
                    onDragStart={handleDragStart}
                    id={child.id}
                    setChildren={setChildren}
                />
            ))}
        </button>
        <button
            onClick={handleCheckButtonClick}
            style={{ position: 'absolute', top: '30%', width: '20%', height: '10%' }}
        >
            Log Children
        </button>
    </div>
)};

export type { Child };