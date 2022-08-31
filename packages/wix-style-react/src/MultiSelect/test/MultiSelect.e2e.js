import { $, browser } from 'protractor';
import {
  isFocused,
  mouseEnter,
  waitForVisibilityOf,
} from 'wix-ui-test-utils/protractor';
import { eyesItInstance } from '../../../test/utils/eyes-it';
import { multiSelectTestkitFactory } from '../../../testkit/protractor';
import { createTestStoryUrl } from '../../../test/utils/storybook-helpers';
import { storySettings, testStories } from '../docs/storySettings';

const testStoryUrl = testName =>
  createTestStoryUrl({ ...storySettings, testName });

describe('MultiSelect', () => {
  const eyes = eyesItInstance();
  const loadStory = async (testName, dataHook) => {
    await browser.get(testStoryUrl(testName));
    const driver = multiSelectTestkitFactory({ dataHook });
    const element = driver.element();
    await waitForVisibilityOf(element, 'Cannot find <MultiSelect/>');
    return driver;
  };

  eyes.it('should show focus style + hover (focused by keyboard)', async () => {
    const driver = await loadStory(
      testStories.stateMultiSelect,
      storySettings.dataHook,
    );
    const element = driver.element();
    await driver.click();
    await eyes.checkWindow('focused by keyboard (not hovered)');
    await mouseEnter(element);
  });

  eyes.it('should show hover style with tag', async () => {
    const driver = await loadStory(
      testStories.stateMultiSelect,
      storySettings.dataHook,
    );
    const element = driver.element();
    await mouseEnter(element);
    await eyes.checkWindow('hover only');
    await driver.addTag();
    await mouseEnter(element);
  });

  eyes.it('should break to new line when needed', async () => {
    const driver = await loadStory(
      testStories.withMaxNumRows,
      'multi-select-limited',
    );
    const height = await driver.getHeight();
    const ELEMENT_HEIGHT_MULTILINE = 70;
    expect(height).toBe(ELEMENT_HEIGHT_MULTILINE);
  });

  eyes.it('should show hover style (when Reorderable)', async () => {
    const driver = await loadStory(
      testStories.reorderable,
      'multi-select-reorderable',
    );
    const element = driver.element();
    await mouseEnter(element);
    await eyes.checkWindow('hover only (not tag)');
    await driver.addTag();
    await mouseEnter(element);
  });
});

describe('MultiSelect - Focus behaviour', () => {
  let driver;
  const storyUrl = testStoryUrl(testStories.tabsSwitches);

  beforeEach(async () => {
    await browser.get(storyUrl);

    driver = multiSelectTestkitFactory({
      dataHook: 'multiselect-tabs-switches-test',
    });

    await waitForVisibilityOf(
      driver.element(),
      'Cant find muiltiselect-tabs-switches-test',
    );
  });

  const pressTab = () =>
    browser
      .actions()
      .sendKeys(protractor.Key.TAB)
      .perform();

  async function focusOnMultiSelect() {
    const firstElement = $(`[data-hook="input-for-focus-1"]`);
    await pressTab();
    expect(await isFocused(firstElement)).toEqual(true);

    await pressTab();
    expect(await driver.isFocused()).toEqual(true);
  }

  it('should move out focus of multiselect only after 2 tab press when selecting an item', async () => {
    await focusOnMultiSelect();

    await driver.click();
    expect(await driver.isOptionsShown()).toEqual(true);
    await driver.hoverItemById('AL');
    await pressTab();
    expect(await driver.isFocused()).toEqual(true);
    expect(await driver.isOptionsShown()).toEqual(true);

    await pressTab();
    expect(await driver.isFocused()).toEqual(false);
    expect(await driver.isOptionsShown()).toEqual(false);
  });

  it('should move out focus of multiselect when pressing tab without any selection', async () => {
    await focusOnMultiSelect();

    await pressTab();
    expect(await driver.isFocused()).toEqual(false);
    expect(await driver.isOptionsShown()).toEqual(false);
  });
});
