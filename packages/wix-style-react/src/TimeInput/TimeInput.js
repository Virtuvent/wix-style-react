import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isUndefined from 'lodash/isUndefined';
import moment from 'moment';
import Text from '../Text';
import Input from '../Input';
import Box from '../Box';
import { st, classes } from './TimeInput.st.css';
import { dataHooks } from './constants';
import { FontUpgradeContext } from '../FontUpgrade/context';

/**
 * An uncontrolled time input component with a stepper and am/pm support
 */
export default class TimeInput extends Component {
  static displayName = 'TimeInput';

  static propTypes = {
    /** Should time be shown as "--:--" when disabled */
    dashesWhenDisabled: PropTypes.bool,
    dataHook: PropTypes.string,

    /** The control's starting time */
    defaultValue: PropTypes.object,

    /** 24h mode  */
    disableAmPm: PropTypes.bool,

    /** Is disabled  */
    disabled: PropTypes.bool,

    /** Called upon blur */
    onChange: PropTypes.func,

    /** Display in RTL  */
    rtl: PropTypes.bool,

    style: PropTypes.object,

    /** The input width behavior, as 'auto' it will shrink, at '100%' it will grow */
    width: PropTypes.oneOf(['auto', '100%']),

    /** Number of minutes to be changed on arrow click */
    minutesStep: PropTypes.number,

    /** Custom suffix, located before ticker */
    customSuffix: PropTypes.node,

    /** Error flag */
    status: PropTypes.oneOf(['error', 'warning', 'loading']),

    /** When set to true, this input won't display status suffix */
    hideStatusSuffix: PropTypes.bool,

    /** The status message to display when hovering the status icon, if not given or empty there will be no tooltip */
    statusMessage: PropTypes.node,

    /** Display seconds  */
    showSeconds: PropTypes.bool,
  };

