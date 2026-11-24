
import { useTrigger } from '../functions/TriggerContext';

export default function CityMarkers({ children, cityMarkers, isLoading, visualScale }: { children?: { id: number; position: { x: number; y: number }; text: string }[], cityMarkers?: { id: number; name: string; pop: number; x: number; y: number }[], isLoading?: boolean, visualScale: number }) {
    const { trigger } = useTrigger();
  
    if (!trigger || isLoading) {
        return null;
    }
    
    return (
        children?.map((child) => {
          
          for (const city of cityMarkers ?? []) {
            if (city.name.toLowerCase() === child.text.toLowerCase()) {
              return (
          <g>
            <circle
              onMouseOver={() => console.log(`City: ${city.name}`)}
              key={city.id}
              cx={city.x}
              cy={city.y}
              style={{
                // transform: trigger ? `translate(${width}px, 0) scaleX(-1)` : 'translate(0, 0) scaleX(1)',
              }}
              r={Math.round(1 + ((city.pop - 1000) / 69000) * 2) * 0.2 * visualScale}
              fill="light-red"
            />
            <text
              x={city.x}
              textAnchor="start"
              fontSize={2 * visualScale}
              fontFamily="Calibri"
              y={city.y - 0.5 * visualScale}
              fill="black"
              style={{
                transform: trigger ? `scaleX(-1)` : 'scaleX(1)',
                transformOrigin: `center`,
                transformBox: 'fill-box',
              }}
            >
              {city.name}
            </text>
          </g>
              );
            }
        }
    }))
}