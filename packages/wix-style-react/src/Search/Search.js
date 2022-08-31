import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InputWithOptions from '../InputWithOptions';
import SearchIcon from 'wix-ui-icons-common/Search';
import { StringUtils } from '../utils/StringUtils';
import { st, classes } from './Search.st.css';
import Input from '../Input/Input';

// because lodash debounce is not compatible with jest timeout mocks
function debounce(fn, wait) {
  let timeout;

  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(context, args), wait);
  };
}

/**
 * Search component with suggestions based on input value listed in dropdown
 */
class Search extends Component {
  static displayName = 'Search';

  static propTypes = {
    ...InputWithOptions.propTypes,

    /** Will display the search icon only until clicked */
    expandable: PropTypes.bool,

    /** Width used for expanded state */
    expandWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /** Custom function for filtering options */
    predicate: PropTypes.func,

    /** onChange debounce in milliseconds */
    debounceMs: PropTypes.number,

    /** Mark in bold word parts based on search pattern */
    highlight: PropTypes.bool,
  };

  static defaultProps = {
    ...InputWithOptions.defaultProps,
    clearButton: true,
    placeholder: 'Search',
    expandable: false,
    expandWidth: '100%',
    debounceMs: 0,
    onChange: () => {},
    highlight: true,
    border: 'round',
  };

  constructor(props) {
    super(props);

    const initialValue = this._getIsControlled()
      ? props.value
      : props.defaultValue || '';

    this._onChangeHandler = this._createDebouncedOnChange();

    this.state = {
      inputValue: initialValue,
      collapsed: props.expandable && !initialValue && !props.autoFocus,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({ inputValue: this.props.value });
    }

    if (
      prevProps.debounceMs !== this.props.debounceMs ||
      prevProps.onChange !== this.props.onChange
    ) {
      this._onChangeHandler = this._createDebouncedOnChange();
    }
  }

  /**
   * Creates an onChange debounced function
   */
  _createDebouncedOnChange = () => {
    const { debounceMs, onChange } = this.props;
    return debounceMs > 0 ? debounce(onChange, debounceMs) : onChange;
  };

  _getIsControlled = () => 'value' in this.props && 'onChange' in this.props;

  _getFilteredOptions = () => {
    const { options, predicate } = this.props;

    const searchText = this._currentValue();
    if (!searchText || !searchText.length) {
      return options;
    }
    const filterFn = predicate || this._stringFilter;
    return options.filter(filterFn);
  };

  _stringFilter = option => {
    const searchText = this._currentValue();
    return StringUtils.includesCaseInsensitive(option.value, searchText.trim());
  };

  _onChange = e => {
    e.persist();

    this.setState(
      {
        inputValue: e.target.value,
      },
      () => {
        this._onChangeHandler(e);
      },
    );
  };

  _onClear = event => {
    const { expandable } = this.props;
    const { collapsed } = this.state;

    const stateChanges = {};

    if (!this._getIsControlled()) {
      stateChanges.inputValue = '';
    }

    if (expandable && !collapsed && this._currentValue === '') {
      stateChanges.collapsed = true;
      this.searchInput.input.blur();
    }

    this.setState(stateChanges, () => {
      this._onClearHandler(event);
    });
  };

  _onClearHandler = event => {
    const { onClear } = this.props;
    if (onClear) onClear(event);
  };

  _currentValue = () => this.state.inputValue;

  _onFocus = event => {
    const { onFocus } = this.props;

    if (this.state.collapsed && this.props.expandable) {
      this.setState({
        collapsed: false,
      });
    }

    onFocus && onFocus(event);
  };

  _onBlur = async event => {
    const { onBlur } = this.props;
    onBlur && (await onBlur(event));

    if (!this.state.collapsed && this.props.expandable) {
      const value = this._currentValue();

      if (value === '') {
        this.setState({
          collapsed: true,
        });
      }
    }
  };

  _onWrapperClick = () => {
    if (
      !this.props.expandable ||
      (this.props.expandable && this.state.collapsed)
    ) {
      this.searchInput.input.focus();
    }
  };

  _onWrapperMouseDown = e => {
    // We need to capture mouse down and prevent it's event if the input
    // is already open
    if (this.props.expandable && !this.state.collapsed) {
      const value = this._currentValue();

      if (value === '') {
        e.preventDefault();
      }
    }
  };

  render() {
    const {
      defaultValue,
      dataHook,
      expandWidth,
      highlight,
      ...restProps
    } = this.props;
    const { expandable, size } = restProps;
    const { collapsed, inputValue } = this.state;

    const contentStyle =
      expandable && !collapsed ? { width: expandWidth } : undefined;

    return (
      <div
        data-hook={dataHook}
        className={st(classes.root, {
          expandable,
          expanded: expandable && collapsed,
          size,
        })}
        onClick={this._onWrapperClick}
        onMouseDown={this._onWrapperMouseDown}
        data-expandable={expandable || null}
        data-collapsed={(expandable && collapsed) || null}
      >
        <div className={classes.content} style={contentStyle}>
          <InputWithOptions
            {...restProps}
            value={inputValue}
            ref={r => (this.searchInput = r)}
            prefix={
              <Input.IconAffix>
                <SearchIcon />
              </Input.IconAffix>
            }
            dataHook="search-inputwithoptions"
            menuArrow={false}
            closeOnSelect
            options={this._getFilteredOptions()}
            onClear={restProps.clearButton ? this._onClear : undefined}
            onChange={this._onChange}
            onFocus={this._onFocus}
            onBlur={this._onBlur}
            highlight={highlight}
          />
        </div>
      </div>
    );
  }
}

export default Search;
