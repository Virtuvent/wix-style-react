import { eyesItInstance } from '../../../test/utils/eyes-it';
import {
  waitForVisibilityOf,
  scrollToElement,
  protractorUniTestkitFactoryCreator,
} from 'wix-ui-test-utils/protractor';
import { createTestStoryUrl } from '../../../test/utils/storybook-helpers';
import { storySettings } from './storySettings';
import { browser } from 'protractor';
import DataHooks from '../dataHooks';
import { statisticsWidgetPrivateDriverFactory } from './StatisticsWidget.private.uni.driver.js';

const createStoryUrl = testName =>
  createTestStoryUrl({ ...storySettings, testName });
const testStoryNames = storySettings.testStoryNames;

const getHookSelector = hook => `[data-hook="${hook}"]`;

const hover = (hook, index) =>
  browser
    .actions()
    .mouseMove(browser.$$(getHookSelector(hook)).get(index))
    .perform();

const pressTab = () =>
  browser
    .actions()
    .sendKeys(protractor.Key.TAB)
    .perform();

export const statisticsWidgetTestkitFactory = protractorUniTestkitFactoryCreator(
  statisticsWidgetPrivateDriverFactory,
);

function disableCSSAnimation() {
  const css = `
    *, *:before, *:after {
      transition-delay: 0ms !important;
      transition-duration: 0ms !important;
      transition: none !important;
      animation-duration: 0ms !important;
    }
  `;

  const head = document.head || document.getElementsByTagName('head')[0];
  const style = document.createElement('style');

  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  head.appendChild(style);
}

describe('StatisticsWidget', () => {
  const eyes = eyesItInstance();
  let driver;

  const createDriver = async (dataHook = storySettings.dataHook) => {
    driver = statisticsWidgetTestkitFactory({ dataHook });

    await waitForVisibilityOf(
      await driver.element(),
      'Cannot find StatisticsWidget',
    );
    await scrollToElement(await driver.element());

    return driver;
  };

  beforeEach(async () => {
    await browser.get(createStoryUrl(testStoryNames.ACCESSIBILITY));
    await browser.driver.executeScript(disableCSSAnimation);
    await createDriver();
  });

  describe('on hover', () => {
    eyes.it('should not apply styles on element without onClick', async () => {
      await hover(DataHooks.stat, 2);
    });

    eyes.it('should apply styles on element with onClick', async () => {
      await hover(DataHooks.stat, 0);
    });
  });

  describe('on tab', () => {
    eyes.it('should focus a statistics', async () => {
      await pressTab();
    });

    eyes.it('should skip stats without onClick', async () => {
      await pressTab();
      await pressTab();
      await pressTab();
    });
  });
});
