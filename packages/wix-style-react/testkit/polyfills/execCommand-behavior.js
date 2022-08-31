const originalExecCommand =
  typeof document === 'undefined' ? function() {} : document.execCommand;

const install = () => {
  if (typeof document === 'undefined') {
    return;
  }

  document.execCommand = () => {};
};

const uninstall = () => {
  document.execCommand = originalExecCommand;
};

export default {
  install,
  uninstall,
};
