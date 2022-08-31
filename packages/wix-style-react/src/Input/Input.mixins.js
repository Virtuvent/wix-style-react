module.exports = {
  // Applies the same box-sizing on all content and root
  boxSizingMixin: function(boxSizing) {
    return {
      boxSizing: boxSizing,
      '*': {
        boxSizing: boxSizing,
      },
    };
  },

  // Sets color of an input placeholder
  placeholderMixin: function(color) {
    return {
      '&::-webkit-input-placeholder': {
        color,
      },
      '&:-moz-placeholder': {
        color,
      },
      '&::-moz-placeholder': {
        color,
      },
      '&:-ms-input-placeholder': {
        color: `${color} !important`,
      },
    };
  },

  // Sets the border radius
  borderRadiusMixin: function(borderRadius) {
    return {
      borderRadius,
      '&:-webkit-autofill': {
        borderRadius,
      },
    };
  },
};
