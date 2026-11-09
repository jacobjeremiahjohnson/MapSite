import Map from './Map';
import { useEffect, useRef, useState, type ComponentType } from 'react';
import ScoreSheet from './ScoreSheet';
import DraggableContainer from './DraggableContainer';

const MapComponent = Map as ComponentType<{ mapRef?: React.RefObject<SVGSVGElement | null>; width?: number; height?: number; children?: { id: number; position: { x: number; y: number }; text: string }[], trigger?: boolean }>;

export default function MapController({ trigger, setTrigger }: { trigger: boolean; setTrigger: (trigger: boolean) => void }) {
    const mapRef = useRef<SVGSVGElement | null>(null);
    const dropZoneRef = useRef<HTMLDivElement | null>(null);
    const [children, setChildren] = useState<{ id: number; position: { x: number; y: number }; text: string }[]>([]);
    const [score, setScore] = useState<{ score: number; distance: number; name: string }[]>([]);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
      const dropZone = dropZoneRef.current;
      if (!dropZone) return;

      const observer = new ResizeObserver(([entry]) => {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      });

      observer.observe(dropZone);
      return () => observer.disconnect();
    }, []);

    return (
    <div ref={dropZoneRef} style={{
      height: '80vh',
      width: '95%',
      maxWidth: '100%',
      padding: '2%',
      border: '2px solid black',
      backfaceVisibility: 'hidden',
    }}>
      <DraggableContainer mapRef={mapRef} setScore={setScore} setTrigger={setTrigger} children={children} setChildren={setChildren} width={size.width} height={size.height} trigger={trigger} />
      <MapComponent mapRef={mapRef} width={size.width} height={size.height} children={children} trigger={trigger} />
      {trigger && <ScoreSheet score={score} trigger={trigger} />}
    </div>
)};
