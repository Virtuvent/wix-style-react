import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import s from './Toolbar.scss';
import Text from '../Text';

export const Toolbar = ({
  children,
  className,
}) => {
  return <div className={classNames([s.toolbar, className])}>{children}</div>;
};

Toolbar.displayName = 'Toolbar';

Toolbar.propTypes = {
  children: PropTypes.any, // TODO: validate children are of type <ItemGroup>
};

export const ItemGroup = props => {
  const classes = classNames([
    s.itemGroup,
    {
      positionStart: props.position === 'start',
      positionEnd: props.position === 'end',
    },
  ]);

  return <div className={classes}>{props.children}</div>;
};

ItemGroup.displayName = 'Toolbar.ItemGroup';

ItemGroup.propTypes = {
  children: PropTypes.any, // TODO: validate children are either <Item> od <Divider>
  position: PropTypes.oneOf(['start', 'end']),
};

ItemGroup.defaultProps = {
  position: 'start',
};

export const Item = props => {
  const classes = classNames([
    s.item,
    {
      [s.layoutButton]: props.layout === 'button',
    },
  ]);

  return <span className={classes}>{props.children}</span>;
};

Item.displayName = 'Toolbar.Item';

Item.propTypes = {
  children: PropTypes.any,
  layout: PropTypes.oneOf(['button']),
};

/**
 * Similar to the original WSR Label, but the label is displayed on the same line as the target element (and not above it).
 * TODO:; we might want to simply add this ability to the existing Label.
 */
export const Label = props => {
  return (
    <Text tagName="label" {...props} className={s.itemLabel}>
      {React.Children.toArray(props.children).map((c, index) => {
        return typeof c === 'string' ? <span key={index}>{c}</span> : c;
      })}
    </Text>
  );
};

Label.displayName = 'Toolbar.Label';

Label.propTypes = {
  children: PropTypes.any,
};

export const Divider = () => {
  return <span className={s.divider} />;
};
Divider.displayName = 'Toolbar.Divider';

// Aliases for convenience
Toolbar.ItemGroup = ItemGroup;
Toolbar.Item = Item;
Toolbar.Label = Label;
Toolbar.Divider = Divider;
