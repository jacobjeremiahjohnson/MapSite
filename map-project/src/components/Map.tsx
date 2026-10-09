import { useMemo, useRef } from 'react';
import geoData from '../assets/DEGeo.json';
import testData from '../assets/DE_cities.json';
import * as d3 from 'd3';

const featureCollection = {
  type: 'FeatureCollection',
  features: geoData,
};

export default function Map({ width, height, trigger }: { width?: number; height?: number, trigger?: boolean }) {

  const svgRef = useRef<SVGSVGElement | null>(null);

  const paths = useMemo(() => {
    if (!width || !height) {
      return [];
    }
    const projection = d3.geoMercator().fitSize([width, height], featureCollection as any);
    const path = d3.geoPath(projection);

    return geoData
      .map((feature: any, index: number) => {
        const d = path(feature as any);

        if (!d) {
          return null;
        }

        return {
          id: feature.properties?.GEO_ID ?? index,
          name: feature.properties?.NAME ?? 'Unknown',
          d,
        };
      })
      .filter(Boolean) as Array<{ id: string | number; name: string; d: string }>;
  }, [width, height]);

  const cityMarkers = useMemo(() => {
    if (!width || !height) {
      return [];
    }

    const projection = d3.geoMercator().fitSize([width, height], featureCollection as any);
    return testData.map((city: any, index: number) => {
      const [x, y] = projection([city.longitude, city.latitude]) || [0, 0];
      return {
        id: index,
        name: city.name,
        pop: city.population,
        x,
        y,
      };
    });
  }, [width, height]);

  return (
    <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{
        width: '100%', 
        height: '100%',
        }}
      >
      <filter id="print-texture" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <g style = {{
        //transform: trigger ? `translate(${width}px, 0) scaleX(-1)` : 'translate(0, 0) scaleX(1)', 
      }}>
        {paths.map((pathItem) => (
          <path
            key={pathItem.id}
            d={pathItem.d}
            fill='none'
            stroke='black'
            strokeWidth='0.3'
            filter='url(#print-texture)'
          />
      ))}
        </g>
        {trigger && cityMarkers.map((city, index) => (
          <g>
            <circle
              onMouseOver={() => console.log(`City: ${city.name}`)}
              key={city.id}
              cx={city.x}
              cy={city.y}
              style={{
                // transform: trigger ? `translate(${width}px, 0) scaleX(-1)` : 'translate(0, 0) scaleX(1)',
              }}
              r={Math.round(1 + ((city.pop - 1000) / 69000) * 2) * 0.2}
              fill="light-red"
            />
            {city.pop > 10000 && <text
              x={city.x}
              textAnchor="start"
              fontSize="2"
              fontFamily="Calibri"
              y={city.y - 0.5}
              fill="black"
              style={{
                transform: trigger ? `scaleX(-1)` : 'scaleX(1)',
                transformOrigin: `center`,
                transformBox: 'fill-box',
              }}
            >
              {city.name}
            </text>}
          </g>
        ))}
    </svg>
  );
}
