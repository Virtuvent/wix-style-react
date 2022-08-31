import React from 'react';
import PropTypes from 'prop-types';
import { scaleTime, scaleLinear } from 'd3-scale';
import { max, bisector } from 'd3-array';
import { line, area, curveMonotoneX } from 'd3-shape';
import { select, pointer } from 'd3-selection';
import { easeQuadIn } from 'd3-ease';
import { ChartTooltip } from './ChartTooltip';
import { dataHooks } from './constants';
import { stVars as colors } from '../Foundation/stylable/colors.st.css';
import 'd3-transition';

const LINE_WIDTH = 2;
const AREA_MASK_ID = 'areaMaskId';
const TOOLTIP_ELEMENT_RADIUS = 4;
const DEFAULT_COLOR = colors.A1;

/** SparklineChart */
class SparklineChart extends React.PureComponent {
  constructor(props) {
    super(props);

    this.randomComponentId = Math.random().toString();
    this.chartContext = {};

    this.svgRef = React.createRef(null);
    this.componentRef = React.createRef(null);

    this.state = {
      hoveredLabel: null,
    };
  }

  _shouldShowTooltip = () => {
    const { hoveredLabel } = this.state;
    const { getTooltipContent } = this.props;
    return (
      getTooltipContent &&
      typeof getTooltipContent === 'function' &&
      hoveredLabel
    );
  };

  _useCreateContext = () => {
    const halfWidth = LINE_WIDTH / 2;
    const {
      width = 200,
      height = 40,
      data,
      highlightedStartingIndex = 0,
      color = DEFAULT_COLOR,
    } = this.props;

    const margin = {
      top: halfWidth + 2,
      right: halfWidth,
      bottom: halfWidth,
      left: halfWidth,
    };

    const innerTop = margin.top;
    const innerLeft = margin.left;
    const innerHeight = height - innerTop - margin.bottom;
    const innerWidth = width - innerLeft - margin.right;

    const maxValue = max(this._getValues(data));
    const firstLabel = this._getLabelAt(data, 0);
    const lastLabel = this._getLabelAt(data, data.length - 1);

    const xScale = scaleTime()
      .domain([firstLabel, lastLabel])
      .range([innerLeft, innerWidth]);
    const yScale = scaleLinear()
      .domain([0, maxValue])
      .range([innerHeight, innerTop]);

    const lineGenerator = line()
      .x((dataPoint, i) => {
        return xScale(this._getLabelAt(data, i));
      })
      .y(dataPoint => {
        return yScale(dataPoint);
      })
      .curve(curveMonotoneX);

    const areaGenerator = area()
      .x((dataPoint, i) => {
        return xScale(this._getLabelAt(data, i));
      })
      .y0(() => innerHeight)
      .y1(dataPoint => {
        return yScale(dataPoint);
      })
      .curve(curveMonotoneX);

    return {
      margin,
      width,
      height,
      innerTop,
      innerLeft,
      innerBottom: margin.top + innerHeight,
      innerWidth,
      innerHeight,
      data,
      xScale,
      yScale,
      highlightedStartingIndex,
      lineGenerator,
      areaGenerator,
      color,
    };
  };

  _getLabelAt = (data, position) => {
    return data[position] && data[position].label;
  };

  _getValueAt(data, position) {
    return data[position] && data[position].value;
  }

  _getValues = data => data.map(pair => pair.value);
  _getLabels = data => data.map(pair => pair.label);

  _drawSparkline = () => {
    const { width, height, data } = this.chartContext;
    const { onHover } = this.props;
    const labels = this._getLabels(data);

    const container = select(this.svgRef.current);

    container.attr('width', width).attr('height', height);
    const dataContainer = container.select(
      `[data-hook="${dataHooks.dataContainer}"]`,
    );

    this._drawLines(dataContainer);
    select(this.componentRef.current)
      .on('mouseleave', () => {
        this.setState({ hoveredLabel: null });
      })
      .on('mousemove', d => {
        const dateUnderPointer = this.chartContext.xScale.invert(pointer(d)[0]);
        const currentDateIndex = bisector(function(date) {
          return date;
        }).left(labels, dateUnderPointer, 1);

        const beforeDateIndex = currentDateIndex - 1;

        const beforeDate = labels[beforeDateIndex];
        const afterDate = labels[currentDateIndex];
        const closestDate =
          +dateUnderPointer - +beforeDate > +afterDate - +dateUnderPointer
            ? afterDate
            : beforeDate;

        if (
          typeof onHover === 'function' &&
          !this._areDatesEqual(closestDate, this.state.hoveredLabel)
        ) {
          const labelIndex = labels.indexOf(closestDate);
          onHover(labelIndex);
        }
        this.setState({ hoveredLabel: closestDate });
      });
  };

