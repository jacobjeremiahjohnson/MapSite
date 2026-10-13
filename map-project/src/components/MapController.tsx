import Map from './Map';
import { useState, useRef, useEffect, useMemo, type ComponentType } from 'react';
import geoData from '../assets/DEGeo.json';
import DraggableContainer from './DraggableContainer';

const MapComponent = Map as ComponentType<{ width?: number; height?: number; children?: { id: number; position: { x: number; y: number }; text: string }[], trigger?: boolean }>;

export default function MapController({ trigger, setTrigger }: { trigger: boolean; setTrigger: (trigger: boolean) => void }) {
    const [text, setText] = useState('');
    const dropZoneRef = useRef<HTMLDivElement | null>(null);
    const [children, setChildren] = useState<{ id: number; position: { x: number; y: number }; text: string }[]>([]);
    const [score, setScore] = useState(0);

    const {width, height} = useMemo(() => {
      return {
        width: parseInt(dropZoneRef.current?.style.width || '0'),
        height: parseInt(dropZoneRef.current?.style.height || '0'),
      };
    }, [dropZoneRef.current?.style.width, dropZoneRef.current?.style.height]);

    useEffect(() => {    
      const load = function(){
        fetch( './DE_cities.csv' )
            .then( response => response.text() )
            .then( responseText => {
                setText( responseText );
            })
          }
      
          load();
    }, []);
    
    useEffect(() => {
      
    }, [score]);

    return (
    <div ref={dropZoneRef} style={{
      height: '80vh',
      width: '95%',
      maxWidth: '100%',
      padding: '2%',
      border: '2px solid black',
      backfaceVisibility: 'hidden',
    }}>
      <DraggableContainer setScore={setScore} setTrigger={setTrigger} children={children} setChildren={setChildren} width={width} height={height} trigger={trigger} />
      <MapComponent width={width} height={height} children={children} trigger={trigger} />
      {trigger && <div style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        position: 'absolute',
      }}>Score: {score}</div>}
    </div>
)};
