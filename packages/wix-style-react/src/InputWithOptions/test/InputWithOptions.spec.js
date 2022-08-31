import React, { useContext } from 'react';

import {
  createRendererWithDriver,
  createRendererWithUniDriver,
  cleanup,
} from '../../../test/utils/react';
import { makeControlled } from '../../../test/utils';
import InputWithOptions from '..';
import inputWithOptionsDriverFactory from '../InputWithOptions.driver';
import { inputWithOptionsUniDriverFactory } from './InputWithOptions.private.uni.driver';
import { inputWithOptionsTestkitFactory as inputWithOptionsEnzymeDriverFactory } from '../../../testkit/enzyme';
import { mount } from 'enzyme';
import { enzymeUniTestkitFactoryCreator } from 'wix-ui-test-utils/enzyme';
import HighlightContext from '../HighlightContext';

describe('InputWithOptions', () => {
  const ControlledInputWithOptions = makeControlled(InputWithOptions);

  const options = [
    { id: 0, value: 'Option 1' },
    { id: 1, value: 'Option 2' },
    { id: 2, value: 'Option 3', disabled: true },
    { id: 3, value: 'Option 4' },
    { id: 'divider1', value: '-' },
    {
      id: 'element1',
      value: <span style={{ color: 'brown' }}>Option 4</span>,
    },
    {
      id: 5,
      value: 'An option with a veryyyyyyyyy long text that exceeds the input',
    },
  ];

  describe('[sync]', () => {
    runTests(createRendererWithDriver(inputWithOptionsDriverFactory));
  });

  describe('[async]', () => {
    runTests(createRendererWithUniDriver(inputWithOptionsUniDriverFactory));
  });

  function runTests(render) {
    afterEach(() => cleanup());
    const createDriver = jsx => render(jsx).driver;

    it('should render input with ellipsis text-overflow style', async () => {
      const { inputDriver } = createDriver(
        <InputWithOptions options={options} textOverflow={'ellipsis'} />,
      );
      expect(await inputDriver.getTextOverflow()).toBe('ellipsis');
    });

    it('should render input with default clip text-overflow style', async () => {
      const { inputDriver } = createDriver(
        <InputWithOptions options={options} />,
      );
      expect(await inputDriver.getTextOverflow()).toBe('clip');
    });

    it('should NOT show dropdown when autofocus is on', async () => {
      const { inputDriver, dropdownLayoutDriver } = createDriver(
        <InputWithOptions options={options} autoFocus />,
      );
      expect(await inputDriver.isFocus()).toBe(true);
      expect(await dropdownLayoutDriver.isShown()).toBe(false);
    });

    it('should have an Input and an hidden DropdownLayout', async () => {
      const { inputDriver, dropdownLayoutDriver } = createDriver(
        <InputWithOptions options={options} />,
      );
      expect(await inputDriver.exists()).toBe(true);
      expect(await dropdownLayoutDriver.exists()).toBe(false);
      expect(await dropdownLayoutDriver.isShown()).toBe(false);
    });

    it('should show DropdownLayout when input get focused', async () => {
      const { driver, dropdownLayoutDriver } = createDriver(
        <InputWithOptions options={options} />,
      );
      await driver.focus();
      expect(await dropdownLayoutDriver.isShown()).toBe(false);
    });

    describe('showOptionsIfEmptyInput property', () => {
      describe('show options if input is empty (default behaviour)', () => {
        it('should show DropdownLayout if input is empty and down arrow pressed', async () => {
          const { driver, dropdownLayoutDriver } = createDriver(
            <ControlledInputWithOptions
              showOptionsIfEmptyInput
              options={options}
            />,
          );

          await driver.pressKey('ArrowDown');
          expect(await dropdownLayoutDriver.isShown()).toBe(true);
        });
      });

      describe('do not show options if input is empty', () => {
        it('should not show DropdownLayout if input is empty and focused', async () => {
          const { driver, dropdownLayoutDriver } = createDriver(
            <ControlledInputWithOptions
              showOptionsIfEmptyInput={false}
              options={options}
            />,
          );

          await driver.pressKey('ArrowDown');
          expect(await dropdownLayoutDriver.isShown()).toBe(false);
        });

        it('should show DropdownLayout if initial value passed and input focused', async () => {
          const { driver, dropdownLayoutDriver } = createDriver(
            <ControlledInputWithOptions
              showOptionsIfEmptyInput={false}
              value={options[0].value}
              options={options}
            />,
          );

          expect(await dropdownLayoutDriver.isShown()).toBe(false);
          await driver.pressKey('ArrowDown');
          expect(await dropdownLayoutDriver.isShown()).toBe(true);
        });

        it('should show DropdownLayout if text was entered', async () => {
          const driver = createDriver(
            <ControlledInputWithOptions
              showOptionsIfEmptyInput={false}
              options={options}
            />,
          );

          expect(await driver.dropdownLayoutDriver.isShown()).toBe(false);
          await driver.inputDriver.focus();
          expect(await driver.dropdownLayoutDriver.isShown()).toBe(false);
          await driver.inputDriver.enterText('some value');
          expect(await driver.dropdownLayoutDriver.isShown()).toBe(true);
        });

        it('should not show DropdownLayout if input was emptied', async () => {
          const driver = createDriver(
            <ControlledInputWithOptions
              showOptionsIfEmptyInput={false}
              options={options}
            />,
          );

          await driver.inputDriver.enterText('some value');
          await driver.inputDriver.clearText();
          expect(await driver.dropdownLayoutDriver.isShown()).toBe(false);
        });

        it('should clear value in controlled mode and close dropdown', async () => {
          const dataHook = 'dataHook';
          const value = 'value';
          const wrapper = mount(
            <InputWithOptions
              updateControlledOnClear
              showOptionsIfEmptyInput={false}
              dataHook={dataHook}
              options={options}
              value={value}
              onClear={() => wrapper.setProps({ value: '' })}
            />,
          );

          const driver = enzymeUniTestkitFactoryCreator(
            inputWithOptionsUniDriverFactory,
          )({
            wrapper,
            dataHook,
          });

          expect(await driver.dropdownLayoutDriver.isShown()).toBe(false);
          expect(await driver.inputDriver.getText()).toBe(value);
          await driver.inputDriver.enterText('o');
          expect(await driver.dropdownLayoutDriver.isShown()).toBe(true);
          await driver.inputDriver.clickClear();
          expect(await driver.inputDriver.getText()).toBe('');
          expect(await driver.dropdownLayoutDriver.isShown()).toBe(false);
        });

        it('should not show DropdownLayout if input is empty and no char was produced by keypress', async () => {
          const driver = createDriver(
            <ControlledInputWithOptions
              showOptionsIfEmptyInput={false}
              options={options}
            />,
          );

          await driver.inputDriver.trigger('keyDown', {
            key: 37, // <Left Arrow> key code
          });
          expect(await driver.dropdownLayoutDriver.isShown()).toBe(false);
        });

        it('should hide options on option select', async () => {
          const driver = createDriver(
            <ControlledInputWithOptions
              value="some value"
              showOptionsIfEmptyInput={false}
              options={options}
              closeOnSelect
              onSelect={function(option) {
                this.setState({ value: option.value });
              }}
            />,
          );

          await driver.inputDriver.focus();
          await driver.dropdownLayoutDriver.clickAtOption(0);
          expect(await driver.dropdownLayoutDriver.isShown()).toBe(false);
        });

        it('should not hide options on option select if closeOnSelect is set to false', async () => {
          const driver = createDriver(
            <ControlledInputWithOptions
              value="some value"
              showOptionsIfEmptyInput={false}
              options={options}
              closeOnSelect={false}
              onSelect={function(option) {
                this.setState({ value: option.value });
              }}
            />,
          );

          await driver.inputDriver.focus();
          await driver.dropdownLayoutDriver.clickAtOption(0);
          expect(await driver.dropdownLayoutDriver.isShown()).toBe(true);
        });
      });
    });

    it('should not show DropdownLayout when a non whitelisted key is pressed', async () => {
      const { driver, dropdownLayoutDriver } = createDriver(
        <InputWithOptions options={options} />,
      );
      await driver.pressKey('Any');
      expect(await dropdownLayoutDriver.isShown()).toBe(false);
    });

    it('should show DropdownLayout on down key', async () => {
      const { driver, dropdownLayoutDriver } = createDriver(
        <InputWithOptions options={options} />,
      );
      await driver.pressKey('ArrowDown');
      expect(await dropdownLayoutDriver.isShown()).toBe(true);
    });

    it('should not show DropdownLayout on modifier keys', async () => {
      const { driver, dropdownLayoutDriver } = createDriver(
        <InputWithOptions options={options} />,
      );
      await driver.pressKey('Shift');
      expect(await dropdownLayoutDriver.isShown()).toBe(false);
      await driver.pressKey('Alt');
      expect(await dropdownLayoutDriver.isShown()).toBe(false);
      await driver.pressKey('Control');
      expect(await dropdownLayoutDriver.isShown()).toBe(false);
    });

    it('should hide DropdownLayout on enter and esc key press', async () => {
      const { driver, dropdownLayoutDriver } = createDriver(
        <InputWithOptions options={options} />,
      );
      await driver.pressKey('ArrowDown');
      expect(await dropdownLayoutDriver.isShown()).toBe(true);
      await driver.pressKey('Enter');
      expect(await dropdownLayoutDriver.isShown()).toBe(false);
      await driver.pressKey('Escape');
      expect(await dropdownLayoutDriver.isShown()).toBe(false);
    });

    it('should start keyboard navigation from last selected option when re-opening the dropdown layout', async () => {
      const { driver, dropdownLayoutDriver } = createDriver(
        <InputWithOptions options={options} selectedId={1} />,
      );
      await driver.focus();

      await dropdownLayoutDriver.clickAtOption(1);
      await driver.outsideClick();
      await driver.focus();
      await driver.pressKey('ArrowDown');

      expect(await dropdownLayoutDriver.isOptionSelected(1)).toBe(true);

      await driver.pressKey('ArrowDown'); // going to skip disabled option at index 2
      expect(await dropdownLayoutDriver.isOptionHovered(3)).toBe(true);
    });

    it('should call onManuallyInput on enter key press with a trimmed value', async () => {
      const onManuallyInput = jest.fn();
      const { driver, inputDriver } = createDriver(
        <InputWithOptions
          options={options}
          onManuallyInput={onManuallyInput}
        />,
      );
      await inputDriver.enterText('my text      ');
      await driver.pressKey('Enter');
      expect(onManuallyInput).toBeCalledWith('my text', undefined);
    });

    it('should call onManuallyInput on enter key press', async () => {
      const onManuallyInput = jest.fn();
      const { driver, inputDriver } = createDriver(
        <InputWithOptions
          options={options}
          onManuallyInput={onManuallyInput}
        />,
      );
      await inputDriver.enterText('my text');
      await driver.pressKey('Enter');
      expect(onManuallyInput).toBeCalledWith('my text', undefined);
    });

    it('should call onManuallyInput on tab key press', async () => {
      const onManuallyInput = jest.fn();
      const { driver, inputDriver } = createDriver(
        <InputWithOptions
          options={options}
          onManuallyInput={onManuallyInput}
        />,
      );
      await inputDriver.enterText('my text');
      await driver.pressKey('Tab');
      expect(onManuallyInput).toBeCalledWith('my text', undefined);
    });

    it('should select and close dropdown on press tab key', async () => {
      const onManuallyInput = jest.fn();
      const { driver, inputDriver, dropdownLayoutDriver } = createDriver(
        <InputWithOptions
          options={options}
          onManuallyInput={onManuallyInput}
        />,
      );
      await inputDriver.focus();
      await driver.pressKey('ArrowDown');
      expect(await inputDriver.isFocus()).toBe(true);
      expect(await dropdownLayoutDriver.isShown()).toBe(true);
      await driver.pressKey('Tab');
      // todo: jest limitation of mimicking native Tab browser behaviour
      // expect(inputDriver.isFocus()).toBe(false);
      expect(await dropdownLayoutDriver.isShown()).toBe(false);
    });

    it('should focus out of the component and close dropdown for an empty input when pressing tab key', async () => {
      const { driver, inputDriver, dropdownLayoutDriver } = createDriver(
        <InputWithOptions closeOnSelect={false} options={options} />,
      );
      await inputDriver.click();
      // expect(inputDriver.isFocus()).toBe(true);
      expect(await dropdownLayoutDriver.isShown()).toBe(true);
      await driver.pressKey('Tab');
      expect(await dropdownLayoutDriver.isShown()).toBe(false);
    });

    it('should open options when clicked', async () => {
      const { inputDriver, dropdownLayoutDriver } = createDriver(
        <InputWithOptions options={options} />,
      );
      expect(await dropdownLayoutDriver.isShown()).toBe(false);
      await inputDriver.click();
      expect(await dropdownLayoutDriver.isShown()).toBe(true);
    });

    it('should NOT close options when input clicked before 2 seconds passed from last opening', async () => {
      const { inputDriver, dropdownLayoutDriver } = createDriver(
        <InputWithOptions options={options} />,
      );
      const originalNow = Date.now;

      Date.now = () => 0;
      await inputDriver.click();
      expect(await dropdownLayoutDriver.isShown()).toBe(true);

      Date.now = () => 1500;
      await inputDriver.click();
      expect(await dropdownLayoutDriver.isShown()).toBe(true);

      Date.now = originalNow;
    });

    it('should close options when input clicked after 2 seconds from last opening', async () => {
      const { inputDriver, dropdownLayoutDriver } = createDriver(
        <InputWithOptions options={options} />,
      );
      const originalNow = Date.now;

      Date.now = () => 0;
      await inputDriver.click();
      expect(await dropdownLayoutDriver.isShown()).toBe(true);

      Date.now = () => 2500;
      await inputDriver.click();
      expect(await dropdownLayoutDriver.isShown()).toBe(false);

      Date.now = originalNow;
    });

    it('should stay focused on tab key press with closeOnSelect=false', async () => {
      const onManuallyInput = jest.fn();
      const { driver, inputDriver, dropdownLayoutDriver } = createDriver(
        <InputWithOptions
          options={options}
          onManuallyInput={onManuallyInput}
          closeOnSelect={false}
        />,
      );
      await inputDriver.focus();
      await inputDriver.enterText('Option 1');
      await driver.pressKey('ArrowDown');
      expect(await inputDriver.isFocus()).toBe(true);
      await driver.pressKey('Tab');
      expect(await inputDriver.isFocus()).toBe(true);
      expect(await dropdownLayoutDriver.isShown()).toBe(true);
    });

    it('should suggest an option when calling onManuallyInput', async () => {
      const onManuallyInput = jest.fn();
      const { driver, inputDriver } = createDriver(
        <InputWithOptions
          options={options}
          onManuallyInput={onManuallyInput}
        />,
      );
      await inputDriver.enterText('Option 2');
      await driver.pressKey('Enter');
      expect(onManuallyInput).toBeCalledWith('Option 2', {
        id: 1,
        value: 'Option 2',
      });
    });

    it('should hide options on selection by default', async () => {
      const { driver, dropdownLayoutDriver } = createDriver(
        <InputWithOptions options={options} />,
      );
      await driver.focus();
      await dropdownLayoutDriver.clickAtOption(0);
      expect(await dropdownLayoutDriver.isShown()).toBe(false);
    });

    describe('click outside', () => {
      it('should hide options on outside click', async () => {
        const onClickOutsideFn = jest.fn();
        const { driver, dropdownLayoutDriver } = createDriver(
          <InputWithOptions
            options={options}
            onClickOutside={onClickOutsideFn}
          />,
        );

        // Click outside when dropdown is closed
        await driver.outsideClick();
        expect(onClickOutsideFn).toHaveBeenCalledTimes(0);
        expect(await dropdownLayoutDriver.isShown()).toBe(false);

        // Open Dropdown
        await driver.pressKey('ArrowDown');
        expect(await dropdownLayoutDriver.isShown()).toBe(true);

        // Click outside when dropdown is open
        await driver.outsideClick();
        expect(onClickOutsideFn).toHaveBeenCalledTimes(1);
        expect(await dropdownLayoutDriver.isShown()).toBe(false);
      });

      it('should close when clicked outside', async () => {
        const { inputDriver, dropdownLayoutDriver } = createDriver(
          <InputWithOptions options={options} />,
        );
        expect(await dropdownLayoutDriver.isShown()).toBe(false);
        await inputDriver.click();
        expect(await dropdownLayoutDriver.isShown()).toBe(true);
        await inputDriver.enterText('foo');
        await dropdownLayoutDriver.mouseClickOutside();
        expect(await dropdownLayoutDriver.isShown()).toBe(false);
      });
    });

    it('should not hide options on selection', async () => {
      const { driver, dropdownLayoutDriver } = createDriver(
        <InputWithOptions options={options} closeOnSelect={false} />,
      );
      await driver.focus();
      await dropdownLayoutDriver.clickAtOption(0);
      expect(await dropdownLayoutDriver.isShown()).toBe(true);
    });

    it('should call onSelect when an option is pressed', async () => {
      const onSelect = jest.fn();
      const { driver, dropdownLayoutDriver } = createDriver(
        <InputWithOptions options={options} onSelect={onSelect} />,
      );
      await driver.focus();
      await dropdownLayoutDriver.clickAtOption(0);
      expect(onSelect).toBeCalledWith(options[0]);
    });

    it('should call onSelect when a selected option is pressed', async () => {
      const onSelect = jest.fn();
      const { driver, dropdownLayoutDriver } = createDriver(
        <InputWithOptions
          options={options}
          onSelect={onSelect}
          selectedId={options[0].id}
        />,
      );
      await driver.focus();
      await dropdownLayoutDriver.clickAtOption(0);
      expect(onSelect).toBeCalled();
    });

    it('should call onFocus', async () => {
      const onFocus = jest.fn();
      const { driver } = createDriver(
        <InputWithOptions options={options} onFocus={onFocus} />,
      );
      await driver.focus();
      expect(onFocus).toBeCalled();
    });

    it('should call onBlur if clicked outside and input is focused', async () => {
      const onBlur = jest.fn();
      const { driver, inputDriver } = createDriver(
        <InputWithOptions options={options} onBlur={onBlur} />,
      );
      await driver.outsideClick();
      expect(onBlur).not.toBeCalled();
      await driver.focus();
      await driver.outsideClick();
      await inputDriver.blur(); // apparently, jsdom does not fire onBlur after input.blur() is called
      expect(onBlur).toBeCalled();
    });

    it('should not call onBlur if selected an option', async () => {
      const onBlur = jest.fn();
      const OPTION_INDEX = 0;
      const { dropdownLayoutDriver, inputDriver } = createDriver(
        <InputWithOptions options={options} onBlur={onBlur} />,
      );
      await inputDriver.focus();
      expect(await inputDriver.isFocus()).toBe(true);
      await dropdownLayoutDriver.clickAtOption(OPTION_INDEX);
      expect(onBlur).not.toHaveBeenCalled();
      expect(await inputDriver.isFocus()).toBe(true);
    });

    it('should not call onFocus when selecting an option', async () => {
      const onFocus = jest.fn();
      const OPTION_INDEX = 0;
      const dataHook = 'test';
      const wrapper = mount(
        <InputWithOptions
          onFocus={onFocus}
          options={options}
          dataHook={dataHook}
        />,
      );
      const {
        dropdownLayoutDriver,
        inputDriver,
      } = inputWithOptionsEnzymeDriverFactory({
        wrapper,
        dataHook,
      });
      await inputDriver.focus();
      expect(await inputDriver.isFocus()).toBe(true);
      // Reset focus call counter
      onFocus.mockClear();
      await dropdownLayoutDriver.clickAtOption(OPTION_INDEX);
      /** After clicking on an option, input gets re-focused by the `_onBlur` method
       * apparently, jsdom does not fire `focus` event after input.focus() is called
       * so we call it manually */
      await inputDriver.focus();
      expect(onFocus).not.toHaveBeenCalled();
      expect(await inputDriver.isFocus()).toBe(true);

      await inputDriver.blur();
      await inputDriver.focus();
      // After blurring, onFocus should be triggered when clicking on the input
      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('should not call onManuallyInput when composing text via external means', async () => {
      const onManualInput = jest.fn();
      const { driver, inputDriver } = createDriver(
        <InputWithOptions options={options} onManuallyInput={onManualInput} />,
      );
      await inputDriver.startComposing();
      await driver.pressKey('Enter');
      expect(onManualInput).not.toBeCalled();
      await inputDriver.endComposing();
      await driver.pressKey('Enter');
      expect(onManualInput).toBeCalled();
    });

    it('should provide highlighting context to options', async () => {
      const getHighlightText = (highlight, match) =>
        `highlight: ${highlight}, match: ${match}`;

      const HighlightContextOption = () => {
        const { highlight, match } = useContext(HighlightContext);
        return getHighlightText(highlight, match);
      };

      const highlight = true;
      const value = 'hello';
      const options = [{ id: 0, value: () => <HighlightContextOption /> }];

      const { dropdownLayoutDriver } = createDriver(
        <InputWithOptions
          options={options}
          highlight={highlight}
          value={value}
        />,
      );

      expect(await dropdownLayoutDriver.optionContentAt(0)).toBe(
        getHighlightText(highlight, value),
      );
    });

    // TODO
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('should change input value when an option is pressed', async () => {
      const driver = createDriver(<InputWithOptions options={options} />);
      await driver.inputDriver.focus();

      const OPTION_INDEX = 0;
      await driver.dropdownLayoutDriver.clickAtOption(OPTION_INDEX);
      expect(await driver.inputDriver.getValue()).toBe(
        options[OPTION_INDEX].value,
      );
    });

    // TODO
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('should invoke onChange with proper event object when an option is pressed', async () => {
      const onChange = jest.fn();
      const driver = createDriver(
        <InputWithOptions
          options={options}
          value="some value"
          onChange={onChange}
        />,
      );
      await driver.inputDriver.focus();

      const OPTION_INDEX = 0;
      await driver.dropdownLayoutDriver.clickAtOption(OPTION_INDEX);
      expect(onChange).toBeCalled();
      expect(onChange.mock.calls[0][0].target.value).toBe(
        options[OPTION_INDEX].value,
      );
    });

    it('should support autocomplete prop', async () => {
      const { inputDriver } = createDriver(
        <InputWithOptions autocomplete="off" />,
      );
      expect(await inputDriver.getAutocomplete()).toBe('off');
    });

    it('should support tabIndex prop', async () => {
      const { dropdownLayoutDriver } = createDriver(
        <InputWithOptions tabIndex={-1} />,
      );
      expect(await dropdownLayoutDriver.tabIndex()).toBe(-1);
    });

    it('should support required prop', async () => {
      const { inputDriver } = createDriver(<InputWithOptions required />);
      expect(await inputDriver.getRequired()).toBe(true);
    });

    it('should support a divider option', async () => {
      const { dropdownLayoutDriver } = createDriver(
        <InputWithOptions options={options} />,
      );
      expect(await dropdownLayoutDriver.isOptionADivider(4)).toBe(true);
    });

    describe('onKeyArrowDown', () => {
      it('should behave normal when external onKeyArrowDown passed', async () => {
        const { driver, dropdownLayoutDriver } = createDriver(
          <InputWithOptions options={options} onKeyArrowDown={() => null} />,
        );
        await driver.pressKey('ArrowDown');
        expect(await dropdownLayoutDriver.isShown()).toBe(true);
        await driver.pressKey('Enter');
        expect(await dropdownLayoutDriver.isShown()).toBe(false);
        await driver.pressKey('Escape');
        expect(await dropdownLayoutDriver.isShown()).toBe(false);
      });
    });

    describe('onKeyArrowUp', () => {
      it("should NOT move Input's text cursor", async () => {
        const filteringText = 'Opt';
        const { driver, inputDriver } = createDriver(
          <InputWithOptions
            options={options}
            value={filteringText}
            autoFocus
          />,
        );

        await driver.pressKey('ArrowDown');
        await driver.pressKey('ArrowDown');
        await driver.pressKey('ArrowUp');

        const cursorLocation = await inputDriver.getCursorLocation();
        expect(cursorLocation).toEqual(filteringText.length);
      });
    });

    describe('onSelect', () => {
      it('should call onSelect on enter key press', async () => {
        const onSelect = jest.fn();
        const { driver } = createDriver(
          <InputWithOptions options={options} onSelect={onSelect} />,
        );
        await driver.pressKey('ArrowDown');
        await driver.pressKey('ArrowDown');
        await driver.pressKey('Enter');
        expect(onSelect).toBeCalledWith(options[0]);
      });

      it('should call onSelect on tab key press', async () => {
        const onSelect = jest.fn();
        const { driver } = createDriver(
          <InputWithOptions options={options} onSelect={onSelect} />,
        );
        await driver.pressKey('ArrowDown');
        await driver.pressKey('ArrowDown');
        await driver.pressKey('Tab');
        expect(onSelect).toBeCalledWith(options[0]);
      });

      it('should not call onSelect on space key press', async () => {
        const onSelect = jest.fn();
        const { driver } = createDriver(
          <InputWithOptions options={options} onSelect={onSelect} />,
        );
        await driver.focus();
        await driver.pressKey('ArrowDown');
        await driver.pressKey(' ');
        expect(onSelect).not.toHaveBeenCalled();
      });

      it('should call onSelect on space key press in readOnly mode', async () => {
        const onSelect = jest.fn();
        class ReadOnlyInput extends InputWithOptions {
          inputAdditionalProps = () => ({ readOnly: true });
        }
        const { driver } = createDriver(
          <ReadOnlyInput options={options} onSelect={onSelect} />,
        );
        await driver.pressKey('ArrowDown');
        await driver.pressKey('ArrowDown');
        await driver.pressKey(' ');
        expect(onSelect).toBeCalledWith(options[0]);
      });
    });

    describe('onClose', () => {
      it('should call onClose when click on option element', async () => {
        const onClose = jest.fn();
        const { driver, dropdownLayoutDriver } = createDriver(
          <InputWithOptions options={options} onClose={onClose} />,
        );

        await driver.focus();
        expect(onClose).not.toHaveBeenCalled();
        await dropdownLayoutDriver.clickAtOption(0);
        expect(onClose).toHaveBeenCalled();
      });

      it('should call onClose when press escape button', async () => {
        const onClose = jest.fn();
        const { driver } = createDriver(
          <InputWithOptions options={options} onClose={onClose} />,
        );

        await driver.focus();
        await driver.pressKey('ArrowDown');
        expect(onClose).not.toHaveBeenCalled();
        await driver.pressKey('Escape');
        expect(onClose).toHaveBeenCalled();
      });
    });

    describe('onOptionsHide', () => {
      it('should call onOptionsHide when click on option element', async () => {
        const onOptionsHide = jest.fn();
        const { driver, dropdownLayoutDriver } = createDriver(
          <InputWithOptions options={options} onOptionsHide={onOptionsHide} />,
        );

        await driver.focus();
        await dropdownLayoutDriver.clickAtOption(0);
        expect(onOptionsHide).toHaveBeenCalled();
      });

      it('should call on onOptionsHide key after options hide when select element by enter', async () => {
        const onOptionsHide = jest.fn();
        const { driver } = createDriver(
          <InputWithOptions options={options} onOptionsHide={onOptionsHide} />,
        );

        await driver.focus();
        await driver.pressKey('ArrowDown');
        await driver.pressKey('Enter');
        expect(onOptionsHide).toHaveBeenCalled();
      });

      it('should not call onOptionsHide when closeOnSelect is false and when click by element', async () => {
        const onOptionsHide = jest.fn();

        const { inputDriver, dropdownLayoutDriver } = createDriver(
          <InputWithOptions
            options={options}
            onOptionsHide={onOptionsHide}
            closeOnSelect={false}
          />,
        );

        await inputDriver.focus();
        await dropdownLayoutDriver.clickAtOption(0);
        expect(onOptionsHide).not.toHaveBeenCalled();
      });
    });

    describe('onOptionsShow', () => {
      it('should call onOptionsShow when focusing an element with arrow down', async () => {
        const onOptionsShow = jest.fn();
        const { driver } = createDriver(
          <InputWithOptions options={options} onOptionsShow={onOptionsShow} />,
        );

        await driver.pressKey('ArrowDown');

        expect(onOptionsShow).toHaveBeenCalled();
      });

      it('should call onOptionsShow after enter text', async () => {
        const onOptionsShow = jest.fn();
        const { inputDriver } = createDriver(
          <InputWithOptions options={options} onOptionsShow={onOptionsShow} />,
        );

        expect(onOptionsShow).not.toHaveBeenCalled();
        await inputDriver.focus();
        expect(onOptionsShow).not.toHaveBeenCalled();
        await inputDriver.enterText('some value');
        expect(onOptionsShow).toHaveBeenCalled();
      });
    });

    describe('Public methods', () => {
      describe('InputWithOptions.focus', () => {
        it('should focus input', () => {
          const wrapper = mount(<InputWithOptions />);
          const focusMock = jest.fn();
          wrapper.instance().input.focus = focusMock;
          wrapper.instance().focus({ preventScroll: true });
          expect(focusMock).toHaveBeenCalledWith({ preventScroll: true });
        });
      });

      describe('InputWithOptions.blur', () => {
        it('should blur input', () => {
          const wrapper = mount(<InputWithOptions />);
          const blurMock = jest.fn();
          wrapper.instance().input.blur = blurMock;
          wrapper.instance().blur();
          expect(blurMock).toHaveBeenCalledWith();
        });
      });

      describe('InputWithOptions.select', () => {
        it('should select input', () => {
          const wrapper = mount(<InputWithOptions />);
          const selectMock = jest.fn();
          wrapper.instance().input.select = selectMock;
          wrapper.instance().select();
          expect(selectMock).toHaveBeenCalledWith();
        });
      });

      describe('InputWithOptions.showOptions', () => {
        it('should show options', async () => {
          const dataHook = 'test';
          const wrapper = mount(
            <InputWithOptions options={options} dataHook={dataHook} />,
          );
          const { dropdownLayoutDriver } = inputWithOptionsEnzymeDriverFactory({
            wrapper,
            dataHook,
          });
          expect(await dropdownLayoutDriver.isShown()).toBe(false);
          wrapper.instance().showOptions();
          expect(await dropdownLayoutDriver.isShown()).toBe(true);
        });
      });

      describe('InputWithOptions.hideOptions', () => {
        it('should hide options', async () => {
          const dataHook = 'test';
          const wrapper = mount(
            <InputWithOptions options={options} dataHook={dataHook} />,
          );
          const {
            driver,
            dropdownLayoutDriver,
          } = inputWithOptionsEnzymeDriverFactory({
            wrapper,
            dataHook,
          });

          await driver.pressKey('ArrowDown');
          expect(await dropdownLayoutDriver.isShown()).toBe(true);
          wrapper.instance().hideOptions();
          expect(await dropdownLayoutDriver.isShown()).toBe(false);
        });
      });
    });
  }

  describe('[async] only', () => {
    const render = createRendererWithUniDriver(
      inputWithOptionsUniDriverFactory,
    );
    const createDriver = jsx => render(jsx).driver;

    describe('native', () => {
      it('should invoke onSelect when an option is clicked', async () => {
        const sampleOptions = [
          { id: 50, value: 'Option 1' },
          { id: 30, value: 'Option 2' },
          { id: 20, value: 'Option 3' },
        ];
        const selectedId = 30;
        const onSelect = jest.fn();
        const { driver } = createDriver(
          <InputWithOptions
            options={sampleOptions}
            onSelect={onSelect}
            native
          />,
        );

        await driver.selectOptionById(selectedId);

        expect(onSelect).toHaveBeenCalledWith(sampleOptions[1]);
        expect(onSelect).toHaveBeenCalledTimes(1);
      });

      it('should not invoke onSelect when an option is clicked and disabled prop is passed', async () => {
        const render = createRendererWithUniDriver(
          inputWithOptionsUniDriverFactory,
        );
        const createDriver = jsx => render(jsx).driver;

        const sampleOptions = [
          { id: 1, value: 'Option 1' },
          { id: 2, value: 'Option 2' },
        ];

        const onSelect = jest.fn();

        const { driver } = createDriver(
          <InputWithOptions
            options={sampleOptions}
            onSelect={onSelect}
            native
            disabled
          />,
        );

        await driver.selectOptionById(2);

        expect(onSelect).toHaveBeenCalledTimes(0);
      });
    });
  });
});
