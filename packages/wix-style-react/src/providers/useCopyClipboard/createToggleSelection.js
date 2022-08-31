/**
 * @return {{unselectPrevious: Function, selectPrevious: Function}} returns an object with functions that can be used to unselect current and reselect previous selection
 */
export const createToggleSelection = () => {
  const unselectCurrent = () => {
    const activeTagName = activeElement.tagName.toUpperCase();
    if (activeTagName === 'INPUT' || activeTagName === 'TEXTAREA') {
      activeElement.blur();
    } else {
      activeElement = null;
    }
    selectionObject.removeAllRanges();
  };

  const selectPrevious = () => {
    selectionObject.removeAllRanges();
    ranges.forEach(function(range) {
      selectionObject.addRange(range);
    });
    activeElement && activeElement.focus();
  };

  const selectionObject = window.getSelection();
  let activeElement = document.activeElement;
  const ranges = [];
  for (let i = 0; i < selectionObject.rangeCount; i++) {
    ranges.push(selectionObject.getRangeAt(i));
  }

  return {
    unselectCurrent,
    selectPrevious,
  };
};
