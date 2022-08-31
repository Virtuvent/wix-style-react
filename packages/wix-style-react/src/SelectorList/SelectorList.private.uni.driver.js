import { selectorListUniDriverFactory } from './SelectorList.uni.driver';
import { loaderUniDriverFactory } from '../Loader/Loader.uni.driver';
import { searchUniDriverFactory } from '../Search/Search.uni.driver';
import { selectorUniDriverFactory } from '../Selector/Selector.uni.driver';
import { dataHooks } from './SelectorList.helpers';

export const SelectorListPrivateUniDriverFactory = (base, body) => {
  const mainLoaderDriver = loaderUniDriverFactory(
    base.$(`[data-hook="${dataHooks.mainLoader}"]`),
    body,
  );
  const nextPageLoaderDriver = loaderUniDriverFactory(
    base.$(`[data-hook="${dataHooks.nextPageLoader}"]`),
    body,
  );
  const searchDriver = searchUniDriverFactory(
    base.$(`[data-hook="${dataHooks.search}"]`),
    body,
  );
  const findInListByDataHook = dataHook => base.$(`[data-hook="${dataHook}"]`);
  const getList = () => findInListByDataHook(dataHooks.list);
  const getSelectors = () =>
    getList().$$(`[data-hook="${dataHooks.selector}"]`);
  const selectorDriverAt = i => selectorUniDriverFactory(getSelectors().get(i));

  return {
    ...selectorListUniDriverFactory(base, body),
    isMainLoaderMedium: mainLoaderDriver.isMedium,
    isNextPageLoaderSmall: nextPageLoaderDriver.isSmall,
    getSearchPlaceholder: searchDriver.inputDriver.getPlaceholder,
    getSelectorToggleTypeAt: i => selectorDriverAt(i).toggleType(),
    getSelectorTitleAt: i =>
      selectorDriverAt(i)
        .titleTextDriver()
        .getText(),
    getSelectorSubtitleAt: i =>
      selectorDriverAt(i)
        .subtitleTextDriver()
        .getText(),
    getSelectorExtraNodeAt: i => selectorDriverAt(i).getExtraNode(),
    getSelectorImageAt: i => selectorDriverAt(i).getImage(),
    isSelectorImageTinyAt: i => selectorDriverAt(i).isImageTiny(),
    isSelectorImageSmallAt: i => selectorDriverAt(i).isImageSmall(),
    isSelectorImagePortraitAt: i => selectorDriverAt(i).isImagePortrait(),
    isSelectorImageLargeAt: i => selectorDriverAt(i).isImageLarge(),
    isSelectorImageCinemaAt: i => selectorDriverAt(i).isImageCinema(),
    isSelectorImageCircleAt: i => selectorDriverAt(i).isImageCircle(),
    isSelectorImageRectangularAt: i => selectorDriverAt(i).isImageRectangular(),
  };
};
