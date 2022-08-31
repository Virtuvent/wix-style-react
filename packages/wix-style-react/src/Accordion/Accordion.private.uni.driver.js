import publicDriverFactory from './Accordion.uni.driver';
import { getItemAt } from './utils';
import { dataHooks } from './constants';

export const accordionPrivateDriverFactory = (base, body) => ({
  ...publicDriverFactory(base, body),

  getAmountOfItems: async () =>
    base.$$(`[data-hook="${dataHooks.item}"]`).count(),
  hoverOnItem: async idx =>
    await getItemAt(idx, base)
      .$('[data-hook="header"]')
      .hover(),
});
