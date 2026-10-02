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

  const drawMap = (data: any) => {
    
  }

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
        x,
        y,
      };
    });
  }, [width, height]);

  window.addEventListener('resize', () => drawMap(geoData));


  return (
    <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{ width: '100%', height: '100%' }}>
      <g>
        {paths.map((pathItem) => (
          <path
            key={pathItem.id}
            d={pathItem.d}
            fill='lightgray'
            stroke='black'
            strokeWidth='0.3'
          />
        ))}
        {trigger && cityMarkers.map((city) => (
          <circle
            onMouseOver={() => console.log(`City: ${city.name}`)}
            key={city.id}
            cx={city.x}
            cy={city.y}

            r="3"
            fill="red"
          />
        ))}
      </g>
    </svg>
  );
}
