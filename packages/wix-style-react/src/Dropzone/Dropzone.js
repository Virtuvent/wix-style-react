import React from 'react';
import PropTypes from 'prop-types';
import { buildChildrenObject } from 'wix-ui-core/dist/src/utils';
import { dataHooks } from './constants';
import { st, classes } from './Dropzone.st.css';

/** Defines a region in the page where files can be dropped */
class Dropzone extends React.PureComponent {
  state = {
    isDragActive: false,
  };

  static displayName = 'Dropzone';

  static propTypes = {
    /** Applied as data-hook HTML attribute that can be used for testing purposes. */
    dataHook: PropTypes.string,

    /** A class to be appended to the root dropzone element. */
    className: PropTypes.string,

    /** An event handler for files dropped over the dropzone. The dropped files are supplied as an argument to the function. */
    onDrop: PropTypes.func.isRequired,

    /** Either `<Dropzone.Overlay />` or `<Dropzone.Content />` components. */
    children: (props, propName) => {
      const childrenArr = React.Children.toArray(props[propName]);
      const childrenObj = buildChildrenObject(childrenArr, {
        Overlay: null,
        Content: null,
      });

      if (!childrenObj.Content) {
        return new Error(
          'Invalid children provided, <Dropzone.Content /> must be provided',
        );
      }

      if (!childrenObj.Overlay) {
        return new Error(
          'Invalid children provided, <Dropzone.Overlay /> must be provided',
        );
      }

      return childrenArr.reduce((err, child) => {
        if (
          !err &&
          child.type.displayName !== 'Dropzone.Content' &&
          child.type.displayName !== 'Dropzone.Overlay'
        ) {
          return new Error(
            `Invalid children provided, unknown child <${child.type
              .displayName || child.type} /> supplied`,
          );
        }

        return err;
      }, false);
    },
  };

  /**
   * An overlay element to be displayed during a drag over the content
   */
  static Overlay = ({ children }) => (
    <div
      data-hook={dataHooks.dropzoneOverlay}
      className={classes.dropzoneOverlay}
    >
      {children}
    </div>
  );

  /**
   * An content element on which a file can be dragged over
   */
  static Content = ({ children }) => (
    <div data-hook={dataHooks.dropzoneContent}>{children}</div>
  );

  static _overrideEventDefaults = event => {
    event.preventDefault();
    event.stopPropagation();
  };

  /** https://spin.atomicobject.com/2018/09/13/file-uploader-react-typescript/ */
  _dragEventCounter = 0;

  _eventHasFiles = event => {
    /** DataTransfer object is defined here: https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer */
    return event.dataTransfer
      ? Array.from(event.dataTransfer.items).some(item => {
          return item.kind === 'file';
        })
      : !!(event.target && event.target.files);
  };

  _onDragEnter = event => {
    Dropzone._overrideEventDefaults(event);
    this._dragEventCounter++;

    /** We only want to show the overlay when files are dragged over the dropzone */
    return this._eventHasFiles(event) && this.setState({ isDragActive: true });
  };

  _onDragLeave = event => {
    Dropzone._overrideEventDefaults(event);
    this._dragEventCounter--;

    return (
      this._dragEventCounter === 0 && this.setState({ isDragActive: false })
    );
  };

  _onDrop = event => {
    Dropzone._overrideEventDefaults(event);
    this._dragEventCounter = 0;

    if (this._eventHasFiles(event)) {
      const files = event.dataTransfer
        ? Array.from(event.dataTransfer.items).map(item => item.getAsFile())
        : event.target.files;
      this.setState({ isDragActive: false });
      return this.props.onDrop(files);
    }
  };

  render() {
    const { children, dataHook, className } = this.props;
    const { isDragActive } = this.state;

    const childrenObj = buildChildrenObject(children, {
      Content: null,
      Overlay: null,
    });

    return (
      <div
        data-hook={dataHook}
        className={st(classes.root, className)}
        onDrop={this._onDrop}
        onDragEnter={this._onDragEnter}
        onDragLeave={this._onDragLeave}
        onDragOver={Dropzone._overrideEventDefaults}
      >
        {isDragActive && childrenObj.Overlay}
        {childrenObj.Content}
      </div>
    );
  }
}

Dropzone.Content.displayName = 'Dropzone.Content';
Dropzone.Overlay.displayName = 'Dropzone.Overlay';

export default Dropzone;
