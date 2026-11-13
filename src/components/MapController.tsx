import Map from './Map';
import { useEffect, useRef, useState, type ComponentType } from 'react';
import ScoreSheet from './ScoreSheet';
import DraggableContainer from './DraggableContainer';
import fetchCityCoords from './fetchCityCoords';

const MapComponent = Map as ComponentType<{ mapRef?: React.RefObject<SVGSVGElement | null>; width?: number; height?: number; testData?: { name: string; latitude: number; longitude: number }[], isLoading?: boolean, children?: { id: number; position: { x: number; y: number }; text: string }[], trigger?: boolean }>;

export default function MapController({ trigger, setTrigger }: { trigger: boolean; setTrigger: (trigger: boolean) => void }) {
    const mapRef = useRef<SVGSVGElement | null>(null);
    const dropZoneRef = useRef<HTMLDivElement | null>(null);
    const [children, setChildren] = useState<{ id: number; position: { x: number; y: number }; text: string }[]>([]);
    const [score, setScore] = useState<{ score: number; distance: number; name: string }[]>([]);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [testData, setTestData] = useState<{ name: string; latitude: number; longitude: number }[]>([]);
    const [loading, setLoading] = useState(false);
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
      <DraggableContainer mapRef={mapRef} testData={testData} setScore={setScore} setTrigger={setTrigger} children={children} setChildren={setChildren} width={size.width} height={size.height} trigger={trigger} />
      <MapComponent mapRef={mapRef} width={size.width} height={size.height} testData={testData} children={children} trigger={trigger} isLoading={loading} />
      {trigger && <ScoreSheet isLoading={loading} score={score} trigger={trigger} />}
    </div>
)};
