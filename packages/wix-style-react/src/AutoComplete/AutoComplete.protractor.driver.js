const autoCompleteDriverFactory = component => ({
  click: () => component.click(),
  getInput: () => component.$(`input`),
  getDropdown: () => component.$(`[data-hook="dropdown-layout-options"]`),
  getDropdownItem: index =>
    component
      .$$(`[data-hook="dropdown-layout-options"] div`)
      .get(index)
      .getText(),
  getDropdownItemsCount: () =>
    component
      .$$(`[data-hook="dropdown-layout-options"] div`)
      .getText()
      .count(),
  element: () => component,
});

export default autoCompleteDriverFactory;
