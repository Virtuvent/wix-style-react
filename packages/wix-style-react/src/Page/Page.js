import React from 'react';
import { WixStyleReactContext } from '../WixStyleReactProvider/context';
import PropTypes from 'prop-types';
import { ResizeSensor } from 'css-element-queries';
import { st, classes, stVars } from './Page.st.css';
import { PageContext } from './PageContext';
import PageHeader from '../PageHeader';
import PageSection from '../PageSection';
import Content from './Content';
import Tail from './Tail';
import { PageSticky } from './PageSticky';
import FixedFooter from './FixedFooter';
import ScrollableContainer from '../common/ScrollableContainer';
import { ScrollableContainerCommonProps } from '../common/PropTypes/ScrollableContainerCommon';

/*
 * Page structure without mini-header-overlay:
 *
 * + PageWrapper (Horizontal Scroll) --
 * | +- Page --------------------------
 * | | +--  ScrollableContainer (Vertical Scroll)
 * | | | +--  MinimizationPlaceholder
 * | | | |
 * | | | +-----------------------------
 * | | | +-- HeaderContainer ------ (position: fixed - when minimized)
 * | | | | +-- Page.Header ------------
 * | | | | |
 * | | | | +---------------------------
 * | | | | +-- Page.Tail --------------
 * | | | | |
 * | | | | +---------------------------
 * | | | +-----------------------------
 * | | | +-- ContentWrapper------------
 * | | | | +-- Page.FixedContent (Deprecated)
 * | | | | |
 * | | | | +---------------------------
 * | | | | +-- Page.Content -----------
 * | | | | | +-- Page.Section ---------
 * | | | | |
 * | | | | +---------------------------
 * | | | +-----------------------------
 * | | +-------------------------------
 * | +--------------------------------- (Page - End)
 * +----------------------------------- (PageWrapper - End)
 *
 * -  ScrollableContainer has a data-classnamed 'scrollable-content', and should NOT be renamed, since
 * Tooltip is hard-coded-ly using a selector like this: [data-class="page-scrollable-content"]
 */

class Page extends React.PureComponent {
  static defaultProps = {
    minWidth: parseInt(stVars.mainContainerMinWidth, 10),
    maxWidth: parseInt(stVars.mainContainerMaxWidth, 10),
    scrollProps: {},
  };

  constructor(props) {
    super(props);

    this.scrollableContainerRef = React.createRef();
    this._handleScroll = this._handleScroll.bind(this);
    this._handleWidthResize = this._handleWidthResize.bind(this);
    this._handleWindowResize = this._handleWindowResize.bind(this);
    this._calculateComponentsHeights = this._calculateComponentsHeights.bind(
      this,
    );

    this.state = {
      headerContainerHeight: 0,
      headerWrapperHeight: 0,
      tailHeight: 0,
      scrollBarWidth: 0,
      footerHeight: 0,
      minimized: false,
    };
  }

  componentDidMount() {
    this._calculateComponentsHeights();
    this.contentResizeListener = new ResizeSensor(
      this._getScrollContainer().childNodes[0],
      this._handleWidthResize,
    );
    this._handleWidthResize();
    window.addEventListener('resize', this._handleWindowResize);

    // TODO: Hack to fix cases where initial measurement of headerWrapperHeight is not correct (need to investigate)
    // Happens in PageTestStories -> PageWithScroll -> 5. Scroll - Trigger Mini Header
    // Maybe there is a transition
    const ARBITRARY_SHORT_DURATION_MS = 100;
    setTimeout(this._calculateComponentsHeights, ARBITRARY_SHORT_DURATION_MS);

    // This is done for backward compatibility only,
    // Notifying current users that passed the `scrollableContentRef` prop about the ref current value.
    // New users should be encouraged to use the new event handlers onScrollChanged/onScrollAreaChanged
    // according to their use case.
    this.props.scrollableContentRef &&
      this.props.scrollableContentRef(this.scrollableContainerRef.current);
  }

