import React from 'react';
import { Popover as CorePopover } from 'wix-ui-core/dist/src/components/popover';
import { buildChildrenObject } from 'wix-ui-core/dist/src/utils';
import requestAnimationFramePolyfill from '../utils/request-animation-frame';

import PropTypes from 'prop-types';

import { st, classes } from './Popover.st.css';
import { FontUpgradeContext } from '../FontUpgrade/context';
import FontUpgrade from '../FontUpgrade';
import { ThemeProviderConsumerBackwardCompatible } from '../ThemeProvider/ThemeProviderConsumerBackwardCompatible';

export { placements } from './constants';
/**
 *  This has been added in order to fix jsdom not having requestAnimation frame
 *  installed. Jest by default has this polyfilled, but mocha fails on it.
 *  Decided with Shlomi to get rid of this on next major version 7, where we will support
 *  only jest.
 */
if (process.env.NODE_ENV === 'test') {
  requestAnimationFramePolyfill.install();
}

const ANIMATION_ENTER = 150;
const ANIMATION_EXIT = 100;

const ContentElement = ({ children }) => {
  return (
    <FontUpgradeContext.Consumer>
      {({ active }) => {
        return (
          <FontUpgrade active={!!active}>
            <CorePopover.Content children={children} />
          </FontUpgrade>
        );
      }}
    </FontUpgradeContext.Consumer>
  );
};

ContentElement.displayName = 'Popover.Content';

class Popover extends React.Component {
  static displayName = 'Popover';

  static Element = CorePopover.Element;
  static Content = ContentElement;

  static propTypes = {
    ...CorePopover.propTypes,
    /** Applied as data-hook HTML attribute that can be used in the tests */
    dataHook: PropTypes.string,

    /** Adds enter and exit animation */
    animate: PropTypes.bool,

    /** The theme of the popover */
    theme: PropTypes.oneOf(['dark', 'light']),

    children: (props, propName) => {
      const childrenArr = React.Children.toArray(props[propName]);
      const childrenObj = buildChildrenObject(childrenArr, {
        Element: null,
        Content: null,
      });

      if (!childrenObj.Element) {
        return new Error(
          'Invalid children provided, <Popover.Element/> must be provided',
        );
      }

      if (!childrenObj.Content) {
        return new Error(
          'Invalid children provided, <Popover.Content/> must be provided',
        );
      }

      return childrenArr.reduce((err, child) => {
        if (
          !err &&
          child.type.displayName !== 'Popover.Element' &&
          child.type.displayName !== 'Popover.Content'
        ) {
          return new Error(
            `Invalid children provided, unknown child <${child.type
              .displayName || child.type}/> supplied`,
          );
        }

        return err;
      }, false);
    },
  };

  static defaultProps = {
    appendTo: 'parent',
    animate: false,
  };

  render() {
    const { dataHook, animate, theme, className, ...rest } = this.props;

    const timeout = animate
      ? { enter: ANIMATION_ENTER, exit: ANIMATION_EXIT }
      : undefined;

    return (
      <ThemeProviderConsumerBackwardCompatible>
        {({ className: themeClassName }) => (
          <CorePopover
            disableClickOutsideWhenClosed
            timeout={timeout}
            data-hook={dataHook}
            {...rest}
            className={st(classes.root, { theme }, className, themeClassName)}
          />
        )}
      </ThemeProviderConsumerBackwardCompatible>
    );
  }
}

export default Popover;
