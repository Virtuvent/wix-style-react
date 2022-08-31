import React from 'react';
import { mount } from 'enzyme';

import EndorseContentLayoutDriver from './EndorseContentLayout.driver';
import EndorseContentLayout from './EndorseContentLayout';

describe('EndorseContentLayout', () => {
  let driver;

  beforeEach(() => (driver = new EndorseContentLayoutDriver()));

  it('should render', () => {
    driver.when.created();
    expect(driver.get.root()).toHaveLength(1);
  });

  const componentsToRender = ['head', 'content', 'primaryCta', 'secondaryCta'];

  componentsToRender.forEach(c => {
    it(`should render node as ${c}`, () => {
      const props = { [c]: <div>hey hope you render</div> };
      const wrapper = mount(<EndorseContentLayout {...props} />);
      driver.component = wrapper;
      const text = driver.get[c]()
        .at(0)
        .text();
      expect(text).toBe('hey hope you render');
    });
  });

  it('should not render anything when prop not given', () => {
    componentsToRender.forEach(c => {
      driver.when.created();
      expect(driver.get[c]()).toHaveLength(0);
    });
  });
});