  _areDatesEqual(date1, date2) {
    const date1Time = date1 && date1.getTime();
    const date2Time = date2 && date2.getTime();
    return date1Time === date2Time;
  }

  _getLineColorId(dataSet, componentId) {
    return `${componentId}color`;
  }

  _getAreaMaskId(componentId) {
    return `${AREA_MASK_ID}${componentId}`;
  }

  _drawLines = dataContainer => {
    const { data, lineGenerator, areaGenerator, color } = this.chartContext;

    const dataSets = [data];
    dataContainer
      .selectAll('.chartLines')
      .data(dataSets)
      .join('g')
      .attr('class', 'chartLines')
      .selectAll('g')
      .data(dataSet => {
        return [dataSet];
      })
      .join(
        enter => {
          const group = enter.append('g');
          group
            .append('path')
            .attr('class', 'innerArea')
            .attr(
              'mask',
              `url(#${this._getAreaMaskId(this.randomComponentId)})`,
            )
            .attr('fill', dataSet => {
              return `url(#${color})`;
            })
            .attr('d', dataSet => {
              return areaGenerator(dataSet.map(() => 0));
            });
          group
            .append('path')
            .attr('class', 'innerLineBack')
            .attr('fill', 'none')
            .attr('stroke-width', LINE_WIDTH + 4)
            .attr('stroke-linecap', 'round')
            .attr('stroke', 'white')
            .attr('d', dataSet => {
              return lineGenerator(dataSet.map(() => 0));
            });

          group
            .append('path')
            .attr('class', 'innerLine')
            .attr('fill', 'none')
            .attr('stroke-width', LINE_WIDTH)
            .attr('stroke-linecap', 'round')
            .attr('stroke', dataSet => {
              return `url(#${this._getLineColorId(
                dataSet,
                this.randomComponentId,
              )})`;
            })
            .attr('d', dataSet => {
              return lineGenerator(dataSet.map(() => 0));
            });

          this._updateLines(group);

          return group;
        },
        update => {
          this._updateLines(update);
          return update;
        },
      );
  };

  _updateLines = container => {
    const { lineGenerator, areaGenerator } = this.chartContext;
    this._updateComponent(container, '.innerLine', set => {
      return lineGenerator(this._getValues(set));
    });

    this._updateComponent(container, '.innerLineBack', set => {
      return lineGenerator(this._getValues(set));
    });

    this._updateComponent(container, '.innerArea', set => {
      return areaGenerator(this._getValues(set));
    });
  };

  _updateComponent = (container, className, fncUpdater) => {
    const { animationDuration } = this.props;
    container
      .select(className)
      .transition()
      .duration(animationDuration)
      .ease(easeQuadIn)
      .attr('d', fncUpdater);
  };

