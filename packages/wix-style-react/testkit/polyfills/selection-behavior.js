const originalGetSelection =
  typeof window === 'undefined' ? function() {} : window.getSelection;

const install = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.getSelection = () => {
    return {
      addRange: () => {},
      removeAllRanges: () => {},
    };
  };
};

const uninstall = () => {
  window.getSelection = originalGetSelection;
};

export default {
  install,
  uninstall,
};
