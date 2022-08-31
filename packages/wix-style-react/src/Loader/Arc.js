import React from 'react';
import PropTypes from 'prop-types';

// taken from https://stackoverflow.com/a/18473154
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

/* eslint-disable max-params */
function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  const d = [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ');

  return d;
}
/* eslint-enable */

const Arc = ({ className, strokeWidth, viewBoxSize, angle }) => {
  const d = describeArc(0, 0, (viewBoxSize - strokeWidth) / 2, 0, angle);
  const viewBox = `-${viewBoxSize / 2} -${viewBoxSize /
    2} ${viewBoxSize} ${viewBoxSize}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      className={className}
    >
      <path strokeWidth={strokeWidth} d={d} />
    </svg>
  );
};

Arc.propTypes = {
  angle: PropTypes.number,
  className: PropTypes.string,
  strokeWidth: PropTypes.number,
  viewBoxSize: PropTypes.number,
};

Arc.displayName = 'Arc';

export default Arc;