  componentDidMount() {
    this._drawSparkline();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this._drawSparkline();
    }
  }

  _updateContext() {
    this.chartContext = this._useCreateContext();
  }

  render() {
    this._updateContext();
    const { getTooltipContent, className, dataHook } = this.props;
    const { hoveredLabel } = this.state;
    const context = this.chartContext;
    const {
      data,
      highlightedStartingIndex,
      innerWidth,
      height,
      width,
      color,
    } = context;

    const highlightedStartBefore = context.xScale(
      this._getLabelAt(data, highlightedStartingIndex - 1),
    );
    const highlightedStart = context.xScale(
      this._getLabelAt(data, highlightedStartingIndex),
    );
    const highlightedRelativeLocation = highlightedStart / innerWidth;
    const inter = (highlightedStart - highlightedStartBefore) / 2 / innerWidth;

    const labels = this._getLabels(data);
    const hoveredLabelIndex = bisector(function(d) {
      return d;
    }).left(labels, hoveredLabel, 0);
    const currentHoveredLabel = this._getLabelAt(data, hoveredLabelIndex);
    const currentHoveredValue = this._getValueAt(data, hoveredLabelIndex);
    const dataPoint = {
      content:
        getTooltipContent &&
        typeof getTooltipContent === 'function' &&
        getTooltipContent(hoveredLabelIndex),
      xCoordinate: context.xScale(currentHoveredLabel),
      yCoordinate:
        context.yScale(currentHoveredValue) - TOOLTIP_ELEMENT_RADIUS / 2,
    };
    const enableHighlightedAreaEffect = highlightedStartingIndex > 0;

    return (
      <div
        style={{ width, height, position: 'relative' }}
        ref={this.componentRef}
        className={className}
        data-hook={dataHook}
      >
        <svg style={{ overflow: 'visible', zIndex: 1 }} ref={this.svgRef}>
          <defs>
            <mask id={this._getAreaMaskId(this.randomComponentId)}>
              <rect
                x={highlightedStart}
                y="0"
                width={width}
                height={height}
                fill="white"
              />
            </mask>

            <linearGradient
              gradientUnits={'userSpaceOnUse'}
              key={`${this.randomComponentId}a`}
              id={this._getLineColorId(data, this.randomComponentId)}
              x1="0px"
              y1={`0px`}
              x2={`${innerWidth}px`}
              y2={'0px'}
            >
              {enableHighlightedAreaEffect && [
                <stop
                  key={0}
                  offset="0"
                  style={{ stopColor: '#dfe5eb', stopOpacity: 1 }}
                />,
                <stop
                  key={1}
                  offset={highlightedRelativeLocation - inter}
                  style={{ stopColor: '#dfe5eb', stopOpacity: 1 }}
                />,

                <stop
                  key={2}
                  offset={highlightedRelativeLocation}
                  style={{ stopColor: color, stopOpacity: 1 }}
                />,
              ]}
              <stop
                offset="1"
                style={{
                  stopColor: color,
                  stopOpacity: 1,
                }}
              />
            </linearGradient>

            <linearGradient
              gradientUnits={'userSpaceOnUse'}
              key={this.randomComponentId}
              id={color}
              x1="0px"
              y1={`${context.innerHeight}px`}
              x2="0px"
              y2={'0px'}
            >
              <stop offset="10%" style={{ stopColor: color, stopOpacity: 0 }} />
              <stop
                offset="90%"
                style={{
                  stopColor: color,
                  stopOpacity: 0.5,
                }}
              />
            </linearGradient>
          </defs>
          <g>
            <g data-hook={dataHooks.dataContainer}></g>
            {this._shouldShowTooltip() && (
              <g
                transform={`translate(${
                  dataPoint.xCoordinate
                }, ${dataPoint.yCoordinate + TOOLTIP_ELEMENT_RADIUS / 2})`}
              >
                <circle r={TOOLTIP_ELEMENT_RADIUS} fill={color}></circle>
              </g>
            )}
          </g>
        </svg>
        {this._shouldShowTooltip() && <ChartTooltip dataPoint={dataPoint} />}
      </div>
    );
  }
}

SparklineChart.displayName = 'SparklineChart';

SparklineChart.propTypes = {
  /** Applied as data-hook HTML attribute that can be used in the tests */
  dataHook: PropTypes.string,

  /** A css class to be applied to the component's root element */
  className: PropTypes.string,

  /** Sets the width of the sparkline (pixels) */
  width: PropTypes.number,

  /** Sets the height of the sparkline (pixels) */
  height: PropTypes.number,

  /** Chart data */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.instanceOf(Date),
      value: PropTypes.number,
    }),
  ).isRequired,

  /** Sets the color of the sparkline  */
  color: PropTypes.string,

  /** Indicates the starting index of the highlighted area. Default is 0  */
  highlightedStartingIndex: PropTypes.number,

  /** Tooltip content (JSX) getter function.  */
  getTooltipContent: PropTypes.func,

  /** callback when graph is hovered*/
  onHover: PropTypes.func,

  /** Sets the duration of the animation in milliseconds */
  animationDuration: PropTypes.number,
};

SparklineChart.defaultProps = {
  animationDuration: 300,
};

export default SparklineChart;