  componentDidUpdate(prevProps) {
    this._calculateComponentsHeights();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._handleWindowResize);
    this.contentResizeListener.detach(this._handleResize);
  }

  _getNamedChildren() {
    return getChildrenObject(this.props.children);
  }

  _calculateComponentsHeights() {
    const {
      headerContainerHeight,
      headerWrapperHeight,
      tailHeight,
      pageHeight,
      footerHeight,
      minimized,
    } = this.state;

    const newHeaderWrapperHeight =
      this.headerWrapperRef && !minimized
        ? this.headerWrapperRef.getBoundingClientRect().height
        : headerWrapperHeight;

    const newHeaderContainerHeight =
      this.headerWrapperRef && !minimized
        ? this.headerContainerRef.getBoundingClientRect().height
        : headerContainerHeight;

    const newTailHeight = this.pageHeaderTailRef
      ? this.pageHeaderTailRef.offsetHeight
      : 0;
    const newPageHeight = this.pageRef ? this.pageRef.offsetHeight : 0;
    const newFooterHeight = this.footerWrapperRef
      ? this.footerWrapperRef.offsetHeight
      : 0;

    if (
      headerContainerHeight !== newHeaderContainerHeight ||
      headerWrapperHeight !== newHeaderWrapperHeight ||
      tailHeight !== newTailHeight ||
      pageHeight !== newPageHeight ||
      footerHeight !== newFooterHeight
    ) {
      this.setState({
        headerContainerHeight: newHeaderContainerHeight,
        headerWrapperHeight: newHeaderWrapperHeight,
        tailHeight: newTailHeight,
        pageHeight: newPageHeight,
        footerHeight: newFooterHeight,
      });
    }
  }

  _getScrollContainer() {
    return this.scrollableContainerRef.current;
  }

  _getMinimizedHeaderWrapperHeight() {
    if (!this._hasHeader()) {
      return 0;
    }

    return this._hasTail()
      ? parseInt(stVars.minimizedHeaderWrapperWithTailHeightPx, 10)
      : parseInt(stVars.minimizedHeaderWrapperHeightPx, 10);
  }

  _getMinimizationDiff() {
    const { headerWrapperHeight } = this.state;
    return headerWrapperHeight
      ? headerWrapperHeight - this._getMinimizedHeaderWrapperHeight()
      : null;
  }

  _handleScroll(e) {
    const containerScrollTop = this._getScrollContainer().scrollTop;

    const { minimized } = this.state;

    const minimizationDiff = this._getMinimizationDiff();
    const nextDisplayMiniHeader =
      minimizationDiff && containerScrollTop >= minimizationDiff;

    if (minimized !== nextDisplayMiniHeader) {
      this.setState({
        minimized: nextDisplayMiniHeader,
      });
    }

    const {
      scrollProps: { onScrollChanged },
    } = this.props;
    if (onScrollChanged) {
      onScrollChanged(e);
    }
  }

  _handleWidthResize() {
    // Fixes width issues when scroll bar is present in windows
    const scrollContainer = this._getScrollContainer();
    const scrollBarWidth =
      scrollContainer &&
      scrollContainer.offsetWidth - scrollContainer.clientWidth;

    if (this.state.scrollBarWidth !== scrollBarWidth) {
      this.setState({ scrollBarWidth });
    }
  }

  _handleWindowResize() {
    // TODO: Optimize : https://developer.mozilla.org/en-US/docs/Web/Events/resize

    // Taken from here: https://github.com/kunokdev/react-window-size-listener/blob/d64c077fba4d4e0ce060464078c5fc19620528e6/src/index.js#L66
    const windowHeight =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;

    if (this.state.windowHeight !== windowHeight) {
      // We are not using windowHeight directly, since we need to measure the `<Page/>`'s height,
      // But we hold it in the state to avoid rendering when only window.width changes
      this.setState({ windowHeight });
    }
  }

  _safeGetChildren(element) {
    if (!element || !element.props || !element.props.children) {
      return [];
    }

    return element.props.children;
  }

  _getPageDimensionsStyle() {
    const { maxWidth, sidePadding } = this.props;
    // TODO: Simplify - maxWidth is always truthy (from defaultProp)
    if (!maxWidth && !sidePadding && sidePadding !== 0) {
      return null;
    }

    const styles = {};
    if (maxWidth) {
      styles.maxWidth = `${maxWidth}px`;
    }

    if (sidePadding || sidePadding === 0) {
      styles.paddingLeft = `${sidePadding}px`;
      styles.paddingRight = `${sidePadding}px`;
    }

    return styles;
  }

  _hasBackgroundImage() {
    return !!this.props.backgroundImageUrl;
  }

  _hasGradientClassName() {
    return !!this.props.gradientClassName && !this.props.backgroundImageUrl;
  }

  _renderContentHorizontalLayout(props) {
    const { PageContent } = this._getNamedChildren();
    const contentFullScreen = PageContent && PageContent.props.fullScreen;

    const { className, horizontalScroll, style, ...rest } = props;

    const pageDimensionsStyle = contentFullScreen
      ? null
      : this._getPageDimensionsStyle();

    return (
      <div
        className={st(
          classes.contentHorizontalLayout,
          {
            contentFullWidth: contentFullScreen,
            horizontalScroll,
          },
          className,
        )}
        style={{ ...pageDimensionsStyle, ...style }}
        {...rest}
      >
        {props.children}
      </div>
    );
  }

  _renderHeader() {
    const { minimized } = this.state;
    const { PageHeader: PageHeaderChild } = this._getNamedChildren();
    const dataHook = 'page-header-wrapper';

    return (
      PageHeaderChild && (
        <WixStyleReactContext.Consumer key={dataHook}>
          {({ reducedSpacingAndImprovedLayout }) => (
            <div
              data-hook={dataHook}
              className={st(classes.headerWrapper, {
                reducedSpacingAndImprovedLayout,
                minimized,
              })}
              ref={ref => (this.headerWrapperRef = ref)}
            >
              {React.cloneElement(PageHeaderChild, {
                minimized,
                hasBackgroundImage: this._hasBackgroundImage(),
              })}
            </div>
          )}
        </WixStyleReactContext.Consumer>
      )
    );
  }

  _renderHeaderContainer() {
    const { minimized, scrollBarWidth } = this.state;

    return (
      <div
        data-hook="page-header-container"
        className={st(classes.pageHeaderContainer, {
          minimized,
          hasTail: this._hasTail(),
        })}
        ref={ref => (this.headerContainerRef = ref)}
        onWheel={event => {
          event.preventDefault();
          this._getScrollContainer().scrollTop =
            this._getScrollContainer().scrollTop + event.deltaY;
        }}
        style={{ width: `calc(100% - ${minimized ? scrollBarWidth : 0}px)` }}
      >
        {this._renderContentHorizontalLayout({
          children: [this._renderHeader(), this._renderTail()],
        })}
      </div>
    );
  }

  _renderScrollableContainer() {
    const {
      scrollProps: { onScrollAreaChanged },
    } = this.props;
    return (
      <ScrollableContainer
        className={st(classes.scrollableContainer, {
          hasTail: this._hasTail(),
        })}
        dataHook="page-scrollable-content"
        data-class="page-scrollable-content"
        ref={this.scrollableContainerRef}
        onScrollAreaChanged={onScrollAreaChanged}
        onScrollChanged={this._handleScroll}
      >
        {this._renderScrollableBackground()}
        {this._renderMinimizationPlaceholder()}
        {this._renderHeaderContainer()}
        {this._renderContentContainer()}
        {this._renderFixedFooter()}
      </ScrollableContainer>
    );
  }

  _hasTail() {
    return !!this._getNamedChildren().PageTail;
  }

  _hasHeader() {
    return !!this._getNamedChildren().PageHeader;
  }

  _renderMinimizationPlaceholder() {
    const { headerContainerHeight, minimized } = this.state;
    return (
      <div
        style={{
          height: `${minimized ? headerContainerHeight : 0}px`,
        }}
      />
    );
  }

  _renderScrollableBackground() {
    const { headerContainerHeight, tailHeight } = this.state;

    const backgroundHeight = `${headerContainerHeight -
      tailHeight +
      (this._hasTail() ? 0 : parseInt(stVars.backgroundCoverContentPx, 10))}px`;

    if (this._hasBackgroundImage()) {
      return (
        <div
          className={classes.imageBackgroundContainer}
          style={{ height: backgroundHeight }}
          data-hook="page-background-image"
        >
          <div
            className={classes.imageBackground}
            style={{ backgroundImage: `url(${this.props.backgroundImageUrl})` }}
          />
        </div>
      );
    }

    if (this._hasGradientClassName()) {
      return (
        <div
          data-hook="page-gradient-class-name"
          className={st(
            classes.gradientBackground,
            {},
            this.props.gradientClassName,
          )}
          style={{ height: backgroundHeight }}
        />
      );
    }
  }

  _renderTail() {
    const { PageTail } = this._getNamedChildren();
    const dataHook = 'page-tail';

    return (
      PageTail && (
        <div
          data-hook={dataHook}
          key={dataHook}
          className={classes.tail}
          ref={r => (this.pageHeaderTailRef = r)}
        >
          {PageTail}
        </div>
      )
    );
  }

  _renderContentContainer() {
    const { footerHeight } = this.state;
    const { children } = this.props;
    const childrenObject = getChildrenObject(children);
    const { PageContent, PageFixedContent } = childrenObject;

    return (
      <PageContext.Provider
        value={{
          stickyStyle: {
            top: `${this._getMinimizedHeaderWrapperHeight() +
              this.state.tailHeight}px`,
          },
        }}
      >
        {this._renderContentHorizontalLayout({
          className: classes.contentContainer,
          style: {
            paddingBottom: footerHeight || '48px',
          },
          horizontalScroll: this.props.horizontalScroll,
          children: (
            <div className={classes.contentFloating}>
              {PageFixedContent && (
                <PageSticky data-hook="page-fixed-content">
                  {React.cloneElement(PageFixedContent)}
                </PageSticky>
              )}
              {this._safeGetChildren(PageContent)}
            </div>
          ),
        })}
      </PageContext.Provider>
    );
  }

  _renderFixedFooter = () => {
    const { children } = this.props;
    const childrenObject = getChildrenObject(children);
    const { FixedFooter: FixedFooterChild, PageContent } = childrenObject;
    const contentFullScreen = PageContent && PageContent.props.fullScreen;

    const pageDimensionsStyle = contentFullScreen
      ? null
      : this._getPageDimensionsStyle();

    if (FixedFooterChild) {
      return (
        <div
          className={classes.fixedFooter}
          ref={ref => {
            this.footerWrapperRef = ref;
          }}
          style={pageDimensionsStyle}
        >
          {React.cloneElement(FixedFooterChild, {})}
        </div>
      );
    }
  };

  render() {
    const { dataHook, className, minWidth, zIndex, height } = this.props;

    return (
      <div
        data-hook={dataHook}
        className={st(classes.root, {}, className)}
        style={{ zIndex, height }}
      >
        <div
          data-hook="page"
          className={classes.page}
          style={{
            minWidth: minWidth + 2 * parseInt(stVars.pageSidePadding, 10),
          }}
          ref={ref => (this.pageRef = ref)}
        >
          {this._renderScrollableContainer()}
        </div>
      </div>
    );
  }

  /**
   * Scrolls the page to a particular set of coordinates
   * @param {ScrollToOptions} scrollTo { left: number, top: number, behavior: 'smooth' | 'auto' }
   */
  scrollTo(scrollTo) {
    const scrollContainer = this._getScrollContainer();
    scrollContainer.scrollTo(scrollTo);
  }
}

