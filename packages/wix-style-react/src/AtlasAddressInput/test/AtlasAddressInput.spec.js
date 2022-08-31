import React from 'react';
import { AmbassadorTestkit } from '@wix/ambassador-testkit';
import { WixAtlasServiceWeb } from '@wix/ambassador-wix-atlas-service-web/http';
import { AmbassadorHTTPError } from '@wix/ambassador/runtime/http';
import {
  aCommonAddress,
  aPredictResponse,
  aSearchResponse,
  aSearchResult,
  aV2Prediction as aPrediction,
} from '@wix/ambassador-wix-atlas-service-web/builders';
import {
  createRendererWithUniDriver,
  cleanup,
  act,
  eventually,
} from '../../../test/utils/unit';

import AtlasAddressInput from '../AtlasAddressInput';
import { atlasAddressInputPrivateDriverFactory } from './AtlasAddressInput.private.uni.driver';
import { BASE_ATLAS_URL } from '../../providers/useAtlasClient/useAtlasClient';

const commonProps = {
  debounceMs: 0,
};

const mockResults = (ambassadorTestkit, amountOfItems) => {
  const predictions = Array.from({ length: amountOfItems }, (_, index) => {
    const mainText = `Address ${index + 1}`;
    const secondaryText = 'Country';
    const description = `${mainText}, ${secondaryText}`;
    return aPrediction()
      .withSearchId(`${index}`)
      .withDescription(description)
      .withTextStructure({
        mainText,
        secondaryText,
      })
      .build();
  });
  const response = aPredictResponse()
    .withPredictions(predictions)
    .build();
  const atlasStub = ambassadorTestkit.createStub(
    WixAtlasServiceWeb,
    BASE_ATLAS_URL,
  );
  atlasStub
    .AutocompleteServiceV2()
    .predict.always()
    .resolve(response);
  return predictions;
};

const mockSearchAddresses = (ambassadorTestkit, amountOfItems = 5) => {
  const addresses = Array.from({ length: amountOfItems }, (_, index) => {
    const mainText = `Address ${index + 1}`;
    const secondaryText = 'Country';
    const formattedAddress = `${mainText}, ${secondaryText}`;
    return aCommonAddress()
      .withFormattedAddress(formattedAddress)
      .build();
  });
  const searchResults = addresses.map(address =>
    aSearchResult()
      .withAddress(address)
      .build(),
  );
  const response = aSearchResponse()
    .withSearchResults(searchResults)
    .build();
  const atlasStub = ambassadorTestkit.createStub(
    WixAtlasServiceWeb,
    BASE_ATLAS_URL,
  );
  atlasStub
    .LocationServiceV2()
    .search.always()
    .resolve(response);
  return addresses;
};

const mockAmbassadorError = ambassadorTestkit => {
  const atlasStub = ambassadorTestkit.createStub(
    WixAtlasServiceWeb,
    BASE_ATLAS_URL,
  );
  atlasStub
    .AutocompleteServiceV2()
    .predict.always()
    .reject();
};

