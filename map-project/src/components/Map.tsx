import { useMemo } from 'react';
import geoData from '../assets/DEGeo.json';
import * as d3 from 'd3';

const featureCollection = {
  type: 'FeatureCollection',
  features: geoData,
};

export default function Map({ width = 800, height = 600 }: { width?: number; height?: number }) {
  const paths = useMemo(() => {
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

  return (
    <svg id='map' viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <g className='maplayer'>
        {paths.map((pathItem) => (
          <path
            key={pathItem.id}
            d={pathItem.d}
            fill='lightgray'
            stroke='black'
            strokeWidth='0.5'
          />
        ))}
      </g>
    </svg>
  );
}
