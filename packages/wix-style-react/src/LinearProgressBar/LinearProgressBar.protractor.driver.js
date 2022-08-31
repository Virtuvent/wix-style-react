import { browser } from 'protractor';
import { linearProgressBarDriverFactory as coreLinearProgressBarDriverFactory } from 'wix-ui-core/drivers/protractor';

export const linearProgressBarDriverFactory = element => {
  const errorIcon = () => element.$(`[data-hook='error-icon']`);
  return {
    ...coreLinearProgressBarDriverFactory(element),
    showError: () =>
      browser
        .actions()
        .mouseMove(errorIcon())
        .perform(),
  };
};
