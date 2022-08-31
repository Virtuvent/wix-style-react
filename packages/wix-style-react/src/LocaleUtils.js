import { setDay, format } from 'date-fns';

// todo: Change the imports syntax after wix-ui-tpa will support ESModules
import en from 'date-fns/locale/en-US';
import es from 'date-fns/locale/es';
import pt from 'date-fns/locale/pt';
import fr from 'date-fns/locale/fr';
import de from 'date-fns/locale/de';
import pl from 'date-fns/locale/pl';
import it from 'date-fns/locale/it';
import ru from 'date-fns/locale/ru';
import ja from 'date-fns/locale/ja';
import ko from 'date-fns/locale/ko';
import tr from 'date-fns/locale/tr';
import sv from 'date-fns/locale/sv';
import nl from 'date-fns/locale/nl';
import da from 'date-fns/locale/da';
import th from 'date-fns/locale/th';
import cs from 'date-fns/locale/cs';
import zh from 'date-fns/locale/zh-CN';
import uk from 'date-fns/locale/uk';
import no from 'date-fns/locale/nb';
import ar from 'date-fns/locale/ar-SA';
import bg from 'date-fns/locale/bg';
import el from 'date-fns/locale/el';
import fi from 'date-fns/locale/fi';
import he from 'date-fns/locale/he';
import hi from 'date-fns/locale/hi';
import hu from 'date-fns/locale/hu';
import id from 'date-fns/locale/id';
import ms from 'date-fns/locale/ms';
import ro from 'date-fns/locale/ro';
import lt from 'date-fns/locale/lt';
import vi from 'date-fns/locale/vi';
/** ***************/

import { convertTokens } from '@date-fns/upgrade/v2';

const MONTHS_INDEXES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
export const CAPITALIZED_MONTH_LANGUAGES = [
  'es',
  'de',
  'fr',
  'ru',
  'it',
  'uk',
  'nl',
  'tr',
  'pl',
  'cs',
  'no',
  'pt',
];

export function capitalizeFirstLetter(str) {
  if (!str) {
    return undefined;
  }
  return str[0].toLocaleUpperCase() + str.substring(1);
}

// Capitalize first letter of month in certain languages
const capitalizeMonth = (month, locale) => {
  const shouldCapitalizeMonth = CAPITALIZED_MONTH_LANGUAGES.includes(locale);

  if (shouldCapitalizeMonth) {
    return capitalizeFirstLetter(month);
  }
  return month;
};

const locales = {
  en,
  es,
  pt,
  fr,
  de,
  pl,
  it,
  ru,
  ja,
  ko,
  tr,
  sv,
  no,
  nl,
  da,
  th,
  cs,
  zh,
  uk,
  ar,
  bg,
  el,
  fi,
  he,
  hi,
  hu,
  id,
  ms,
  ro,
  lt,
  vi,
};

const getLocale = locale =>
  typeof locale === 'string' ? locales[locale] : locale;

export const formatDate = (date, dateFormat, locale) =>
  format(date, convertTokens(dateFormat), {
    locale: getLocale(locale),
  });

export const formatDateV2 = (date, dateFormatV2, locale) =>
  format(date, dateFormatV2, {
    locale: getLocale(locale),
  });

export default locale => ({
  formatMonthTitle: date =>
    capitalizeMonth(
      format(date, 'LLLL yyyy', {
        locale: getLocale(locale),
      }),
      locale,
    ),

  formatWeekdayShort: index =>
    format(setDay(new Date(), index), 'iiiiii', {
      locale: getLocale(locale),
    }),

  formatWeekdayLong: index =>
    format(setDay(new Date(), index), 'iiii', {
      locale: getLocale(locale),
    }),

  formatDay: date =>
    format(date, 'iii	PP', {
      locale: getLocale(locale),
    }),

  getMonths: () =>
    MONTHS_INDEXES.map(i =>
      capitalizeMonth(
        format(new Date(2018, i), 'LLLL', {
          locale: getLocale(locale),
        }),
        locale,
      ),
    ),
});
