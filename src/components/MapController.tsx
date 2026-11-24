import Map from './Map';
import { useEffect, useRef, useState } from 'react';
import ScoreSheet from './ScoreSheet';
import { useTrigger } from '../functions/TriggerContext'
import DraggableContainer from './DraggableContainer';
import fetchCityCoords from '../functions/fetchCityCoords';

export default function MapController() {
    const mapRef = useRef<SVGSVGElement | null>(null);
    const dropZoneRef = useRef<HTMLDivElement | null>(null);
    const [children, setChildren] = useState<{ id: number; position: { x: number; y: number }; text: string }[]>([]);
    const [score, setScore] = useState<{ score: number; distance: number; name: string }[]>([]);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [testData, setTestData] = useState<{ name: string; latitude: number; longitude: number }[]>([]);
    const [loading, setLoading] = useState(false);

    const { trigger } = useTrigger();
    //const [error, setError] = useState<string | null>(null);
    
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

    useEffect(() => {
      
      if (!trigger) return;

      const controller = new AbortController();

      async function fetchData() {
        try {
          setLoading(true);
          const response = await fetchCityCoords('DE', children.map(child => child.text))
          console.log(response)

          const formattedResponse = response.map((city: any) => {
            return {
              name: city.city,
              latitude: city.lat,
              longitude: city.lng,
              population: city.population
            }
          })
          console.log(formattedResponse)
          setTestData(formattedResponse);
        } catch (error) {
            console.error('Error fetching city coordinates:', error);
            //setError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
      }
      fetchData();

      return () => {
        controller.abort();
      }
    }, [trigger]);

    return (
    <div ref={dropZoneRef} style={{
      height: '80vh',
      width: '95%',
      maxWidth: '100%',
      padding: '2%',
      border: '2px solid black',
      backfaceVisibility: 'hidden',
    }}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Map mapRef={mapRef} width={size.width} height={size.height} testData={testData} children={children} isLoading={loading} />
        <DraggableContainer mapRef={mapRef} testData={testData} setScore={setScore} children={children} setChildren={setChildren} width={size.width} height={size.height} />
      </div>
      {trigger && <ScoreSheet isLoading={loading} score={score} />}
    </div>
)};
