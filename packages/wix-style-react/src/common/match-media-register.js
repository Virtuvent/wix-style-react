export const register = () => {
  if (window && !window.matchMedia) {
    window.matchMedia = function() {
      return {
        matches: false,
        addListener: function() {},
        removeListener: function() {},
      };
    };
  }

  global.matchMedia = global.matchMedia || window.matchMedia;
};

const isTestEnv = process.env.NODE_ENV === 'test';

if (isTestEnv && typeof window !== 'undefined' && !window.matchMedia) {
  register();
}
