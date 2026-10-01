import Map from './Map';
import { useState, useRef, useEffect, useMemo, type ComponentType } from 'react';
import geoData from '../assets/DEGeo.json';
import DraggableContainer from './DraggableContainer';

const MapComponent = Map as ComponentType<{ width?: number; height?: number; trigger?: boolean }>;

export default function MapController() {
    const [text, setText] = useState('');
    const dropZoneRef = useRef<HTMLDivElement | null>(null);
    const [trigger, setTrigger] = useState(false);
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
    <div ref={dropZoneRef} id="map" style={{ height: '80vh', width:'100%', maxWidth: '100%' }}>
      <DraggableContainer setScore={setScore} setTrigger={setTrigger} width={width} height={height} trigger={trigger} />
      <MapComponent width={width} height={height} trigger={trigger} />
      {trigger && <div>Score: {score}</div>}
    </div>
)};
