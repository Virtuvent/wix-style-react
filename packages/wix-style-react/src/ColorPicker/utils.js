import Color from 'color';
import mapValue from '../utils/operators/mapValue';

export function safeColor(input, allowEmpty = false) {
  try {
    if (allowEmpty) {
      return input ? Color(input) : Color().alpha(0);
    }
    return Color(input);
  } catch (error) {
    return null;
  }
}

export function getHexOrEmpty(_color) {
  return isTransparent(_color) ? '' : _color.hex();
}

export function getRgbOrEmpty(_color) {
  return isTransparent(_color)
    ? { r: '', g: '', b: '' }
    : mapValue(_color.rgb().object(), Math.round);
}

export function getHsbOrEmpty(_color) {
  return isTransparent(_color)
    ? { h: '', s: '', l: '' }
    : _color
        .hsl()
        .round()
        .object();
}

export function isTransparent(_color) {
  return _color.alpha() === 0;
}
