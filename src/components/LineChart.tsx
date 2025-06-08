import React, { useState, useRef, useEffect } from 'react';

// Generic interfaces for chart data
export interface ChartDataset {
  label: string;
  data: number[];
  regionCode?: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface LineChartProps {
  data: ChartData;
  title: string;
  yAxisLabel?: string;
  unit?: string;
  className?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  yAxisLabel = 'Value (%)',
  unit = '%',
  className = ''
}) => {
  // Track which datasets are visible
  const [visibleDatasets, setVisibleDatasets] = useState<Record<string, boolean>>(
    Object.fromEntries(data.datasets.map(dataset => [dataset.label, true]))
  );

  // Track hover state for tooltip
  const [hoveredPoint, setHoveredPoint] = useState<{
    datasetIndex: number;
    pointIndex: number;
    x: number;
    y: number;
  } | null>(null);

  // Ref for scroll container and SVG element
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const hasAutoScrolled = useRef(false);

  // Zoom state - controls how many pixels per data point
  const [zoomLevel, setZoomLevel] = useState(80); // Default 80px per data point

  const toggleDataset = (label: string) => {
    setVisibleDatasets(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  // Auto-scroll to right only on initial mount
  useEffect(() => {
    if (scrollContainerRef.current && !hasAutoScrolled.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
      hasAutoScrolled.current = true;
    }
  }, [data.labels.length]); // Re-run when data changes

  if (!data.labels.length || !data.datasets.length) {
    return (
      <div className={`bg-forest-800 p-6 rounded-lg border border-forest-600 shadow-lg ${className}`}>
        <h3 className="text-lg font-semibold text-accent-400 mb-4">{title}</h3>
        <div className="text-forest-200 text-center py-12">No data available</div>
      </div>
    );
  }


  // Responsive width calculation based on zoom level
  const width = Math.max(800, data.labels.length * zoomLevel); // Minimum 800px, or zoomLevel px per label
  const height = 350;
  const margin = { top: 20, right: 40, bottom: 80, left: 100 }; // Increased left margin for better spacing
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Calculate scales based on ALL data (not just visible) to maintain consistent grid
  const allValues = data.datasets.flatMap(d => d.data);
  const minY = allValues.length > 0 ? Math.min(...allValues) : 0;
  const maxY = allValues.length > 0 ? Math.max(...allValues) : 1;
  const yRange = maxY - minY;
  const yPadding = yRange * 0.1;
  const yMin = Math.max(0, minY - yPadding); // Don't go below 0 for percentages
  const yMax = maxY + yPadding;

  const xScale = (index: number) => (index / (data.labels.length - 1)) * chartWidth;
  const yScale = (value: number) => chartHeight - ((value - yMin) / (yMax - yMin)) * chartHeight;

  // Region colors
  const regionColors = {
    'United States': '#10b981', // emerald-500
    'Midwest': '#f59e0b',       // amber-500
    'Northeast': '#3b82f6',     // blue-500
    'South': '#ef4444',         // red-500
    'West': '#8b5cf6'           // violet-500
  };

  return (
    <div className={`bg-forest-800 p-6 rounded-lg border border-forest-600 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-forest-400 flex-1 text-center">{title}</h3>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-forest-300">Zoom:</span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 20, 120))}
            className="px-2 py-1 bg-forest-700 hover:bg-forest-600 text-forest-200 rounded text-sm transition-colors"
            title="Zoom In"
          >
            +
          </button>
          <span className="text-xs text-forest-400 min-w-[3rem] text-center">
            {Math.round((80 / zoomLevel) * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 20, 20))}
            className="px-2 py-1 bg-forest-700 hover:bg-forest-600 text-forest-200 rounded text-sm transition-colors"
            title="Zoom Out"
          >
            -
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="flex">
          {/* Sticky Y-axis section */}
          <div className="flex-shrink-0 relative">
            {/* Y-axis label - positioned well to the left of the line */}
            <div className="absolute left-4 top-[calc(50%+70px)] -translate-y-1/2 -rotate-90 text-sm text-forest-300 z-10 pointer-events-none whitespace-nowrap origin-left">
              {yAxisLabel}
            </div>

            {/* Sticky Y-axis SVG */}
            <svg width={margin.left} height={height} className="text-forest-400">
              <g transform={`translate(${margin.left}, ${margin.top})`}>
                {/* Grid lines - use nice round numbers */}
                {(() => {
                  const range = yMax - yMin;
                  const stepSize = range / 5;
                  const niceStep = Math.ceil(stepSize * 10) / 10;

                  const gridValues = [];
                  const startValue = Math.ceil(yMin / niceStep) * niceStep;

                  for (let value = startValue; value <= yMax; value += niceStep) {
                    gridValues.push(value);
                  }

                  return gridValues.map((value, index) => {
                    const y = yScale(value);

                    return (
                      <g key={index}>
                        <text
                          x={-30}
                          y={y + 4}
                          fontSize="12"
                          fill="#9ca3af"
                          textAnchor="end"
                        >
                          {value.toFixed(1)}
                        </text>
                      </g>
                    );
                  });
                })()}

                {/* Y-axis line */}
                <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#6b7280" strokeWidth={1} />
              </g>
            </svg>
          </div>

          {/* Scrollable chart area */}
          <div className="flex-1 overflow-x-auto" ref={scrollContainerRef}>
            <svg ref={svgRef} width={width - margin.left} height={height} className="text-forest-200">
              <g transform={`translate(0, ${margin.top})`}>
                {/* Horizontal grid lines only */}
                {(() => {
                  const range = yMax - yMin;
                  const stepSize = range / 5;
                  const niceStep = Math.ceil(stepSize * 10) / 10;

                  const gridValues = [];
                  const startValue = Math.ceil(yMin / niceStep) * niceStep;

                  for (let value = startValue; value <= yMax; value += niceStep) {
                    gridValues.push(value);
                  }

                  return gridValues.map((value, index) => {
                    const y = yScale(value);

                    return (
                      <line
                        key={index}
                        x1={0}
                        y1={y}
                        x2={chartWidth}
                        y2={y}
                        stroke="#374151"
                        strokeWidth={0.5}
                        strokeDasharray="2,2"
                      />
                    );
                  });
                })()}

                {/* X-axis labels - rotated */}
                {data.labels.map((label, index) => (
                  <text
                    key={index}
                    x={xScale(index)}
                    y={chartHeight + 25}
                    fontSize="11"
                    fill="#9ca3af"
                    textAnchor="start"
                    transform={`rotate(45, ${xScale(index)}, ${chartHeight + 25})`}
                  >
                    {label}
                  </text>
                ))}

                {/* Lines - only render visible datasets */}
                {data.datasets.map((dataset, datasetIndex) => {
                  if (!visibleDatasets[dataset.label]) return null;

                  const pathData = dataset.data.map((value, index) =>
                    `${index === 0 ? 'M' : 'L'} ${xScale(index)} ${yScale(value)}`
                  ).join(' ');

                  return (
                    <g key={datasetIndex}>
                      <path
                        d={pathData}
                        fill="none"
                        stroke={regionColors[dataset.label as keyof typeof regionColors] || '#10b981'}
                        strokeWidth={2}
                        className="hover:stroke-width-3 transition-all duration-200"
                      />
                      {/* Data points */}
                      {dataset.data.map((value, index) => {
                        const cx = xScale(index);
                        const cy = yScale(value);
                        const isHovered = hoveredPoint?.datasetIndex === datasetIndex && hoveredPoint?.pointIndex === index;

                        return (
                          <g key={index}>
                            {/* Add a small crosshair to show exact center position */}
                            {isHovered && (
                              <>
                                <line
                                  x1={cx - 8}
                                  y1={cy}
                                  x2={cx + 8}
                                  y2={cy}
                                  stroke="#ffffff"
                                  strokeWidth={1}
                                  opacity={0.7}
                                />
                                <line
                                  x1={cx}
                                  y1={cy - 8}
                                  x2={cx}
                                  y2={cy + 8}
                                  stroke="#ffffff"
                                  strokeWidth={1}
                                  opacity={0.7}
                                />
                              </>
                            )}
                            <circle
                              cx={cx}
                              cy={cy}
                              r={isHovered ? 5 : 3}
                              fill={regionColors[dataset.label as keyof typeof regionColors] || '#10b981'}
                              stroke={isHovered ? '#ffffff' : 'none'}
                              strokeWidth={isHovered ? 2 : 0}
                              className="transition-all duration-200 cursor-pointer"
                              onMouseEnter={(e) => {
                                const svgRect = svgRef.current?.getBoundingClientRect();
                                const pointRect = e.currentTarget.getBoundingClientRect();
                                if (svgRect) {
                                  setHoveredPoint({
                                    datasetIndex,
                                    pointIndex: index,
                                    x: pointRect.left + pointRect.width / 2,
                                    y: pointRect.top + pointRect.height / 2
                                  });
                                }
                              }}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                          </g>
                        );
                      })}
                    </g>
                  );
                })}

              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Interactive Legend */}
      <div className="flex flex-wrap gap-4 mt-4">
        {data.datasets.map((dataset, index) => {
          const isVisible = visibleDatasets[dataset.label];
          return (
            <div
              key={index}
              className="flex items-center gap-2 cursor-pointer hover:bg-forest-700 px-2 py-1 rounded transition-colors duration-200"
              onClick={() => toggleDataset(dataset.label)}
            >
              <div
                className={`w-3 h-3 rounded-full transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-30'
                  }`}
                style={{ backgroundColor: regionColors[dataset.label as keyof typeof regionColors] || '#10b981' }}
              />
              <span className={`text-sm transition-colors duration-200 ${isVisible ? 'text-forest-200' : 'text-forest-400 line-through'
                }`}>
                {dataset.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Hover Tooltip */}
      {hoveredPoint && (() => {
        // Smart positioning to avoid screen edges
        const tooltipWidth = 180; // Approximate tooltip width
        const tooltipHeight = 70; // Approximate tooltip height
        const offset = 15; // Distance from point

        // Check if tooltip would go off right edge
        const wouldOverflowRight = hoveredPoint.x + tooltipWidth + offset > window.innerWidth;
        const leftPosition = wouldOverflowRight
          ? hoveredPoint.x - tooltipWidth - offset
          : hoveredPoint.x + offset;

        // Check if tooltip would go off top edge
        const wouldOverflowTop = hoveredPoint.y - tooltipHeight - offset < 0;
        const topPosition = wouldOverflowTop
          ? hoveredPoint.y + offset
          : hoveredPoint.y - tooltipHeight - offset;

        return (
          <div
            className="fixed bg-forest-900 border border-forest-600 rounded-lg p-3 text-sm shadow-xl z-50 pointer-events-none"
            style={{
              left: leftPosition,
              top: topPosition,
            }}
          >
            <div className="text-accent-400 font-semibold mb-1">
              {data.datasets[hoveredPoint.datasetIndex].label}
            </div>
            <div className="text-forest-200">
              <span className="text-forest-300">Time:</span> {data.labels[hoveredPoint.pointIndex]}
            </div>
            <div className="text-forest-200">
              <span className="text-forest-300">Value:</span> {data.datasets[hoveredPoint.datasetIndex].data[hoveredPoint.pointIndex]}{unit}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default LineChart;