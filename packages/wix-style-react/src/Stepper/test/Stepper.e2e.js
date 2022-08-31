import { browser } from 'protractor';
import {
  scrollToElement,
  waitForVisibilityOf,
} from 'wix-ui-test-utils/protractor';

import { eyesItInstance } from '../../../test/utils/eyes-it';
import { createTestStoryUrl } from '../../../test/utils/storybook-helpers';
import { stepperTestkitFactory } from '../../../testkit/protractor';
import { storySettings } from './storySettings';

const createStoryUrl = testName =>
  createTestStoryUrl({ ...storySettings, testName });
const testStoryNames = storySettings.testStoryNames;

const pressTab = () =>
  browser
    .actions()
    .sendKeys(protractor.Key.TAB)
    .perform();

const pressEnter = () =>
  browser
    .actions()
    .sendKeys(protractor.Key.ENTER)
    .perform();

const pressSpace = () =>
  browser
    .actions()
    .sendKeys(protractor.Key.SPACE)
    .perform();

const pressRightKey = () =>
  browser
    .actions()
    .sendKeys(protractor.Key.RIGHT)
    .perform();

describe('Stepper', () => {
  const eyes = eyesItInstance();
  let driver;

  const createDriver = async (dataHook = storySettings.dataHook) => {
    driver = stepperTestkitFactory({ dataHook });

    await waitForVisibilityOf(await driver.element(), 'Cannot find Stepper');
    await scrollToElement(await driver.element());

    return driver;
  };

  describe('on window resize', () => {
    beforeEach(async () => {
      await browser.get(createStoryUrl(testStoryNames.WINDOW_RESIZE));
      await createDriver();
    });

    eyes.it('should re-render with updated step sizes', async () => {
      await browser.driver
        .manage()
        .window()
        .setSize(800, 800);
    });
  });

  describe('on two tab key presses', () => {
    beforeEach(async () => {
      await browser.get(createStoryUrl(testStoryNames.ACCESSIBILITY));
      await createDriver();
      await pressTab();
      await pressTab();
    });

    describe('and enter key press', () => {
      eyes.it(
        'should skip disabled and activate the next step in line',
        async () => {
          await pressEnter();
        },
      );
    });

    describe('and space key press', () => {
      eyes.it(
        'should skip disabled activate the next step in line',
        async () => {
          await pressSpace();
        },
      );
    });

    describe('and non enter/space key press', () => {
      eyes.it('should not activate step', async () => {
        await pressRightKey();
      });
    });
  });
});
