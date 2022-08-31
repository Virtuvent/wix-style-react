import { baseUniDriverFactory } from 'wix-ui-test-utils/base-driver';
import { radioUniDriverFactory } from '../Radio/Radio.uni.driver';
import { dataHooks } from './constants';
import { dataHooks as radioDataHooks } from '../Radio/constants';

export const radioGroupUniDriverFactory = (base, body) => {
  const getOptionContainer = () =>
    base.$(`[data-hook="${dataHooks.RadioOptionContainer}"]`);

  const getRadios = async () =>
    await base
      .$$(`[data-hook^="${dataHooks.RadioContainer}-"] > :first-child`)
      .map(radio =>
        radioButtonUniDriverFactory(radio, body, getOptionContainer),
      );

  const getRadioByValue = async value =>
    radioButtonUniDriverFactory(
      base.$(
        `[data-hook="${dataHooks.RadioContainer}-${value}"] > :first-child`,
      ),
      body,
      getOptionContainer,
    );

  const getRadioByIndex = async index => (await getRadios())[index];

  const getSelectedRadio = async () => {
    for (const radio of await getRadios()) {
      if (await radio.isChecked()) {
        return radio;
      }
    }
  };

  return {
    ...baseUniDriverFactory(base, body),

    /** Selects the radio that matches the provided value */
    selectByValue: async value => (await getRadioByValue(value)).click(),

    /** Selects the radio in the provided index */
    selectByIndex: async index => (await getRadioByIndex(index)).click(),

    /** Get the radio value in the provided index */
    getRadioValueAt: async index => (await getRadioByIndex(index)).getValue(),

    /** Get the radio element in the provided index, returns an element merged with the RadioButton driver methods */
    getRadioAtIndex: async index => await getRadioByIndex(index),

    /** Get the value of the selected radio */
    getSelectedValue: async () => {
      const selected = await getSelectedRadio();
      return selected ? selected.getValue() : null;
    },

    /** Checks if the radio in the provided index is disabled */
    isRadioDisabled: async index => (await getRadioByIndex(index)).isDisabled(),

    /** Get the number of rendered radios */
    getNumberOfRadios: async () => (await getRadios()).length,

    /** Get the value of radio button id at the provided index */
    getRadioIdAt: async index => (await getRadioByIndex(index)).getId(),

    /** Get the value of radio button name at the provided index */
    getRadioName: async () => (await getRadioByIndex(0)).getName(),

    /** Checks if the radio with the provided index is checked */
    isRadioChecked: async index => (await getRadioByIndex(index)).isChecked(),
  };
};

const radioButtonUniDriverFactory = (base, body, container) => {
  const getByDataHook = dataHook => base.$(`[data-hook="${dataHook}"]`);
  const radioLabel = () => getByDataHook(radioDataHooks.label);

  return {
    ...radioUniDriverFactory(base, body),

    /** Simulating a check action by clicking the input element */
    check: () => base.click(),

    /** Getting the component's label text value */
    getLabel: () => radioLabel().text(),

    /** Getting the component's label element */
    // eslint-disable-next-line no-restricted-properties
    getLabelElement: () => radioLabel().getNative(),

    /** Getting the component's tab-index value */
    // This method is deprecated and this solution is in order not to break users
    getTabIndex: () => '1',

    /** Getting the component's content element */
    getContent: () =>
      // eslint-disable-next-line no-restricted-properties
      container()
        .$(`[data-hook="${dataHooks.RadioContent}"]`)
        .getNative(),
  };
};
