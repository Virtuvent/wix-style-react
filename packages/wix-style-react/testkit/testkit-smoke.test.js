import React from 'react';
import { mount } from 'enzyme';

import {
  isEnzymeTestkitExists,
  isUniEnzymeTestkitExists,
} from 'wix-ui-test-utils/enzyme';
import { isTestkitExists, isUniTestkitExists } from 'wix-ui-test-utils/vanilla';

import AllComponents from './all-components';

import COMPONENT_DEFINITIONS from './component-definitions.js';
import TESTKIT_DEFINITIONS from '../.wuf/testkits/definitions';

import * as reactTestUtilsTestkitFactories from './index';
import * as enzymeTestkitFactories from './enzyme';

const noop = () => {};
const lowerFirst = a =>
  a
    .charAt(0)
    .toLowerCase()
    .concat(a.slice(1));

const attachHooks = (beforeAllHook, afterAllHook) => {
  beforeAll(async () => await beforeAllHook());
  afterAll(async () => await afterAllHook());
};

const DATA_HOOK_PROP_NAME = 'dataHook';

const DRIVER_ASSERTS = {
  enzyme: ({ name, component, props, beforeAllHook, afterAllHook }) => {
    describe('Enzyme testkits', () => {
      attachHooks(beforeAllHook, afterAllHook);

      it(`Enzyme testkit exists (deprecated) - <${name}/>`, () =>
        expect(
          isEnzymeTestkitExists(
            React.createElement(component, props),
            enzymeTestkitFactories[`${lowerFirst(name)}TestkitFactory`],
            mount,
            { dataHookPropName: DATA_HOOK_PROP_NAME },
          ),
        ).toBe(true));
    });
  },

  vanilla: ({ name, component, props, beforeAllHook, afterAllHook }) => {
    describe('ReactTestUtils testkits', () => {
      attachHooks(beforeAllHook, afterAllHook);
      it(`ReactTestUtils testkit exists (deprecated) - <${name}/>`, () =>
        expect(
          isTestkitExists(
            React.createElement(component, props),
            reactTestUtilsTestkitFactories[`${lowerFirst(name)}TestkitFactory`],
            { dataHookPropName: DATA_HOOK_PROP_NAME },
          ),
        ).toBe(true));
    });
  },
};

const UNIDRIVER_ASSERTS = {
  enzyme: ({ name, component, props, beforeAllHook, afterAllHook }) => {
    describe('Enzyme unidriver testkits', () => {
      attachHooks(beforeAllHook, afterAllHook);
      it(`Enzyme testkit exists - <${name}/>`, () =>
        expect(
          isUniEnzymeTestkitExists(
            React.createElement(component, props),
            enzymeTestkitFactories[`${name}Testkit`],
            mount,
            { dataHookPropName: DATA_HOOK_PROP_NAME },
          ),
        ).resolves.toBe(true));
    });
  },

  vanilla: ({ name, component, props, beforeAllHook, afterAllHook }) => {
    describe('ReactTestUtils unidriver testkits', () => {
      attachHooks(beforeAllHook, afterAllHook);
      it(`ReactTestUtils testkit exists - <${name}/>`, () =>
        expect(
          isUniTestkitExists(
            React.createElement(component, props),
            reactTestUtilsTestkitFactories[`${name}Testkit`],
            { dataHookPropName: DATA_HOOK_PROP_NAME },
          ),
        ).resolves.toBe(true));
    });
  },

  initialize: ({ name, beforeAllHook, afterAllHook }) => {
    // Checks that unidriver can initialize even when the element is not found
    describe('Unidriver can initialize', () => {
      attachHooks(beforeAllHook, afterAllHook);
      it(`Testkit initialize - <${name}/>`, async () => {
        const factory = reactTestUtilsTestkitFactories[`${name}Testkit`];
        const testkit = factory({
          wrapper: document.createElement('div'),
          dataHook: 'non-existing-data-hook',
        });
        expect(await testkit.exists()).toBe(false);
      });
    });
  },
};

const EXPORT_ASSERTS = {
  enzyme: (name, noUnidriver) => {
    const testkit = noUnidriver
      ? `${lowerFirst(name)}TestkitFactory`
      : `${name}Testkit`;
    describe('Enzyme testkit exports', () => {
      it(`Enzyme testkit exported - <${name}/>`, () =>
        expect(typeof enzymeTestkitFactories[testkit]).toBe('function'));
    });
  },

  vanilla: (name, noUnidriver) => {
    const testkit = noUnidriver
      ? `${lowerFirst(name)}TestkitFactory`
      : `${name}Testkit`;
    describe('ReactTestUtils testkit exports', () => {
      it(`ReactTestUtils testkit exported - <${name}/>`, () =>
        expect(typeof reactTestUtilsTestkitFactories[testkit]).toBe(
          'function',
        ));
    });
  },
};

Object.keys({
  ...AllComponents,
  ...COMPONENT_DEFINITIONS,
  ...TESTKIT_DEFINITIONS,
}).forEach(name => {
  const definition = TESTKIT_DEFINITIONS[name] || {};

  const config = {
    beforeAllHook: noop,
    afterAllHook: noop,
    props: COMPONENT_DEFINITIONS[name] ? COMPONENT_DEFINITIONS[name].props : {},
    ...definition,
    name,
    component: AllComponents[name],
  };

  if (!definition.skipSanityTest) {
    const sanityAsserts = definition.noUnidriver
      ? DRIVER_ASSERTS
      : UNIDRIVER_ASSERTS;

    Object.keys(sanityAsserts).forEach(driver => sanityAsserts[driver](config));
  }

  if (!definition.noTestkit) {
    EXPORT_ASSERTS.vanilla(
      definition.exportName || name,
      definition.noUnidriver,
    );
    EXPORT_ASSERTS.enzyme(
      definition.exportName || name,
      definition.noUnidriver,
    );
  }
});
