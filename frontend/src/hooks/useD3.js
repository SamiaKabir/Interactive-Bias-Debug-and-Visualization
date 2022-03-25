import React from 'react';
import * as d3 from 'd3';

export const useD3 = (renderChartFn, dependencies) => {
    const ref = React.useRef();

    React.useEffect(() => {
        let isMounted = true; 
        if (isMounted){renderChartFn(d3.select(ref.current));}
        return () => {isMounted = false };
      }, dependencies);
    return ref;
}