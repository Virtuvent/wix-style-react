import { DataHooks } from './constants';

const colorPickerDriverFactory = component => {
  const getConverter = () =>
    component.$(`[data-hook="${DataHooks.converter}"]`);
  const getConverterTabs = () => getConverter().$$(`li`);

  return {
    element: () => component,
    hasConverter: () => getConverter().isPresent(),
    hasHexInput: () =>
      component.$(`[data-hook="color-picker-hex-input"]`).isPresent(),
    hasRgbInputs: () =>
      component.$(`[data-hook="color-picker-rgb-inputs"]`).isPresent(),
    hasHsbInputs: () =>
      component.$(`[data-hook="color-picker-hsb-inputs"]`).isPresent(),
    selectHexTab: () =>
      getConverterTabs()
        .get(0)
        .click(),
    selectRgbTab: () =>
      getConverterTabs()
        .get(1)
        .click(),
    selectHsbTab: () =>
      getConverterTabs()
        .get(2)
        .click(),
  };
};
export default colorPickerDriverFactory;