  static defaultProps = {
    defaultValue: moment(),
    onChange: () => {},
    style: {},
    disableAmPm: false,
    disabled: false,
    dashesWhenDisabled: false,
    minutesStep: 20,
    width: 'auto',
    showSeconds: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      focus: false,
      lastCaretIdx: 0,
      hover: false,
      ...this._getInitTime(
        this.props.defaultValue,
        this.props.showSeconds,
        this.props.disableAmPm,
      ),
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this._shouldUpdateState(nextProps)) {
      this.setState(
        this._getInitTime(
          nextProps.defaultValue,
          nextProps.showSeconds,
          nextProps.disableAmPm,
        ),
      );
    }
  }

  _shouldUpdateState(nextProps) {
    return (
      nextProps.defaultValue !== this.props.defaultValue ||
      nextProps.showSeconds !== this.props.showSeconds ||
      nextProps.disableAmPm !== this.props.disableAmPm
    );
  }

  _isAmPmMode(disableAmPm) {
    return (
      !disableAmPm &&
      moment('2016-04-03 13:14:00')
        .format('LT')
        .indexOf('PM') !== -1
    );
  }

  _getInitTime(value, showSeconds, disableAmPm) {
    let time = value || moment(),
      am = time.hours() < 12;

    const ampmMode = this._isAmPmMode(disableAmPm);

    ({ time, am } = this._normalizeTime(am, time, ampmMode));
    const text = this._formatTime(time, ampmMode, showSeconds);

    return { time, am, text, ampmMode };
  }

  _momentizeState(timeSet) {
    let time, am;
    const { ampmMode } = this.state;

    if (timeSet) {
      ({ time, am } = timeSet);
    } else {
      ({ time, am } = this.state);
    }

    let hours = time.hours();

    if (ampmMode && !am && hours < 12) {
      hours += 12;
    }

    if (ampmMode && am && hours === 12) {
      hours = 0;
    }

    const momentized = moment();
    momentized.hours(hours);
    momentized.minutes(time.minutes());
    momentized.seconds(0);
    return momentized;
  }

  _bubbleOnChange(timeSet) {
    const time = this._momentizeState(timeSet);
    this.props.onChange(time);
  }

  _timeStep(direction) {
    const time = this._momentizeState();
    const timeUnit = this.state.lastFocusedTimeUnit || 'minutes';
    const amount = timeUnit === 'hours' ? 1 : this.props.minutesStep;
    time.add(direction * amount, timeUnit);
    const am = time.hours() < 12;
    this._updateDate({ am, time });
  }

  _formatTime(
    time,
    ampmMode = this.state.ampmMode,
    showSeconds = this.props.showSeconds,
  ) {
    const withSeconds = showSeconds ? ':ss' : '';
    return ampmMode
      ? time.format(`hh:mm${withSeconds}`)
      : time.format(`HH:mm${withSeconds}`);
  }

  _getFocusedTimeUnit(caretIdx, currentValue) {
    let colonIdx = currentValue.indexOf(':');
    colonIdx = Math.max(0, colonIdx);
    return caretIdx <= colonIdx ? 'hours' : 'minutes';
  }

  _normalizeTime(am, time, ampmMode = this.state.ampmMode) {
    const hours = time.hours();

    if (ampmMode) {
      if (hours === 0) {
        return { time: time.clone().hours(12), am: true };
      }

      if (hours > 12) {
        return { time: time.clone().hours(hours - 12), am: false };
      }
    }

    return { time: time.clone().hours(hours), am };
  }

  _updateDate({ time, am }) {
    am = isUndefined(am) ? this.state.am : am;
    let newTime = moment(time, 'HH:mm');
    newTime = newTime.isValid() ? newTime : this.state.time;
    const normalizedTime = this._normalizeTime(am, newTime);
    ({ time, am } = normalizedTime);
    const text = this._formatTime(time);
    this.setState({ time, am, text });
    this._bubbleOnChange({ time, am });
  }

  _handleAmPmClick = () =>
    !this.props.disabled && this._updateDate({ am: !this.state.am });

  _handleFocus = input => this.setState({ focus: true, lastFocus: input });

  _handleBlur = () => {
    this.setState({ focus: false });
    this._updateDate({ time: this.state.text });
  };

  _handleInputChange = e => {
    // that is why cursor is jumping
    // https://github.com/facebook/react/issues/955#issuecomment-327069204
    const isDisabled = this.props.disabled && this.props.dashesWhenDisabled;
    const isInvalid = /[^0-9 :]/.test(e.target.value);
    if (isDisabled || isInvalid) {
      e.preventDefault();
      return;
    }
    return this.setState({
      text: e.target.value,
    });
  };

  _handleHover = hover => this.setState({ hover });

  _handleMinus = () => this._timeStep(-1);

  _handlePlus = () => this._timeStep(1);

  _handleInputBlur = ({ target }) => {
    if (this.props.disabled && this.props.dashesWhenDisabled) {
      return;
    }

    const caretIdx = target.selectionEnd || 0;
    let lastFocusedTimeUnit;

    if (caretIdx >= 0) {
      lastFocusedTimeUnit = this._getFocusedTimeUnit(caretIdx, target.value);
    }

    this.setState({ lastCaretIdx: caretIdx, lastFocusedTimeUnit });
    this._updateDate({ time: target.value });
  };

  _renderTimeTextbox() {
    const {
      customSuffix,
      disabled,
      dashesWhenDisabled,
      width,
      rtl,
      status,
      hideStatusSuffix,
      statusMessage,
      border,
    } = this.props;
    const text = disabled && dashesWhenDisabled ? '-- : --' : this.state.text;

    const suffix = (
      <Input.Group>
        <FontUpgradeContext.Consumer>
          {({ active: isMadefor }) => (
            <Box alignItems="center" justifyContent="space-between">
              <Box verticalAlign="middle" flexGrow={0} marginRight="6px">
                {this.state.ampmMode && (
                  <Text
                    weight={isMadefor ? 'thin' : 'normal'}
                    skin={disabled ? 'disabled' : 'standard'}
                    className={classes.ampm}
                    onClick={this._handleAmPmClick}
                    dataHook={dataHooks.amPmIndicator}
                  >
                    {this.state.am ? 'am' : 'pm'}
                  </Text>
                )}
              </Box>
              <Box
                align="right"
                verticalAlign="middle"
                className={classes.suffixEndWrapper}
              >
                {customSuffix && (
                  <Box marginRight="6px" width="max-content">
                    {typeof customSuffix === 'string' ? (
                      <Text
                        weight={isMadefor ? 'thin' : 'normal'}
                        light
                        secondary
                        dataHook={dataHooks.customSuffix}
                      >
                        {customSuffix}
                      </Text>
                    ) : (
                      <span data-hook={dataHooks.customSuffix}>
                        {customSuffix}
                      </span>
                    )}
                  </Box>
                )}
                <Input.Ticker
                  upDisabled={disabled}
                  downDisabled={disabled}
                  onUp={this._handlePlus}
                  onDown={this._handleMinus}
                  dataHook={dataHooks.ticker}
                />
              </Box>
            </Box>
          )}
        </FontUpgradeContext.Consumer>
      </Input.Group>
    );

    return (
      <Input
        ref="input"
        rtl={rtl}
        value={text}
        className={width === 'auto' ? classes.input : undefined}
        onFocus={this._handleFocus}
        onChange={this._handleInputChange}
        onBlur={this._handleInputBlur}
        dataHook={dataHooks.input}
        disabled={disabled}
        suffix={suffix}
        border={border}
        status={status}
        hideStatusSuffix={hideStatusSuffix}
        statusMessage={statusMessage}
      />
    );
  }

  render() {
    const {
      className,
      style,
      dataHook,
      rtl,
      disabled,
      width,
      showSeconds,
    } = this.props;
    const { focus, hover } = this.state;

    return (
      <div
        className={st(classes.root, { disabled, rtl, showSeconds }, className)}
        style={style}
        data-hook={dataHook}
      >
        <div
          onMouseOver={() => this._handleHover(true)}
          onMouseOut={() => this._handleHover(false)}
          className={st(
            classes.time,
            {
              focus,
              hover: hover && !focus,
              stretch: width === '100%',
            },
            className,
          )}
        >
          {this._renderTimeTextbox()}
        </div>
      </div>
    );
  }
}
