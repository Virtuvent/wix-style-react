import React from 'react';
import PropTypes from 'prop-types';
import Start from './Start';
import Center from './Center';
import End from './End';
import { st, classes } from './PageFooter.st.css';
import Divider from '../Divider';
import { buildChildrenObject } from 'wix-ui-core/dist/src/utils';

/** Layout footer component of 3 columns */
const PageFooter = ({ divider, className, children, dataHook }) => {
  const childrenObj = buildChildrenObject(children, {
    Start: <Start key="start" />,
    Center: <Center key="center" />,
    End: <End key="end" />,
  });
  return (
    <div className={classes.root}>
      {divider && (
        <div className={classes.divider}>
          <Divider />
        </div>
      )}
      <div
        className={st(classes.container, className)}
        children={Object.values(childrenObj)}
        data-hook={dataHook}
      >
        {Object.values(childrenObj)}
      </div>
    </div>
  );
};

PageFooter.displayName = 'PageFooter';

PageFooter.propTypes = {
  /** Either `<PageFooter.Start />`, `<PageFooter.Center />` or `<PageFooter.End />` components. */
  children: (props, propName) => {
    const childrenArr = React.Children.toArray(props[propName]);

    return childrenArr.reduce((err, child) => {
      if (
        !err &&
        child.type.displayName !== 'PageFooter.Start' &&
        child.type.displayName !== 'PageFooter.Center' &&
        child.type.displayName !== 'PageFooter.End'
      ) {
        return new Error(
          `Invalid children provided, unknown child <${child.type.displayName ||
            child.type} /> supplied`,
        );
      }

      return err;
    }, false);
  },

  /** Applied as data-hook HTML attribute that can be used in the tests */
  dataHook: PropTypes.string,

  /** A css class to be applied to the component's root element */
  className: PropTypes.string,

  /** A boolean to to determine whether to render a divider element */
  divider: PropTypes.bool,
};

PageFooter.defaultProps = {
  divider: false,
};

PageFooter.Start = Start;
PageFooter.Center = Center;
PageFooter.End = End;
PageFooter.Start.displayName = 'PageFooter.Start';
PageFooter.Center.displayName = 'PageFooter.Center';
PageFooter.End.displayName = 'PageFooter.End';
export default PageFooter;
