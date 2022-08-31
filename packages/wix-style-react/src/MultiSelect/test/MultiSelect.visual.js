import React, { useEffect } from 'react';
import { storiesOf } from '@storybook/react';

import MultiSelect from '../MultiSelect';
import { RTLWrapper } from '../../../stories/utils/RTLWrapper';
import { multiSelectTestkitFactory } from '../../../testkit';

const interactiveDataHook = 'interactive-multiselect';

const options = [
  { value: 'Alabama', id: 'AL' },
  { value: 'Alaska', id: 'AK' },
  { value: 'Arizona', id: 'AZ' },
  { value: 'Arkansas', id: 'AR' },
  { value: 'California', id: 'CA' },
  { value: 'North Carolina', id: 'NC' },
  { value: 'Colorado', id: 'CO' },
  { value: 'Connecticut', id: 'CT' },
  { value: 'Delaware', id: 'DL' },
  { value: 'Florida', id: 'FL' },
  { value: 'Georgia', id: 'GA' },
  { value: 'Hawaii', id: 'HI' },
  { value: 'Idaho', id: 'IL' },
  { value: 'Illinois', id: 'IN' },
  { value: 'Indiana', id: 'IA' },
];

const tests = [
  {
    describe: 'Basic',
    its: [
      {
        it: 'should render MultiSelect with "select" mode',
        props: {
          tags: [
            { id: '1', label: 'aaaaaaaaaaaa' },
            { id: '2', label: 'aaaaaaaaaaaa' },
            { id: '3', label: 'aaaaaaaaaaaa' },
            { id: '4', label: 'aaaaaaaaaaaa' },
            { id: '5', label: 'aaaaaaaaaaaa' },
            { id: '6', label: 'aaaaaaaaaaaa' },
          ],
          mode: 'select',
        },
        width: '400px',
      },
      {
        it: 'should fill input with tags without breaking a line',
        props: {
          tags: [
            { id: '1', label: 'a' },
            { id: '2', label: 'b' },
            { id: '3', label: 'c' },
            { id: '4', label: 'd' },
            { id: '5', label: 'e' },
            { id: '6', label: 'f' },
            { id: '7', label: 'f' },
          ],
        },
        width: '400px',
      },
      {
        it: 'should render disabled MultiSelect',
        props: {
          disabled: true,
          tags: [
            { id: '1', label: 'Alabama' },
            { id: '2', label: 'Alaska' },
            { id: '3', label: 'Arizona' },
            { id: '4', label: 'Arkansas' },
          ],
        },
        width: '500px',
      },
    ],
  },
  {
    describe: 'With Status',
    its: [
      {
        it: 'error',
        props: {
          mode: 'select',
          status: 'error',
        },
      },
      {
        it: 'warning',
        props: {
          mode: 'select',
          status: 'warning',
        },
      },
      {
        it: 'loading',
        props: {
          mode: 'select',
          status: 'loading',
        },
      },
    ],
  },
];

tests.forEach(({ describe, its }) => {
  its.forEach(({ it, props, width }) => {
    storiesOf(`MultiSelect${describe ? '/' + describe : ''}`, module).add(
      it,
      () => (
        <div style={{ width }}>
          <MultiSelect {...props} />
        </div>
      ),
    );
  });
});

const createDriver = dataHook =>
  multiSelectTestkitFactory({
    wrapper: document.body,
    dataHook,
  });

const interactiveTests = [
  {
    describe: 'Directional tests',
    its: [
      {
        it: 'LTR should show 2 tags',
        componentDidMount: async function() {
          const driver = createDriver(interactiveDataHook).driver;
          await driver.clickOnInputWrapper();
        },
        props: {
          tags: [
            { id: 'AL', label: 'Alabama (AL)' },
            { id: 'AZ', label: 'Arizona (AZ)' },
          ],
          options,
        },
      },
      {
        it: 'RTL should show 2 tags',
        componentDidMount: async function() {
          const driver = createDriver(interactiveDataHook).driver;
          await driver.clickOnInputWrapper();
        },
        props: {
          tags: [
            { id: 'AL', label: 'Alabama (AL)' },
            { id: 'AZ', label: 'Arizona (AZ)' },
          ],
          options,
        },
        rtl: true,
      },
    ],
  },
];

const InteractiveEyeTest = ({ componentDidMount, rtl, ...props }) => {
  useEffect(() => {
    componentDidMount();
  }, [componentDidMount]);
  return (
    <RTLWrapper rtl={rtl}>
      <MultiSelect dataHook={interactiveDataHook} {...props} />
    </RTLWrapper>
  );
};

interactiveTests.forEach(({ describe, its }) => {
  its.forEach(({ it, props, rtl, componentDidMount }) => {
    storiesOf(`MultiSelect${describe ? '/' + describe : ''}`, module).add(
      it,
      () => (
        <InteractiveEyeTest
          {...props}
          componentDidMount={componentDidMount}
          rtl={rtl}
        />
      ),
    );
  });
});