describe(AtlasAddressInput.displayName, () => {
  const ambassadorTestkit = new AmbassadorTestkit();
  ambassadorTestkit.beforeAndAfter();

  const render = createRendererWithUniDriver(
    atlasAddressInputPrivateDriverFactory,
  );

  afterEach(cleanup);

  it('should render', async () => {
    const { driver } = render(<AtlasAddressInput {...commonProps} />);

    expect(await driver.exists()).toBe(true);
  });

  it('should fetch results from Atlas on enter text', async () => {
    const amountOfItems = 5;
    mockResults(ambassadorTestkit, amountOfItems);

    const { driver } = render(<AtlasAddressInput {...commonProps} />);
    expect(await driver.getAmountOfItems()).toBe(0);

    await driver.enterText('test');

    await act(async () =>
      eventually(async () => {
        expect(await driver.getAmountOfItems()).toBe(amountOfItems);
        expect(await driver.getItemMainLabelAt(0)).toBe('Address 1');
        expect(await driver.getItemSecondaryLabelAt(0)).toBe('Country');
      }),
    );
  });

  it('should invoke onChange', async () => {
    const text = 'test';
    const props = {
      ...commonProps,
      onChange: jest.fn(),
    };
    const { driver } = render(<AtlasAddressInput {...props} />);

    expect(props.onChange).not.toHaveBeenCalled();
    expect(await driver.getInputValue()).toEqual('');

    await driver.enterText(text);

    expect(props.onChange).toHaveBeenCalled();
    expect(await driver.getInputValue()).toEqual(text);
  });

  it('should invoke onClear', async () => {
    const props = {
      ...commonProps,
      onClear: jest.fn(),
      initialValue: 'test',
    };
    const { driver } = render(<AtlasAddressInput {...props} />);

    expect(props.onClear).not.toHaveBeenCalled();
    expect(await driver.getInputValue()).toEqual('test');

    await driver.clickClear();

    expect(props.onClear).toHaveBeenCalled();
    expect(await driver.getInputValue()).toEqual('');
  });

  it('should invoke onSelect', async () => {
    const amountOfItems = 5;
    const predictions = mockResults(ambassadorTestkit, amountOfItems);
    const props = {
      ...commonProps,
      onSelect: jest.fn((option, getAddress) => {}),
    };
    const { driver } = render(<AtlasAddressInput {...props} />);

    expect(props.onSelect).not.toHaveBeenCalled();

    await driver.enterText('test');

    await act(async () =>
      eventually(async () => {
        expect(await driver.getAmountOfItems()).toBe(amountOfItems);
        await driver.clickAtOption(0);
        expect(props.onSelect).toHaveBeenCalledWith(
          expect.objectContaining({ id: predictions[0].searchId }),
          expect.any(Function),
        );
      }),
    );
  });

  it('should invoke onSelect with search result when `selectOnSubmit` is true', async () => {
    const addresses = mockSearchAddresses(ambassadorTestkit);
    let getAddress;
    const props = {
      ...commonProps,
      onSelect: jest.fn(async (option, getAddressFn) => {
        // set getAddress to the resulting function
        getAddress = getAddressFn;
      }),
      selectOnSubmit: true,
    };
    const { driver } = render(<AtlasAddressInput {...props} />);

    const testValue = 'test';
    await driver.enterText(testValue);
    expect(props.onSelect).not.toHaveBeenCalled();
    await driver.pressEnter();

    await act(async () =>
      eventually(async () => {
        expect(props.onSelect).toHaveBeenCalledWith(
          expect.objectContaining({
            label: testValue,
          }),
          expect.any(Function),
        );
      }),
    );
    await act(async () => {
      expect(await getAddress()).toEqual(addresses[0]);
    });
  });

  it('should display option prefix when prop is passed', async () => {
    const amountOfItems = 1;
    mockResults(ambassadorTestkit, amountOfItems);

    const optionPrefix = 'hello';
    const props = {
      ...commonProps,
      optionPrefix,
    };
    const { driver } = render(<AtlasAddressInput {...props} />);

    await driver.enterText('test');

    await act(async () =>
      eventually(async () => {
        const itemPrefix = await driver.getItemPrefixAt(0);
        expect(await itemPrefix.text()).toBe(optionPrefix);
      }),
    );
  });

  it('should display option suffix when prop is passed', async () => {
    const amountOfItems = 1;
    mockResults(ambassadorTestkit, amountOfItems);

    const optionSuffix = 'hello';
    const props = {
      ...commonProps,
      optionSuffix,
    };
    const { driver } = render(<AtlasAddressInput {...props} />);

    await driver.enterText('test');

    await act(async () =>
      eventually(async () => {
        const itemPrefix = await driver.getItemSuffixAt(0);
        expect(await itemPrefix.text()).toBe(optionSuffix);
      }),
    );
  });

  it('should invoke onError when an error occurs', async () => {
    mockAmbassadorError(ambassadorTestkit);
    const onError = jest.fn();
    const props = { ...commonProps, onError };

    const { driver } = render(<AtlasAddressInput {...props} />);

    await driver.enterText('test');
    await act(async () =>
      eventually(async () => {
        expect(onError).toHaveBeenCalledWith(expect.any(AmbassadorHTTPError));
      }),
    );
  });
});
