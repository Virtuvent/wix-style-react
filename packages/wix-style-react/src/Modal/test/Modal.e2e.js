import { protractorUniTestkitFactoryCreator } from 'wix-ui-test-utils/protractor';
import { browser, $, Key } from 'protractor';
import { modalUniDriverFactory } from '../Modal.uni.driver';
import { createTestStoryUrl } from '../../../test/utils/storybook-helpers';
import { storySettings, testStories } from './storySettings';

const pressTab = () =>
  browser
    .actions()
    .sendKeys(Key.TAB)
    .perform();

describe('Modal', () => {
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
    await navigateToTestUrl(testStories.a11yTabInsideModal);

    driver = protractorUniTestkitFactoryCreator(modalUniDriverFactory)({
      dataHook: storySettings.dataHook,
    });
  });

  it('A11Y - Should allow tab navigation inside modal', async () => {
    expect(await driver.exists()).toBe(true);
    const firstInput = await $('[data-hook="first-input"]');
    let activeElm = await browser.switchTo().activeElement();

    expect(await activeElm.getAttribute('data-hook')).toBe(null);

    await firstInput.click();
    activeElm = await browser.switchTo().activeElement();
    expect(await activeElm.getAttribute('data-hook')).toBe('first-input');

    await pressTab();
    activeElm = await browser.switchTo().activeElement();
    expect(await activeElm.getAttribute('data-hook')).toBe('second-input');
  });
});
