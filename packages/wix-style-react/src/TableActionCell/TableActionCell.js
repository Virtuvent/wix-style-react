import PropTypes from 'prop-types';
import React from 'react';
import ChevronRight from 'wix-ui-icons-common/ChevronRight';
import More from 'wix-ui-icons-common/More';
import PopoverMenu from '../PopoverMenu';
import Button from '../Button';
import IconButton from '../IconButton';
import Tooltip from '../Tooltip';
import { dataHooks } from './constants';
import HoverSlot from './HoverSlot';
import { classes } from './TableActionCell.st.css';
import { TooltipCommonProps } from '../common/PropTypes/TooltipCommon';

/* eslint-disable react/prop-types */
const renderPrimaryAction = ({ text, skin, onClick, disabled }, size) => (
  <Button
    disabled={disabled}
    skin={skin}
    dataHook={dataHooks.primaryAction}
    size={size}
    onClick={event => {
      onClick();
      // Making sure we don't also trigger onRowClick
      event.stopPropagation();
    }}
  >
    {text}
  </Button>
);
/* eslint-enable react/prop-types */

const renderVisibleActions = (actions, size) =>
  actions.map(
    (
      {
        text,
        icon,
        onClick,
        dataHook,
        disabled,
        disabledDescription,
        tooltipProps,
      },
      index,
    ) => (
      <Tooltip
        key={index}
        dataHook={dataHook || dataHooks.visibleActionTooltip}
        disabled={disabled && disabledDescription === ''}
        content={
          disabled && Boolean(disabledDescription) ? disabledDescription : text
        }
        {...tooltipProps}
      >
        <IconButton
          dataHook={dataHooks.visibleAction}
          skin="inverted"
          disabled={disabled}
          onClick={event => {
            onClick();
            event.stopPropagation();
          }}
          size={size}
        >
          {icon}
        </IconButton>
      </Tooltip>
    ),
  );

const renderHiddenActions = (actions, popoverMenuProps, size) => (
  <PopoverMenu
    dataHook={dataHooks.popoverMenu}
    appendTo="parent"
    placement="bottom"
    textSize="small"
    triggerElement={
      <IconButton
        skin="inverted"
        dataHook={dataHooks.triggerElement}
        size={size}
      >
        <More />
      </IconButton>
    }
    {...popoverMenuProps}
  >
    {actions.map(
      ({ text, icon, onClick, disabled, dataHook, divider }, index) =>
        !divider ? (
          <PopoverMenu.MenuItem
            key={index}
            dataHook={dataHook || dataHooks.popoverMenuItem}
            prefixIcon={icon}
            onClick={() => onClick()}
            text={text}
            disabled={disabled}
          />
        ) : (
          <PopoverMenu.Divider />
        ),
    )}
  </PopoverMenu>
);

const renderPlaceholder = () => (
  <IconButton dataHook={dataHooks.placeholder} skin="inverted">
    <ChevronRight />
  </IconButton>
);

const TableActionCell = props => {
  const {
    dataHook,
    primaryAction,
    secondaryActions,
    numOfVisibleSecondaryActions,
    alwaysShowSecondaryActions,
    popoverMenuProps,
    size,
  } = props;

  const visibleActions = secondaryActions.slice(
    0,
    numOfVisibleSecondaryActions,
  );
  const hiddenActions = secondaryActions.slice(numOfVisibleSecondaryActions);

  return (
    <span data-hook={dataHook} className={classes.root}>
      {primaryAction && (
        <HoverSlot display="onHover">
          {renderPrimaryAction(primaryAction, size)}
        </HoverSlot>
      )}

      {visibleActions.length > 0 && (
        <HoverSlot
          data-hook={dataHooks.visibleActionsWrapper}
          display={alwaysShowSecondaryActions ? 'always' : 'onHover'}
        >
          {renderVisibleActions(visibleActions, size)}
        </HoverSlot>
      )}

      {hiddenActions.length > 0 && (
        <div onClick={e => e.stopPropagation()}>
          <HoverSlot display="always">
            {renderHiddenActions(hiddenActions, popoverMenuProps, size)}
          </HoverSlot>
        </div>
      )}

      {primaryAction &&
        (!secondaryActions.length ||
          secondaryActions.length === numOfVisibleSecondaryActions) && (
          <HoverSlot display="notOnHover" className={classes.placeholderIcon}>
            {renderPlaceholder()}
          </HoverSlot>
        )}
    </span>
  );
};

TableActionCell.displayName = 'TableActionCell';

TableActionCell.propTypes = {
  dataHook: PropTypes.string,

  /**
   * An object containing the primary action properties: `text` is the action
   * text , `skin` is the button theme (can be `standard` or `inverted`),
   * `onClick` is the callback function for the action, whose signature is
   * `onClick(rowData, rowNum)`.
   * `disabled` is an optional prop for the primary action to be disabled
   */
  primaryAction: PropTypes.shape({
    text: PropTypes.string.isRequired,
    skin: PropTypes.oneOf(['standard', 'inverted']),
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  }),

  /**
   * An array containing the secondary actions: `text` is the action text
   * (will be shown in the tooltip), `icon` is the icon component for the
   * action, `onClick` is the callback function for the action, whose
   * signature is `onClick(rowData, rowNum)`.
   * `disabled` is an optional prop for the secondary action to be disabled
   * `dataHook` is an optional prop for accessing the action in tests
   * 'disabledDescription' is an optional prop that indicates what string to display in tooltip when action is visible and disabled (if none is provided, the text prop is used. if empty string is provided, no tooltip will be displayed)
   * 'tooltipProps' is an optional prop for controlling the tooltip shown when the action is visible
   * 'divider' is an optional prop to display a divider between the action items
   */
  secondaryActions: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
      onClick: PropTypes.func.isRequired,
      disabled: PropTypes.bool,
      dataHook: PropTypes.string,
      disabledDescription: PropTypes.string,
      tooltipProps: PropTypes.shape(TooltipCommonProps),
      divider: PropTypes.bool,
    }),
  ),

  /** The number of secondary actions to show outside the PopoverMenu */
  numOfVisibleSecondaryActions: PropTypes.number,

  /** Whether to show the secondary action also when not hovering the row */
  alwaysShowSecondaryActions: PropTypes.bool,

  /** Props being passed to the secondary actions' <PopoverMenu/> */
  popoverMenuProps: PropTypes.shape(PopoverMenu.propTypes),

  /** Size of actions */
  size: PropTypes.oneOf(['small', 'medium']),
};

TableActionCell.defaultProps = {
  primaryAction: null,
  secondaryActions: [],
  numOfVisibleSecondaryActions: 0,
  alwaysShowSecondaryActions: false,
  size: 'medium',
};

export default TableActionCell;
