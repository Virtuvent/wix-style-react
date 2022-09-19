import React from 'react';
import PropTypes from 'prop-types';
import CalendarIcon from 'wix-ui-icons-common/Date';
import Input from '../../Input';
import { formatDate, formatDateV2 } from '../../LocaleUtils';
import { classes } from './DateInput.st.css';

class DateInput extends React.PureComponent {
  static displayName = 'DateInput';
  static defaultProps = {
    locale: 'en',
  };
  static defaultDateFormatV2 = 'LL/dd/yyyy';

  _formatDateValue = () => {
    const { value, dateFormat, dateFormatV2, locale } = this.props;

    if (!value) {
      return '';
    }

    if (dateFormatV2) {
      if (typeof dateFormatV2 === 'function') {
        return dateFormatV2(value);
      }

      return formatDateV2(value, dateFormatV2, locale);
    }

    if (dateFormat) {
      if (typeof dateFormat === 'function') {
        return dateFormat(value);
      }

      return formatDate(value, dateFormat, locale);
    }

    return formatDateV2(value, DateInput.defaultDateFormatV2, locale);
  };

  render() {
    const { value: initialValue, customInput, ...rest } = this.props;
    const _inputProps = {
      value: this._formatDateValue(),
      suffix: (
        <Input.IconAffix dataHook="date-input-date-icon" className={classes.suffixIcon}>
          <CalendarIcon />
        </Input.IconAffix>
      ),
      autoSelect: false,
      ...rest,
      ...(customInput ? customInput.props : {}),
    };
    return React.cloneElement(customInput || <Input />, _inputProps);
  }
}

DateInput.propTypes = {
  ...Input.propTypes,
  /** The selected date */
  value: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
    PropTypes.number,
  ]),
  /** Instance locale */
  locale: PropTypes.oneOfType([
    PropTypes.oneOf([
      'en',
      'es',
      'pt',
      'fr',
      'de',
      'pl',
      'it',
      'ru',
      'ja',
      'ko',
      'tr',
      'sv',
      'no',
      'nl',
      'da',
      'zh',
      'th',
      'cs',
      'uk',
    ]),
    PropTypes.shape({
      code: PropTypes.string,
      formatDistance: PropTypes.func,
      formatRelative: PropTypes.func,
      localize: PropTypes.object,
      formatLong: PropTypes.object,
      match: PropTypes.object,
      options: PropTypes.object,
    }),
  ]),
  /** this prop is deprecated and should not be used
   * @deprecated
   */
  dateFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  /** Custom date format V2, can be either:
   * * `string` of tokens (see [`date-fns V2` docs](https://date-fns.org/v2.15.0/docs/format) for list of supported tokens)
   * * `function` of signature `Date -> String`
   */
  dateFormatV2: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
};

export default DateInput;
