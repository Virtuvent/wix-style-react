import ReactTestUtils from 'react-dom/test-utils';
import {
  getInstanceOfDraggableProvider,
  getInstanceOfDraggableSource,
  getInstanceOfDraggableTarget,
} from './driverHelpers';

const sortableListFactory = ({ element, wrapper }) => {
  // in case if wrapper is coming from enzyme, we want to get it instance
  const vanillaWrapper = wrapper.instance ? wrapper.instance() : wrapper;
  const isCompositeComponent = ReactTestUtils.isCompositeComponent(
    vanillaWrapper,
  );

  if (!isCompositeComponent) {
    console.warn('SortableList factory expect to receive wrapper as composite component(react instance, and not a dom instance)'); // eslint-disable-line
  }
  const backend = isCompositeComponent
    ? getInstanceOfDraggableProvider(vanillaWrapper)
        .getManager()
        .getBackend()
    : null;

  return {
    exists: () => !!element,
    reorder: ({ removedId, addedId }) => {
      if (backend) {
        backend.simulateBeginDrag([
          getInstanceOfDraggableSource(
            vanillaWrapper,
            removedId,
          ).getHandlerId(),
        ]);
        backend.simulateHover([
          getInstanceOfDraggableTarget(vanillaWrapper, addedId).getHandlerId(),
        ]);
        backend.simulateDrop();
        backend.simulateEndDrag();
      }
    },
  };
};

export default sortableListFactory;
