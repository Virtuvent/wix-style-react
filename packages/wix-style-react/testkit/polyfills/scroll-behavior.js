const originalScrollTo =
  typeof window === 'undefined' ? function() {} : window.scrollTo;

const install = () => {
  if (typeof window === 'undefined') {
    return;
  }

  // TODO: Apply a polyfill instead of stubbing the function
  window.scrollTo = () => {};
};

const uninstall = () => {
  window.scrollTo = originalScrollTo;
};

export default {
  install,
  uninstall,
};
