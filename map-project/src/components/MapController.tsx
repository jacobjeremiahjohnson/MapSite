import Map from './Map';
import { useState, useRef, useMemo, type ComponentType } from 'react';
import ScoreSheet from './ScoreSheet';
import DraggableContainer from './DraggableContainer';

const MapComponent = Map as ComponentType<{ mapRef?: React.RefObject<SVGSVGElement | null>; width?: number; height?: number; children?: { id: number; position: { x: number; y: number }; text: string }[], trigger?: boolean }>;

export default function MapController({ trigger, setTrigger }: { trigger: boolean; setTrigger: (trigger: boolean) => void }) {
    const mapRef = useRef<SVGSVGElement | null>(null);
    const dropZoneRef = useRef<HTMLDivElement | null>(null);
    const [children, setChildren] = useState<{ id: number; position: { x: number; y: number }; text: string }[]>([]);
    const [score, setScore] = useState<{ score: number; distance: number; name: string }[]>([]);

    const {width, height} = useMemo(() => {
      return {
        width: parseInt(dropZoneRef.current?.style.width || '0'),
        height: parseInt(dropZoneRef.current?.style.height || '0'),
      };
    }, [dropZoneRef.current?.style.width, dropZoneRef.current?.style.height]);

    return (
    <div ref={dropZoneRef} style={{
      height: '80vh',
      width: '95%',
      maxWidth: '100%',
      padding: '2%',
      border: '2px solid black',
      backfaceVisibility: 'hidden',
    }}>
      <DraggableContainer mapRef={mapRef} setScore={setScore} setTrigger={setTrigger} children={children} setChildren={setChildren} width={width} height={height} trigger={trigger} />
      <MapComponent mapRef={mapRef} width={width} height={height} children={children} trigger={trigger} />
      {trigger && <ScoreSheet score={score} trigger={trigger} />}
    </div>
)};
