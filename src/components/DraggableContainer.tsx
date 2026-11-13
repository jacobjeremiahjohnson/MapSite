import Draggable from './Draggable';
import { createRef, useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as d3 from 'd3';
import geoData from '../assets/DEGeo.json';
import cornerImg from '../assets/pngtree-vector-effect-of-curled-page-corner-and-angled-white-sticker-with-blank-space-vector-png-image_30402186.png';
import boxImg from '../assets/box.png';
import type { DraggableData } from 'react-rnd';
import type { DraggableEvent } from 'react-draggable';
import '../App.css';

interface DraggableContainerProps {
    mapRef?: React.RefObject<SVGSVGElement | null>;
    width: number;
    height: number;
    testData: { name: string; latitude: number; longitude: number }[];
    setTrigger: (trigger: boolean) => void;
    children: Child[];
    setChildren: React.Dispatch<React.SetStateAction<Child[]>>;
    setScore: React.Dispatch<React.SetStateAction<{ score: number; distance: number; name: string }[]>>;
    trigger: boolean;
}

type Child = {
    id: number;
    position: { x: number; y: number };
    text: string;
    textInputRef?: React.RefObject<HTMLInputElement>;
}

type LabelOffset = { x: number; y: number };

const LABEL_WIDTH = 200;
const LABEL_HEIGHT = 34;
const LABEL_GAP = 5;

const labelsOverlap = (first: { x: number; y: number }, second: { x: number; y: number }) =>
    first.x < second.x + LABEL_WIDTH &&
    first.x + LABEL_WIDTH > second.x &&
    first.y < second.y + LABEL_HEIGHT &&
    first.y + LABEL_HEIGHT > second.y;

const getLabelOffsets = (children: Child[], editingId: number | null): Map<number, LabelOffset> => {
    const orderedChildren = [...children].sort((first, second) =>
        Number(second.id === editingId) - Number(first.id === editingId)
    );
    const placed: Array<{ position: { x: number; y: number }; offset: LabelOffset }> = [];
    const offsets = new Map<number, LabelOffset>();

    for (const child of orderedChildren) {
        const candidates: LabelOffset[] = [{ x: 55, y: 8 }];
        if (child.id !== editingId) {
            for (let row = 1; row <= children.length + 1; row++) {
                for (const y of [8 + row * (LABEL_HEIGHT + LABEL_GAP), 8 - row * (LABEL_HEIGHT + LABEL_GAP)]) {
                    candidates.push({ x: 55, y }, { x: -LABEL_WIDTH - LABEL_GAP, y });
                }
            }
        }

        const candidate = candidates.find(offset =>
            !placed.some(label => labelsOverlap(
                { x: child.position.x + offset.x, y: child.position.y + offset.y },
                { x: label.position.x + label.offset.x, y: label.position.y + label.offset.y }
            ))
        ) ?? candidates[0];

        offsets.set(child.id, candidate);
        placed.push({ position: child.position, offset: candidate });
    }

    return offsets;
};

const featureCollection = {
  type: 'FeatureCollection',
  features: geoData,
};

export default function DraggableContainer({ mapRef, width, height, testData, setTrigger, children, setChildren, trigger, setScore }: DraggableContainerProps) {
    const [childrenCount, setChildrenCount] = useState(0);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [focusedPinId, setFocusedPinId] = useState<number | null>(null);
    const inputRefs = useRef<Map<number, React.RefObject<HTMLInputElement | null>>>(new Map());
    const pinRefs = useRef<Map<number, React.RefObject<HTMLImageElement | null>>>(new Map());
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

    const handleDragStop = (_event: DraggableEvent, d: DraggableData, id: number): void => {
        const parentBox = parentRef?.current?.getBoundingClientRect();

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
            return;
        }

        setChildren(prev => prev.map(child =>
            child.id === id ? { ...child, position: { x: d.x, y: d.y } } : child
        ));
        setFocusedPinId(id);
    };

    const handleDragStart = (_event: DraggableEvent, _d: DraggableData): void => {
        return; // No action needed on drag start for now
    };

    const handleCheckButtonClick = () => {
        setEditingId(null);
        setTrigger(!trigger);
        if (!trigger) {
            setScore([]);
        }
    }
    const labelOffsets = useMemo(
        () => getLabelOffsets(children, editingId),
        [children, editingId]
    );
    const rootElement = document.getElementById('root');

    useEffect(() => {
        if (focusedPinId === null) return;

        inputRefs.current.get(focusedPinId)?.current?.focus();
        setFocusedPinId(null);
    }, [focusedPinId]);

    const getCityViewportPosition = (
        latitude: number,
        longitude: number,
        mapElement: SVGSVGElement,
        mapWidth: number,
        mapHeight: number
    ): [number, number] | null => {
        const screenMatrix = mapElement.getScreenCTM();
        if (!screenMatrix || !mapWidth || !mapHeight) return null;

        const projection = d3.geoMercator().fitSize(
            [mapWidth, mapHeight],
            featureCollection as any
        );

        const projected = projection([longitude, latitude]);

        if (!projected) return null;

        const viewportPosition = new DOMPoint(projected[0], projected[1]).matrixTransform(screenMatrix);
        return [viewportPosition.x, viewportPosition.y];
    };

    const getChildViewportPosition = (
        child: Child
    ): [number, number] | null => {
        const pin = pinRefs.current.get(child.id)?.current;
        if (!pin) return null;

        const bounds = pin.getBoundingClientRect();
        return [
            bounds.left + bounds.width / 2,
            bounds.top + bounds.height / 2,
        ];
    };

    useEffect(() => {
        console.log('Calculating scores...');
        if (!trigger || !testData?.length) return;
        const mapElement = mapRef?.current;
        if (!mapElement) return;
        
        const newScores = children.map((child) => {
            const city = testData.find(
                (city) =>
                    city.name.toLowerCase() ===
                    child.text.trim().toLowerCase()
            );

            if (!city) {
                console.log(`No matching city found for child: ${child.text}`);
                return {
                    score: -100,
                    distance: 0,
                    name: child.text,
                };
            }

            const cityPosition = getCityViewportPosition(
                Number(city.latitude),
                Number(city.longitude),
                mapElement,
                width,
                height
            );

            const childPosition = getChildViewportPosition(child);
            console.log(`Child: ${child.text}, City: ${city.name}, ChildPos: ${childPosition}, CityPos: ${cityPosition}`);
            if (!cityPosition || !childPosition) {
                return {
                    score: -100,
                    distance: 0,
                    name: child.text,
                };
            }

            const distance = Math.hypot(
                childPosition[0] - cityPosition[0],
                childPosition[1] - cityPosition[1]
            );

            const score = Math.max(
                0,
                Math.round(100 * (1 - distance / 150))
            );

            return {
                score,
                distance,
                name: child.text,
            };
        });

        setScore(newScores);
    }, [trigger, testData, width, height, setScore]);

    useEffect(() => {
        console.log("Terrorist detected")
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
            setFocusedPinId(pending.id);
        };

        const handleUp = () => {
            pendingDragRef.current = null;
            setFocusedPinId(null);
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
                if (e.target === e.currentTarget && (e.key === ' ' || e.key === 'Spacebar')) {
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
                width: '15%',
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
                height: 'auto',
            }}/>
            {children.map((child) => {
                let inputRef = inputRefs.current.get(child.id);
                if (!inputRef) {
                    inputRef = createRef<HTMLInputElement>();
                    inputRefs.current.set(child.id, inputRef);
                }
                let pinRef = pinRefs.current.get(child.id);
                if (!pinRef) {
                    pinRef = createRef<HTMLImageElement>();
                    pinRefs.current.set(child.id, pinRef);
                }

                return <Draggable 
                    key={child.id}
                    position={child.position}
                    onDragStop={(e, d) => handleDragStop(e, d, child.id)} 
                    onDragStart={handleDragStart}
                    id={child.id}
                    setChildren={setChildren}
                    labelOffset={labelOffsets.get(child.id) ?? { x: 55, y: 8 }}
                    trigger={trigger}
                    inputRef={inputRef}
                    pinRef={pinRef}
                />
            })}
        </button>
        
        {rootElement && createPortal(
        <button
            onClick={handleCheckButtonClick}
            style={{ 
                position: 'absolute', 
                zIndex: 1, 
                bottom: 0, 
                right: trigger ? 'auto' : '6.6%', 
                left: trigger ? '6.6%' : 'auto',
                width: '18%', 
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