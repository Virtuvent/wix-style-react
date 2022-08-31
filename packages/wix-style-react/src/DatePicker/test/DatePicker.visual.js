import React from 'react';
import { storiesOf } from '@storybook/react';
import DatePicker from '../DatePicker';
import Box from '../../Box';
import { datePickerTestkitFactory } from '../../../testkit';
import { storySettings } from '../docs/storySettings';
import ExampleDatePicker from '../docs/ExampleDatePicker';
import { RTLWrapper } from '../../../stories/utils/RTLWrapper';

const createDriver = dataHook =>
  datePickerTestkitFactory({
    wrapper: document.body,
    dataHook,
  });

const testGroups = [
  {
    describe: 'Basic Usage',
    tests: [
      {
        describe: 'Date should not be selected',
        its: [
          {
            placeholderText: 'Select Date',
          },
          {
            placeholderText: 'Select Date',
            disabled: true,
          },
        ],
      },
      {
        describe: 'Date should be selected',
        its: [
          {
            placeholderText: 'Select Date',
            value: new Date('08/07/1986'),
          },
          {
            placeholderText: 'Select Date',
            value: new Date('08/07/1986'),
            disabled: true,
          },
          {
            placeholderText: 'Select Date',
            value: new Date('08/07/1986'),
            initialOpen: true,
          },
        ],
      },
      {
        describe: 'With status',
        its: [
          {
            placeholderText: 'Select Date',
            status: 'error',
          },
          {
            placeholderText: 'Select Date',
            status: 'warning',
          },
          {
            placeholderText: 'Select Date',
            status: 'loading',
          },
        ],
      },
      {
        describe: 'Sizes',
        its: [
          {
            placeholderText: 'Select Date',
            size: 'small',
          },
          {
            placeholderText: 'Select Date',
            size: 'medium',
          },
          {
            placeholderText: 'Select Date',
            size: 'large',
          },
        ],
      },
    ],
  },
  {
    describe: 'width prop',
    tests: [
      {
        describe: 'should be 150px by default',
        its: [
          {
            placeholderText: 'Select Date',
            value: new Date('08/07/1986'),
          },
        ],
      },
      {
        describe: 'should accept px values',
        its: [
          {
            width: '100px',
            placeholderText: 'Select Date',
            value: new Date('08/07/1986'),
          },
        ],
      },
      {
        describe: 'should accept % values',
        its: [
          {
            width: '50%',
            placeholderText: 'Select Date',
            value: new Date('08/07/1986'),
          },
        ],
      },
    ],
  },
];

testGroups.forEach(group => {
  group.tests.forEach(test => {
    storiesOf(`DatePicker/${group.describe}`, module).add(test.describe, () => (
      <Box width="1024px" height="768px" flexWrap="wrap">
        {test.its.map(props => (
          <Box paddingRight="65px" direction="vertical">
            <Box margin={2}>
              <DatePicker width="auto" onChange={() => {}} {...props} />
            </Box>
          </Box>
        ))}
      </Box>
    ));
  });
});

const rtlTests = [
  {
    describe: 'rtl',
    its: [
      {
        it: 'rtl',
        props: {
          placeholderText: 'Select Date',
          value: new Date('08/07/1986'),
          rtl: true,
          width: '250px',
        },
      },
      {
        it: 'with status error',
        props: {
          placeholderText: 'Select Date',
          value: new Date('08/07/1986'),
          rtl: true,
          width: '250px',
          status: 'error',
        },
      },
      {
        it: 'with status warning',
        props: {
          placeholderText: 'Select Date',
          value: new Date('08/07/1986'),
          rtl: true,
          width: '250px',
          status: 'warning',
        },
      },
      {
        it: 'with status loading',
        props: {
          placeholderText: 'Select Date',
          rtl: true,
          width: '250px',
          status: 'loading',
        },
      },
    ],
  },
];

rtlTests.forEach(({ describe, its }) => {
  its.forEach(({ it, props }) => {
    storiesOf(
      `${DatePicker.displayName}${describe ? '/' + describe : ''}`,
      module,
    ).add(it, () => (
      <RTLWrapper rtl>
        <DatePicker onChange={() => {}} {...props} />
      </RTLWrapper>
    ));
  });
});

class InteractiveEyeTest extends React.Component {
  async componentDidMount() {
    this.props.componentDidMount();
  }

  render() {
    const { componentDidMount, ...restProps } = this.props;
    return <ExampleDatePicker {...restProps} />;
  }
}

const interactiveTests = [
  {
    describe: 'Interactive',
    its: [
      {
        it: 'should not open calendar on click when disabled',
        componentDidMount: async function() {
          const driver = createDriver(storySettings.dataHook);
          await driver.inputDriver.click();
        },
        props: {
          disabled: true,
        },
      },
      {
        it: 'should open calendar on click',
        componentDidMount: async function() {
          const driver = createDriver(storySettings.dataHook);
          await driver.inputDriver.click();
        },
      },
    ],
  },
];

interactiveTests.forEach(({ describe, its }) => {
  its.forEach(({ it, props, componentDidMount }) => {
    storiesOf(`DatePicker${describe ? '/' + describe : ''}`, module).add(
      it,
      () => (
        <InteractiveEyeTest {...props} componentDidMount={componentDidMount} />
      ),
    );
  });
});
