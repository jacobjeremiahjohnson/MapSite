import Map from './Map';
import { useState, useRef, useEffect } from 'react';
import geoData from '../assets/DEGeo.json';
import DraggableContainer from './DraggableContainer';


export default function MapController() {
    const [{width, height}, setWH] = useState({ width: 1000, height: 1000 });
    const [text, setText] = useState('');
    const dropZoneRef = useRef<HTMLDivElement | null>(null);
    
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

    return (
    <div ref={dropZoneRef} id="map" style={{ height: '80vh', width: '100%' }}>
      <DraggableContainer width={width} height={height} />
      <Map width={width} height={height} />
    </div>
)};
