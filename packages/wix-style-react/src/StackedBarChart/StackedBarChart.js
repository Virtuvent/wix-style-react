import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from '../Tooltip';
import { st, classes } from './StackedBarChart.st.css';
import { stVars as colors } from '../Foundation/stylable/colors.st.css';
import { scalePoint, scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { axisBottom, axisRight } from 'd3-axis';
import { format } from 'd3-format';
import { dataHooks } from './constants';

const defaultYAxisTickFormat = format(',');
const defaultMargin = {
  top: 30,
  right: 30,
  bottom: 30,
  left: 40,
};

/** StackedBarChart */
class StackedBarChart extends React.PureComponent {
  constructor(props) {
    super(props);

    this.chart = React.createRef();

    window.chart = this;

    this.data = [];
    this.colors = [colors.B20, colors.B40];
    this.margin = Object.assign(defaultMargin, props.margin);
    this.width = props.width;
    this.height = props.height;
    this.chartWidth = this.width - this.margin.left - this.margin.right;
    this.chartHeight = this.height - this.margin.top - this.margin.bottom;

    this.state = {
      data: [],
      x: scalePoint().range([0, this.chartWidth]),
      y: scaleLinear().range([this.chartHeight, 0]),
    };
  }

  _update = () => {
    const { data, yAxisTickFormat } = this.props;
    const { svg, x, y } = this.state;

    // Data
    const _data = data.map(d => ({
      ...d,
      sum: d.values.reduce((a, b) => a + b, 0),
    }));

    // Scales
    const _x = x.domain(_data.map(d => d.label)).padding(0.5);
    const _y = y.domain([0, Math.max(..._data.map(d => d.sum))]);

    // Axis
    const xAxis = axisBottom(_x).tickSize(0);
    const yAxis = axisRight(_y)
      .tickSize(this.chartWidth)
      .tickFormat(d => yAxisTickFormat(d, defaultYAxisTickFormat(d)))
      .ticks(4);

    svg
      .select(`[data-hook="${dataHooks.xAxis}"]`)
      .call(xAxis)
      .selectAll('.tick text')
      .attr('dy', 12);
    svg
      .select(`[data-hook="${dataHooks.yAxis}"]`)
      .call(yAxis)
      .selectAll('.tick text')
      .attr('x', -6)
      .attr('dy', 4);

    this.setState({
      data: _data,
      x: _x,
      y: _y,
      xAxis,
      yAxis,
    });
  };

  componentDidMount() {
    this.setState(
      {
        svg: select(this.chart.current),
      },
      this._update,
    );
  }

  render() {
    const { tooltipTemplate, className, dataHook } = this.props;
    const { data, x, y } = this.state;

    return (
      <div data-hook={dataHook} className={st(classes.root, {}, className)}>
        {/* Chart */}
        <svg ref={this.chart} width={this.width} height={this.height}>
          {/* Axis */}
          <g
            data-hook={dataHooks.xAxis}
            className={classes.xAxis}
            transform={`translate(${this.margin.left}, ${this.chartHeight +
              this.margin.top})`}
          />
          <g
            data-hook={dataHooks.yAxis}
            className={classes.yAxis}
            transform={`translate(${this.margin.left}, ${this.margin.top})`}
          />

          {/* Bars */}
          <g
            data-hook={dataHooks.bars}
            transform={`translate(${this.margin.left}, ${this.margin.top})`}
          >
            {data.map((d, itemIndex) => {
              let stacked = this.chartHeight;
              return (
                <g key={itemIndex}>
                  {d.values.map((value, index) => {
                    const height = this.chartHeight - y(value);
                    stacked -= height;
                    return (
                      <rect
                        key={index}
                        fill={this.colors[index]}
                        height={height}
                        width={50}
                        x={x(d.label) - 25}
                        y={stacked}
                      />
                    );
                  })}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Tooltips */}
        {tooltipTemplate &&
          data.map((d, index) => (
            <div
              key={index}
              className={classes.tooltip}
              style={{
                left: x(d.label) + this.margin.left - 25,
                top: y(d.sum) + this.margin.top,
              }}
            >
              <Tooltip
                content={tooltipTemplate(d)}
                dataHook={dataHooks.tooltip}
              >
                <button
                  className={classes.tooltipInner}
                  style={{ height: `${this.chartHeight - y(d.sum)}px` }}
                />
              </Tooltip>
            </div>
          ))}
      </div>
    );
  }
}

StackedBarChart.displayName = 'StackedBarChart';

StackedBarChart.propTypes = {
  /** Applied as data-hook HTML attribute that can be used in the tests */
  dataHook: PropTypes.string,

  /** A css class to be applied to the component's root element */
  className: PropTypes.string,

  /** Chart data */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node,
      values: PropTypes.arrayOf(PropTypes.number),
    }),
  ),

  /** Tooltip template function */
  tooltipTemplate: PropTypes.func,

  /** Chart height (px) */
  height: PropTypes.number,

  /** Chart width (px) */
  width: PropTypes.number,

  /** Margin (px) for each side of the Chart. For example, in order to render larger number of digits at the yAxis, increase the left margin prop. */
  margin: PropTypes.shape({
    right: PropTypes.number,
    left: PropTypes.number,
    bottom: PropTypes.number,
    top: PropTypes.number,
  }),

  /**
   * ##### Formats Y axis ticks
   *  * `param` {string} `rawValue` - a raw value e.g. 10000
   *  * `param` {string} `rawValue` - number formatted value, comma separated e.g. 10,000
   *  * `return` {string} - the value to be shown as Y axis tick
   */
  yAxisTickFormat: PropTypes.func,
};

StackedBarChart.defaultProps = {
  data: [],
  width: 850,
  height: 350,
  margin: defaultMargin,
  yAxisTickFormat: defaultYAxisTickFormat,
};

export default StackedBarChart;
