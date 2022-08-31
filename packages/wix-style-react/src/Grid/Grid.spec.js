import React from 'react';
import { shallow } from 'enzyme';
import classNames from 'classnames';

import { AutoAdjustedColumns, Container, Col, Columns } from './Grid';

describe('Grid `<Container/>`', () => {
  describe('`className` prop', () => {
    it('should pass className to columns element', () => {
      const element = shallow(<Container className="test" />);
      expect(element.hasClass('test')).toEqual(true);
    });

    it('should pass classNames to columns element', () => {
      const element = shallow(
        <Container className={classNames('test1', 'test2')} />,
      );
      expect(element.hasClass('test1')).toEqual(true);
      expect(element.hasClass('test2')).toEqual(true);
    });
  });
});

describe('Grid <Col/>', () => {
  describe('breakpoints col options', () => {
    it('should add col xs class when using span attribute ', () => {
      const element = shallow(<Col span="6" />);
      expect(element.hasClass('colXs6')).toEqual(true);
    });

    it('should add col xs class when no span attribute is given and 12 is default', () => {
      const element = shallow(<Col />);
      expect(element.hasClass('colXs12')).toEqual(true);
    });

    it('should add col sm class when using sm attribute ', () => {
      const element = shallow(<Col sm="3" />);
      expect(element.hasClass('colSm3')).toEqual(true);
    });

    it('should add col md class when using md attribute ', () => {
      const element = shallow(<Col md="12" />);
      expect(element.hasClass('colMd12')).toEqual(true);
    });

    it('should add col lg class when using lg attribute ', () => {
      const element = shallow(<Col lg="1" />);
      expect(element.hasClass('colLg1')).toEqual(true);
    });

    it('should add col xl class when using xl attribute ', () => {
      const element = shallow(<Col xl="5" />);
      expect(element.hasClass('colXl5')).toEqual(true);
    });

    it('should accept numeric values', () => {
      const element = shallow(<Col md={12} />);
      expect(element.hasClass('colMd12')).toEqual(true);
    });

    it('should add multiple col classes when using breakpoints attributes', () => {
      const element = shallow(<Col sm="3" md="12" lg="1" xl="5" />);
      expect(element.hasClass('colXl5')).toEqual(true);
      expect(element.hasClass('colLg1')).toEqual(true);
      expect(element.hasClass('colMd12')).toEqual(true);
      expect(element.hasClass('colSm3')).toEqual(true);
    });
  });

  describe('breakpoints hide options', () => {
    it('should add hidden xs class when using hiddenxs attribute ', () => {
      const element = shallow(<Col xs="hidden" />);
      expect(element.hasClass('hiddenXs')).toEqual(true);
    });

    it('should add hidden sm class when using hiddensm attribute ', () => {
      const element = shallow(<Col sm="hidden" />);
      expect(element.hasClass('hiddenSm')).toEqual(true);
    });

    it('should add hidden md class when using hiddenmd attribute ', () => {
      const element = shallow(<Col md="hidden" />);
      expect(element.hasClass('hiddenMd')).toEqual(true);
    });

    it('should add hidden lg class when using hiddenlg attribute ', () => {
      const element = shallow(<Col lg="hidden" />);
      expect(element.hasClass('hiddenLg')).toEqual(true);
    });
  });

  describe('breakpoints show options', () => {
    it('should add visible xs class when using xs attribute ', () => {
      const element = shallow(<Col xs="visible" />);
      expect(element.hasClass('visibleXs')).toEqual(true);
    });

    it('should add visible sm class when using sm attribute ', () => {
      const element = shallow(<Col sm="visible" />);
      expect(element.hasClass('visibleSm')).toEqual(true);
    });

    it('should add visible md class when using md attribute ', () => {
      const element = shallow(<Col md="visible" />);
      expect(element.hasClass('visibleMd')).toEqual(true);
    });

    it('should add visible lg class when using lg attribute ', () => {
      const element = shallow(<Col lg="visible" />);
      expect(element.hasClass('visibleLg')).toEqual(true);
    });
  });

  describe('`className` prop', () => {
    it('should pass to element', () => {
      const element = shallow(<Col className="test" />);
      expect(element.hasClass('test')).toEqual(true);
    });

    it('should support multiple classNames', () => {
      const element = shallow(<Col className={classNames('test1', 'test2')} />);
      expect(element.hasClass('test1')).toEqual(true);
      expect(element.hasClass('test2')).toEqual(true);
    });
  });

  describe('support dataHook', () => {
    it('for Col', () => {
      const element = shallow(<Col dataHook="test" />);
      expect(element.find('[data-hook="test"]')).toHaveLength(1);
    });

    it('for Columns', () => {
      const element = shallow(<Columns dataHook="test" />);
      expect(element.find('[data-hook="test"]')).toHaveLength(1);
    });
  });
});

describe('Grid `<Columns/>`', () => {
  describe('`className` prop', () => {
    it('should pass className to element', () => {
      const element = shallow(<Columns className="test" />);
      expect(element.hasClass('test')).toEqual(true);
    });

    it('should pass multiple classes', () => {
      const element = shallow(
        <Columns className={classNames('test1', 'test2')} />,
      );
      expect(element.hasClass('test1')).toEqual(true);
      expect(element.hasClass('test2')).toEqual(true);
    });
  });
});

describe('Grid `<AutoAdjustedColumns/>`', () => {
  it('should set correct Col elements with correct span prop', () => {
    const element = shallow(
      <AutoAdjustedColumns>
        <div />
        <div />
        <div />
        <div />
      </AutoAdjustedColumns>,
    );
    expect(element.find(Col).length).toBe(4);
    expect(
      element
        .find(Col)
        .at(0)
        .prop('span'),
    ).toEqual(3);
    expect(
      element
        .find(Col)
        .at(1)
        .prop('span'),
    ).toEqual(3);
    expect(
      element
        .find(Col)
        .at(2)
        .prop('span'),
    ).toEqual(3);
    expect(
      element
        .find(Col)
        .at(3)
        .prop('span'),
    ).toEqual(3);
  });

  it('should ignore falsy elements from span calculation', () => {
    const showShowC = false;
    const element = shallow(
      <AutoAdjustedColumns>
        <div>a</div>
        <div>b</div>
        {showShowC && <div>c</div>}
        <div>d</div>
      </AutoAdjustedColumns>,
    );
    expect(element.find(Col).length).toBe(3);
    expect(
      element
        .find(Col)
        .at(0)
        .prop('span'),
    ).toEqual(4);
    expect(
      element
        .find(Col)
        .at(1)
        .prop('span'),
    ).toEqual(4);
    expect(
      element
        .find(Col)
        .at(2)
        .prop('span'),
    ).toEqual(4);
  });
});
