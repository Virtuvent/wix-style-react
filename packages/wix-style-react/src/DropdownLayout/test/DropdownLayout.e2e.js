import eyes from 'eyes.it';
import { sleep } from 'wix-ui-test-utils/react-helpers';
import {
  scrollToElement,
  waitForVisibilityOf,
  isFocused,
} from 'wix-ui-test-utils/protractor';
import { browser, $ } from 'protractor';
import { dropdownLayoutTestkitFactory } from '../../../testkit/protractor';
import { storySettings, testStories } from './storySettings';
import { createTestStoryUrl } from '../../../test/utils/storybook-helpers';

async function waitForFetching() {
  await sleep(700);
}

describe('DropdownLayout', () => {
  let driver;

  const storyUrl = createTestStoryUrl({
    ...storySettings,
    testName: testStories.infiniteScroll,
  });

  beforeAll(async () => {
    browser.get(storyUrl);

    driver = dropdownLayoutTestkitFactory({
      dataHook: 'infinite-scroll-dropdownLayout',
    });
  });

  beforeEach(async () => {
    await waitForVisibilityOf(
      driver.element(),
      'Cant find infinite scroll dropdownLayout',
    );

    await waitForFetching();
    await scrollToElement(driver.element());
  });

  eyes.it('should add more items from server when scrolling down', async () => {
    expect(await driver.getDropdownItemsCount()).toEqual(15);

    await driver.scrollToElement(14);
    await waitForFetching();

    expect(await driver.getDropdownItemsCount()).toEqual(30);
  });

  eyes.it('should show loader', async () => {
    await driver.scrollToElement(14);

    expect(await driver.loaderExists()).toBeTruthy();
  });
});

describe('DropdownLayout - Focus behaviour', () => {
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

    driver = dropdownLayoutTestkitFactory({
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

  async function focusOnDropdownLayout() {
    const firstElement = $(`[data-hook="input-for-initial-focus"]`);
    await pressTab();
    expect(await isFocused(firstElement)).toEqual(true);

    await pressTab();
    expect(await driver.isFocused()).toEqual(true);
  }

  it('should move out focus of dropdown when pressing tab without any selection', async () => {
    await focusOnDropdownLayout();

    await pressTab();
    expect(await driver.isFocused()).toEqual(false);
  });
});