const FixedContent = props => props.children;
FixedContent.displayName = 'Page.FixedContent';
FixedContent.propTypes = {
  children: PropTypes.element.isRequired,
};

Page.displayName = 'Page';
Page.Header = PageHeader;
Page.Section = PageSection;
Page.Content = Content;
Page.FixedContent = FixedContent; // TODO: deprecate, use Page.Sticky instead
Page.Tail = Tail;
Page.FixedFooter = FixedFooter;
Page.Sticky = PageSticky;

const allowedChildren = [
  Page.Header,
  Page.Section,
  Page.Content,
  Page.FixedContent,
  Page.Tail,
  Page.FixedFooter,
];

Page.propTypes = {
  /** Applied as data-hook HTML attribute that can be used in the tests */
  dataHook: PropTypes.string,
  /** Background image url of the header background */
  backgroundImageUrl: PropTypes.string,
  /** Sets the max width of the content (Both in header and body) NOT including the page padding */
  maxWidth: PropTypes.number,
  /** Sets the min width of the content (Both in header and body) NOT including the page padding */
  minWidth: PropTypes.number,
  /** Allow the page to scroll horizontally for large width content */
  horizontalScroll: PropTypes.bool,
  /** Sets the height of the page (in px/vh/etc.) */
  height: PropTypes.string,
  /** Sets padding of the sides of the page */
  sidePadding: PropTypes.number,
  /** A css class to be applied to the component's root element */
  className: PropTypes.string,
  /** Header background color class name, allows to add a gradient to the header */
  gradientClassName: PropTypes.string,
  /** Will be called with the Page's scrollable content ref after page mount.
   *
   * **Note** - If you need this ref just for listening to scroll events on the scrollable content then use the prop
   * `scrollProps = {onScrollChanged/onScrollAreaChanged}` instead according to your needs. **/
  scrollableContentRef: PropTypes.func,
  /** Props related to the scrollable content of the page.
   *
   * **onScrollAreaChanged** - A Handler for scroll area changes, will be triggered only when the user scrolls to a
   * different area of the scrollable content, see signature for possible areas
   * ##### Signature:
   * `function({area: {y: AreaY, x: AreaX}, target: HTMLElement}) => void`
   *
   * `AreaY`: top | middle | bottom | none
   *
   * `AreaX`: start | middle | end | none (not implemented yet)
   *
   * **onScrollAreaChanged** - A Generic Handler for scroll changes with throttling (100ms)
   * ##### Signature:
   * `function({target: HTMLElement}) => void`
   * */
  scrollProps: PropTypes.shape(ScrollableContainerCommonProps),

  /** Accepts these components as children: `Page.Header`, `Page.Tail`, `Page.Content`, `Page.FixedContent`. Order is insignificant. */
  children: PropTypes.arrayOf((children, key) => {
    const child = children[key];
    if (!child) {
      return;
    }

    const allowedDisplayNames = allowedChildren.map(c => c.displayName);
    const childDisplayName = child.type.displayName;
    if (!allowedDisplayNames.includes(childDisplayName)) {
      return new Error(
        `Page: Invalid Prop children, unknown child ${child.type}`,
      );
    }
  }).isRequired,

  /** z-index of the Page */
  zIndex: PropTypes.number,
};

function getChildrenObject(children) {
  return React.Children.toArray(children).reduce((acc, child) => {
    switch (child.type.displayName) {
      case 'Page.Header': {
        acc.PageHeader = child;
        break;
      }
      case 'Page.Section': {
        acc.Section = child;
        break;
      }
      case 'Page.Content': {
        acc.PageContent = child;
        break;
      }
      case 'Page.FixedContent': {
        acc.PageFixedContent = child;
        break;
      }
      case 'Page.Tail': {
        acc.PageTail = child;
        break;
      }
      case 'Page.FixedFooter': {
        acc.FixedFooter = child;
        break;
      }
      default: {
        break;
      }
    }
    return acc;
  }, {});
}

export default Page;
