import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';

import { isClassExists, makeControlled } from './index';

describe('test-utils', () => {
  describe('isClassExists function', () => {
    const classes = 'class class2 class3';
    const element = { className: classes };

    classes.split(' ').forEach(className =>
      it(`should return true for className ${className}`, () => {
        expect(isClassExists(element, className)).toBe(true);
      }),
    );

    [undefined, 'cla', 'class4'].forEach(className =>
      it(`should return false for className ${className}`, () => {
        expect(isClassExists(element, className)).toBe(false);
      }),
    );
  });

  describe('makeControlled function', () => {
    const UncontrolledInput = props => <input {...props} />;

    it('should init uncontrolled component with initial value', () => {
      const ControlledInput = makeControlled(UncontrolledInput);
      const initialValue = 'some value';
      const component = mount(<ControlledInput value={initialValue} />);

      expect(component.find('input').instance().value).toBe(initialValue);
    });

    it('should invoke onChange callback', () => {
      const onChange = jest.fn();
      const ControlledInput = makeControlled(UncontrolledInput);
      const component = mount(<ControlledInput onChange={onChange} />);

      const enteredValue = 'some value';
      const input = component.find('input');
      input.simulate('change', { target: { value: enteredValue } });
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0].target.value).toBe(enteredValue);
      expect(input.instance().value).toBe(enteredValue);
    });

    it('should bind passed prop-functions to *this*', () => {
      // NOTE: don't use arrow functions
      const onEnterListener = function() {
        this.setState({ value: '' });
      };
      const NotifyOnEnter = ({ onEnter, ...passedProps }) => (
        <UncontrolledInput
          {...passedProps}
          onKeyPress={e => e.key === 'Enter' && onEnter()}
        />
      );
      NotifyOnEnter.propTypes = {
        onEnter: PropTypes.func,
      };
      const ControlledInput = makeControlled(NotifyOnEnter);
      const component = mount(
        <ControlledInput value="some value" onEnter={onEnterListener} />,
      );

      const input = component.find('input');
      input.simulate('keypress', { key: 'Enter' });
      expect(input.instance().value).toBe('');
    });
  });
});
