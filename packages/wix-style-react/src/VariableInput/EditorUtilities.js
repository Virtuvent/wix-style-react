import React from 'react';
import {
  CompositeDecorator,
  convertToRaw,
  convertFromRaw,
  genKey,
  EditorState,
  SelectionState,
  Modifier,
} from 'draft-js';
import Tag from '../Tag';
import { entityTypes, dataHooks } from './constants';
import { classes } from './VariableInput.st.css';

/** Insert text in current cursor position */
const insertText = (editorState, text) => {
  const newContent = Modifier.insertText(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    text,
  );
  // update our state with the new editor content
  return EditorState.push(editorState, newContent, 'insert-characters');
};
/** Insert new entity in current cursor position, with the given text and value */
const insertEntity = (editorState, { text, value }) => {
  let contentState = editorState.getCurrentContent();
  let selectionState = editorState.getSelection();
  if (!selectionState.isCollapsed()) {
    // Remove selection range when adding a tag
    contentState = Modifier.removeRange(
      contentState,
      selectionState,
      'backward',
    );
    selectionState = contentState.getSelectionAfter();
  }
  contentState = contentState.createEntity(entityTypes.variable, 'IMMUTABLE', {
    value,
    text,
  });
  const entityKey = contentState.getLastCreatedEntityKey();
  contentState = Modifier.insertText(contentState, selectionState, ' '); // space after entity
  contentState = Modifier.insertText(
    contentState,
    selectionState,
    ` ${text} `,
    null,
    entityKey,
  );
  const newEditorState = EditorState.push(
    editorState,
    contentState,
    'insert-characters',
  );
  const newSelection = newEditorState.getSelection();
  return _moveSelectionTo(
    newEditorState,
    newSelection.getAnchorKey(),
    newSelection.getAnchorOffset() + 1,
  );
};
const _escapeRegExp = text => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
/** Get variable with given prefix and suffix in the given string */
const getMatchesInString = (str, prefix, suffix) => {
  const escPrefixFirstChar = _escapeRegExp(prefix[0]);
  const escPrefix = _escapeRegExp(prefix);
  const escSuffix = _escapeRegExp(suffix);
  const pattern = `(?:${escPrefixFirstChar})*(${escPrefix}(.*?)${escSuffix})`;
  const regex = new RegExp(pattern, 'g');

  let part;
  const parts = [];
  while ((part = regex.exec(str)) !== null) {
    parts.push(part);
  }

  return parts;
};
/** Check if editor has unparsed entities */
const hasUnparsedEntity = (editorState, prefix, suffix) => {
  return (
    getMatchesInString(
      editorState.getCurrentContent().getPlainText(),
      prefix,
      suffix,
    ).length > 0
  );
};
/** Convert editor content state, to string with placeholders instead of entities */
const convertToString = ({ editorState, prefix, suffix }) => {
  const rawJS = convertToRaw(editorState.getCurrentContent());
  const rawString = rawJS.blocks
    .map(block => {
      const baseString = Array.from(block.text);
      let indexOffset = 0;

      block.entityRanges.forEach(entityRange => {
        const entity = rawJS.entityMap[entityRange.key.toString()].data;
        const placeholder = prefix + entity.value + suffix;
        baseString.splice(
          entityRange.offset + indexOffset,
          entityRange.length,
          placeholder,
        );
        indexOffset += 1 - entityRange.length;
      });
      return baseString.join('');
    })
    .join('\n');

  return rawString;
};
/** Convert string to editor content state */
const stringToContentState = ({
  str = '',
  variableParser = () => {},
  prefix = '',
  suffix = '',
}) => {
  let entityIndex = 0;
  const entityMap = [];
  const blocks = str.split('\n').map(row => {
    let rowStr = row;
    let indexOffset = 0;
    const entityRanges = [];

    getMatchesInString(row, prefix, suffix).forEach(match => {
      const [wholeMatch, placeholder, value] = match;
      const matchIndex = match.index + wholeMatch.indexOf(placeholder);
      const text = variableParser(value) || false;

      if (text) {
        const utfOffset = getUtfOffsetValue(row.substr(0, matchIndex));
        const contentPlaceholder = ` ${text} `;
        const offset = matchIndex + indexOffset - utfOffset;

        rowStr = rowStr.replace(placeholder, contentPlaceholder);
        entityRanges.push({
          offset,
          length: contentPlaceholder.length,
          key: entityIndex,
        });
        entityMap[entityIndex.toString()] = {
          type: entityTypes.variable,
          mutability: 'IMMUTABLE',
          data: { value, text },
        };
        entityIndex++;
        indexOffset += contentPlaceholder.length - placeholder.length;
      }
    });

    return {
      key: genKey(),
      text: rowStr,
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: entityRanges,
      data: {},
    };
  });

  return convertFromRaw({
    blocks,
    entityMap,
  });
};
const decoratorFactory = ({ tag: { size, disabled } }) => {
  return new CompositeDecorator([
    {
      strategy: (contentBlock, callback) => {
        contentBlock.findEntityRanges(character => {
          const entityKey = character.getEntity();
          return entityKey === null;
        }, callback);
      },
      component: ({ offsetKey, children }) => {
        return (
          <span data-offset-key={offsetKey} className={classes.textWrapper}>
            {children}
          </span>
        );
      },
    },
    {
      strategy: (contentBlock, callback, contentState) => {
        contentBlock.findEntityRanges(character => {
          const entityKey = character.getEntity();
          return (
            entityKey !== null &&
            contentState.getEntity(entityKey).getType() === entityTypes.variable
          );
        }, callback);
      },
      component: props => {
        const { offsetKey, contentState, entityKey } = props;
        const { text } = contentState.getEntity(entityKey).getData();
        /** We adding a space before and after the Tag,
         * to prevent from the cursor to enter the Tag while moving it.  */
        return (
          <span
            data-offset-key={offsetKey}
            contentEditable={false}
            className={classes.tagWrapper}
          >
            <span className={classes.textWrapper}> </span>
            <Tag
              id={`variableinput-tag-${entityKey}`}
              dataHook={dataHooks.tag}
              removable={false}
              size={size}
              disabled={disabled}
              {...(!disabled && { theme: 'dark' })}
            >
              {text}
            </Tag>
            <span className={classes.textWrapper} />{' '}
          </span>
        );
      },
    },
  ]);
};
/** When pushing content to EditorState selection is resets, we keep the selection and reset it after push */
const pushAndKeepSelection = ({ editorState, content }) => {
  const selectionStateBefore = editorState.getSelection();
  const blockIndex = Object.keys(
    editorState
      .getCurrentContent()
      .getBlockMap()
      .toJS(),
  ).indexOf(selectionStateBefore.getAnchorKey());

  const updatedEditorState = EditorState.push(editorState, content);
  const blockMap = updatedEditorState
    .getCurrentContent()
    .getBlockMap()
    .toJS();
  const blockKeys = Object.keys(blockMap);
  const blockKey = blockKeys[blockIndex];
  const blockOffset = selectionStateBefore.getAnchorOffset();
  if (!blockKey || blockOffset > blockMap[blockKey].text.length) {
    // Block not exists in new array, getting the last block and move to end
    return EditorState.moveSelectionToEnd(updatedEditorState);
  }
  // Keep selection in the same location after updating content, keys are updating
  const selectionAfter = updatedEditorState.getSelection().merge({
    anchorKey: blockKey,
    anchorOffset: blockOffset,
    focusKey: blockKey,
    focusOffset: blockOffset,
    hasFocus: false,
  });
  return EditorState.acceptSelection(updatedEditorState, selectionAfter);
};
/** Move selection to edge of entity */
const moveToEdge = (editorState, forceEnd = false) => {
  const selectionOffset = editorState.getSelection().getFocusOffset();
  const key = editorState.getSelection().getFocusKey();
  const jumpToIndex = _findEntityEdgeIndex(
    editorState.getCurrentContent(),
    key,
    selectionOffset,
    forceEnd,
  );
  if (jumpToIndex !== selectionOffset) {
    return _moveSelectionTo(editorState, key, jumpToIndex);
  }
  return editorState;
};
const _moveSelectionTo = (editorState, key, offset) => {
  const selection = new SelectionState({
    anchorKey: key,
    anchorOffset: offset,
    focusKey: key,
    focusOffset: offset,
  });
  return EditorState.forceSelection(editorState, selection);
};
const _findEntityEdgeIndex = (
  currentContent,
  selectionKey,
  startIndex,
  forceEnd,
) => {
  const characterList = currentContent
    .getBlockForKey(selectionKey)
    .getCharacterList()
    .toJS();
  const entityKey =
    characterList[startIndex] && characterList[startIndex].entity;
  if (!entityKey) {
    return startIndex;
  }
  let beforeOffset = startIndex;
  for (; beforeOffset >= 0; beforeOffset--) {
    if (characterList[beforeOffset].entity !== entityKey) {
      beforeOffset++;
      break;
    }
  }
  beforeOffset = Math.max(beforeOffset, 0);
  let afterOffset = characterList.findIndex(
    (value, index) => index >= startIndex && value.entity !== entityKey,
  );
  if (afterOffset === -1) {
    afterOffset = characterList.length;
  }
  if (!forceEnd && beforeOffset === startIndex) {
    // In case we clicked just at the beginning
    return beforeOffset;
  }
  return afterOffset;
};
/** Returns true if content has changed */
const isContentChanged = (editorStateBefore, editorStateAfter) =>
  editorStateBefore.getCurrentContent().getPlainText() !==
  editorStateAfter.getCurrentContent().getPlainText();
/** Returns true if state lost focus */
const isBlured = (editorStateBefore, editorStateAfter) =>
  editorStateBefore.getSelection().getHasFocus() &&
  !editorStateAfter.getSelection().getHasFocus();

const getUtfOffsetValue = aString =>
  aString.split('').length - Array.from(aString).length;

export default {
  insertText,
  insertEntity,
  getMatchesInString,
  convertToString,
  stringToContentState,
  decoratorFactory,
  pushAndKeepSelection,
  hasUnparsedEntity,
  moveToEdge,
  isContentChanged,
  isBlured,
};
