import Draggable from './Draggable';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as d3 from 'd3';
import geoData from '../assets/DEGeo.json';
import testData from '../assets/DE_cities.json';
import cornerImg from '../assets/pngtree-vector-effect-of-curled-page-corner-and-angled-white-sticker-with-blank-space-vector-png-image_30402186.png';
import boxImg from '../assets/box.png';
import clue from '../assets/clue.png';
import type { DraggableData } from 'react-rnd';
import '../App.css';

interface DraggableContainerProps {
    width: number;
    height: number;
    setTrigger: (trigger: boolean) => void;
    children: { id: number; position: { x: number; y: number }; text: string }[];
    setChildren: React.Dispatch<React.SetStateAction<{ id: number; position: { x: number; y: number }; text: string }[]>>;
    setScore: React.Dispatch<React.SetStateAction<{ score: number; distance: number; name: string }[]>>;
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

export default function DraggableContainer({ width, height, setTrigger, children, setChildren, trigger, setScore }: DraggableContainerProps) {
    const [position, setPosition] = useState({ x: 15, y: 15 });
    const [childrenCount, setChildrenCount] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const parentRef = useRef<HTMLButtonElement | null>(null);
    const pendingDragRef = useRef<{
        id: number;
        startX: number;
        startY: number;
        startPosX: number;
        startPosY: number;
    } | null>(null);    

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (e.button !== 0) return;

        const bounds = e.currentTarget.getBoundingClientRect();
        const id = childrenCount;

        const startPosX = e.clientX - bounds.left - 25;
        const startPosY = e.clientY - bounds.top - 25;

        pendingDragRef.current = {
            id,
            startX: e.clientX,
            startY: e.clientY,
            startPosX,
            startPosY,
        };

        setChildren(prev => [
            ...prev,
            {
                id,
                position: { x: startPosX, y: startPosY },
                text: '',
            },
        ]);

        setChildrenCount(prev => prev + 1);
    };

    const handleDragStop = (e: DragStopEvent, d: DraggableData, id: number): void => {
        setIsDragging(false);
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
        setIsDragging(true);
    };

    const handleCheckButtonClick = () => {
        setTrigger(!trigger);
        if (!trigger) {
            setScore([]);
        }
    }
    const rootElement = document.getElementById('root');

    useEffect(() => {
        const projection = d3.geoMercator().fitSize([width, height], featureCollection as any);
        console.log(projection.invert?.([position.x, position.y])); // Log the geographic coordinates of the draggable's position
      
    }, [position]);

    useEffect(() => {
        function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
            const toRadians = (degrees: number) => degrees * Math.PI / 180;
            const earthRadiusKm = 6371.0088;

            const dLat = toRadians(lat2 - lat1);
            const dLon = toRadians(lon2 - lon1);

            const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos(toRadians(lat1)) *
                Math.cos(toRadians(lat2)) *
                Math.sin(dLon / 2) ** 2;

            const clampedA = Math.min(1, Math.max(0, a));

            return 2 * earthRadiusKm *
                Math.atan2(
                Math.sqrt(clampedA),
                Math.sqrt(1 - clampedA)
                );
        }

        for (const child of children) {
            const projection = d3.geoMercator().fitSize([width, height], featureCollection as any);
            const [pinLongitude, pinLatitude] = projection.invert?.([child.position.x, child.position.y - 50]) || [0, 0]; // Adjust for the height of the pin image
            let score = 0;
            let distance = 0;
            for (const city of testData) {
                if (pinLongitude && pinLatitude && city.latitude && city.longitude && city.name.toLowerCase() === child.text.toLowerCase()) {
                    distance = haversineDistance(pinLatitude, pinLongitude, Number(city.latitude), Number(city.longitude));
                    console.log(`Child: ${child.text}, Distance: ${distance} km`);
                    score = Math.round(100 * Math.max(0, 1 - distance / 150)); // Score decreases with distance, max distance 150 km
                } 
            }
            if (score == 0) {
                score = -100;
                distance = 0;
            }
            setScore(prev => [...prev, { score: Math.round(score), distance: distance, name: child.text }]);
        }
    }, [trigger]);

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            const pending = pendingDragRef.current;
            if (!pending) return;

            const dx = e.clientX - pending.startX;
            const dy = e.clientY - pending.startY;

            setChildren(prev =>
                prev.map(child =>
                    child.id === pending.id
                        ? {
                            ...child,
                            position: {
                                x: pending.startPosX + dx,
                                y: pending.startPosY + dy,
                            },
                        }
                        : child
                )
            );
        };

        const handleUp = () => {
            pendingDragRef.current = null;
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [setChildren]);

    return (
    <div>
        <button
            ref={parentRef}
            onMouseDown={handleMouseDown}
            onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                }
            }}
            style={{
                background: 'transparent',
                color: 'inherit',
                border: 'none',
                padding: 0,
                margin: 0,
                font: 'inherit',
                cursor: 'pointer',
                outline: 'inherit',
                appearance: 'none',
                width: '20%',
                height: 'auto',
                position: 'absolute',
                left: '0px',
                bottom: '-0px',
                textAlign: 'center',
                visibility: trigger ? 'hidden' : 'visible',
            }}
        >
            <img src={boxImg} className="no-drag" style={{
                width: '100%',
                height: '100%',
            }}/>
            {children.map((child) => (
                <Draggable 
                    key={child.id}
                    position={child.position}
                    onDragStop={(e, d) => handleDragStop(e, d, child.id)} 
                    onDragStart={handleDragStart}
                    id={child.id}
                    setChildren={setChildren}
                    trigger={trigger}
                />
            ))}
        </button>
        <img src={clue} alt="Clue" style={{ 
                position: 'absolute', 
                zIndex: 1, 
                bottom: 20, 
                right: 15, 
                width: '25%', 
                height: '20%', 
                background: 'transparent', 
                border: 'none',
                visibility: trigger ? 'hidden' : 'visible',
            }} />
        {rootElement && createPortal(
        <button
            onClick={handleCheckButtonClick}
            style={{ 
                position: 'absolute', 
                zIndex: 1, 
                bottom: 0, 
                right: trigger ? 'auto' : -5, 
                left: trigger ? 3 : 'auto',
                width: '20%', 
                height: '10%', 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer',
                transform: trigger ? 'rotateY(180deg)' : 'none',
                transition: 'transform 0.2s ease',
            }}
        >
            <img src={cornerImg} alt="Check" style={{ width: '100%', height: '100%' }} />
        </button>, rootElement)}
    </div>
)};

export type { Child };