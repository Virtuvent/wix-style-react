import { extractAttributes, extractDataAttributes } from './extractAttributes';

describe('extractAttributes', () => {
  it('should return all attributes when no prefix is passed', () => {
    const props = { skin: 'dark', color: 'red' };
    expect(extractAttributes(props)).toEqual(props);
  });

  it('should return no attributes when none start with the provided prefix', () => {
    const props = { skin: 'dark', color: 'red' };
    expect(extractAttributes(props, 'bla')).toEqual({});
  });

  it('should return only attributes that start with the provided prefix', () => {
    const props = {
      mySkin: 'dark',
      myColor: 'red',
      yourSmell: 'stink',
      my: 'feet',
    };
    const result = extractAttributes(props, 'my');
    expect(Object.keys(result).length).toEqual(3);
    expect(result.mySkin).toEqual(props.mySkin);
    expect(result.myColor).toEqual(props.myColor);
    expect(result.yourSmell).not.toBeDefined();
    expect(result.my).toEqual('feet');
  });
});

describe('extractDataAttributes', () => {
  it('should return only attributes that start with `data-`', function() {
    const props = {
      'data-att1': 'att1',
      'data-att2': 'att2',
      'no-data-att': 'att',
      'data-': 'att',
    };
    const result = extractDataAttributes(props);
    expect(Object.keys(result).length).toEqual(3);
    expect(result['data-att1']).toEqual('att1');
    expect(result['data-att2']).toEqual('att2');
    expect(result['no-data-att']).not.toBeDefined();
    expect(result['data-']).toEqual('att');
  });
});
