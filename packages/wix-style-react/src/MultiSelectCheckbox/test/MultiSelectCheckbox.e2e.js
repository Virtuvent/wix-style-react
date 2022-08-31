import { waitForVisibilityOf, isFocused } from 'wix-ui-test-utils/protractor';
import { multiSelectCheckboxTestkitFactory } from '../../../testkit/protractor';
import { createTestStoryUrl } from '../../../test/utils/storybook-helpers';
import eyes from 'eyes.it';

import { storySettings, testStories } from '../docs/storySettings';
import { setupBeforeEach } from '../../../test/utils/e2e-helpers';

describe('MultiSelectCheckbox', () => {
  let driver;

  function createTestkit() {
    driver = multiSelectCheckboxTestkitFactory({
      dataHook: storySettings.dataHook,
    });
    return driver;
  }

  setupBeforeEach(
    testStories.multiSelectCheckbox,
    storySettings,
    createTestkit,
  );

  eyes.it(
    'should update the input with selected values when select multiple check box in drop down',
    async () => {
      await driver.clickInput();
      await driver.selectItemById('Arkansas');
      await driver.selectItemById('California');

      expect(driver.getInput().getAttribute('value')).toBe(
        'Arkansas, California',
      );
    },
  );

  eyes.it(
    'should open or close drop down when clicking on the input',
    async () => {
      await driver.clickInput();
      expect((await driver.getDropdown()).isDisplayed()).toBe(true);
      await driver.clickInput();
      expect((await driver.getDropdown()).isDisplayed()).toBe(false);
    },
  );
});

describe('MultiSelectCheckbox - Focus behaviour', () => {
  let driver;

  const navigateToTestUrl = async testName => {
    const testStoryUrl = createTestStoryUrl({
      category: storySettings.category,
      storyName: storySettings.storyName,
      dataHook: storySettings.dataHook,
      testName,
    });
    await browser.get(testStoryUrl);
  };

  beforeEach(async () => {
    await navigateToTestUrl(testStories.tabsSwitches);

    driver = multiSelectCheckboxTestkitFactory({
      dataHook: storySettings.dataHook,
    });
    await waitForVisibilityOf(
      driver.element(),
      `Cant find ${storySettings.dataHook}`,
    );
  });

  const pressTab = () =>
    browser
      .actions()
      .sendKeys(protractor.Key.TAB)
      .perform();

  async function focusOnDropdown() {
    const firstElement = $(`[data-hook="input-for-initial-focus"]`);

    await pressTab();
    expect(await isFocused(firstElement)).toEqual(true);

    await pressTab();
    expect(await driver.isFocused()).toEqual(true);
  }

  it('should not move out focus of dropdown after tab presses', async () => {
    await focusOnDropdown();
    await driver.hoverItemById(0);
    await pressTab();
    expect(await driver.isFocused()).toEqual(true);
    await pressTab();
    expect(await driver.isFocused()).toEqual(true);
    await pressTab();
    expect(await driver.isFocused()).toEqual(true);
  });
});
