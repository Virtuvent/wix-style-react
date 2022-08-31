const createRangeOrig =
  typeof document === 'undefined' ? function() {} : document.createRange;

const install = () => {
  if (typeof document === 'undefined') {
    return;
  }
  if (!document.createRange) {
    document.createRange = () => {
      return (function() {
        const pub = {};
        pub.selectNodeContents = () => {};

        pub.setEnd = function(elem) {
          pub.commonAncestorContainer = elem;
        };

        pub.setStart = function(elem) {
          pub.commonAncestorContainer = elem;
        };

        pub.getBoundingClientRect = function() {
          return { right: 0 };
        };

        pub.getClientRects = () => [];

        return pub;
      })();
    };
  }
};

const uninstall = () => {
  document.createRange = createRangeOrig;
};

export default {
  install,
  uninstall,
};
