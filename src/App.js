import React, { useState, useEffect, useRef } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, Modifier } from 'draft-js';
import 'draft-js/dist/Draft.css';
import './App.css';
import { extendedBlockRenderMap } from './BlockRenderMap';

const App = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const previousStyle = useRef(null);

  const INLINE_STYLES = ['BOLD', 'UNDERLINE', 'RED'];

  useEffect(() => {
    const savedData = localStorage.getItem('editorContent');
    if (savedData) {
      const contentState = convertFromRaw(JSON.parse(savedData));
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, []);

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const handleBeforeInput = (chars, editorState) => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    const block = currentContent.getBlockForKey(blockKey);
    const blockText = block.getText();

    if (blockText + chars === '# ' || blockText + chars === '* ' || blockText + chars === '** ' || blockText + chars === '*** ' || blockText + chars === '``` ') {
      const newEditorState = applySpecialFormatting(editorState, blockText + chars);
      if (newEditorState) {
        setEditorState(newEditorState);
        return 'handled';
      }
    }

    return 'not-handled';
  };

  const applySpecialFormatting = (editorState, text) => {
    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const blockKey = selection.getStartKey();

    const newContent = Modifier.removeRange(
      currentContent,
      selection.merge({
        anchorOffset: 0,
        focusOffset: text.length,
      }),
      'backward'
    );

    let newEditorState = EditorState.push(editorState, newContent, 'remove-range');

    INLINE_STYLES.forEach(style => {
      if (style == previousStyle.current)
        newEditorState = RichUtils.toggleInlineStyle(newEditorState, style);
    });

    if ('header-one' == previousStyle.current) {
      newEditorState = RichUtils.toggleBlockType(newEditorState, 'header-one');
    }

    if ('code-block' == previousStyle.current) {
      newEditorState = RichUtils.toggleBlockType(newEditorState, 'code-block');
    }

    if (text === '# ') {
      previousStyle.current = 'header-one';
      newEditorState = RichUtils.toggleBlockType(newEditorState, 'header-one');
    } else if (text === '* ') {
      previousStyle.current = 'BOLD';
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, 'BOLD');
    } else if (text === '** ') {
      previousStyle.current = 'RED';
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, 'RED');
    } else if (text === '*** ') {
      previousStyle.current = 'UNDERLINE';
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, 'UNDERLINE');
    } else if (text === '``` ') {
      previousStyle.current = 'code-block';
      newEditorState = RichUtils.toggleBlockType(newEditorState, 'code-block');
    }

    return newEditorState;
  };

  const handleSave = () => {
    const content = editorState.getCurrentContent();
    const rawContent = JSON.stringify(convertToRaw(content));
    localStorage.setItem('editorContent', rawContent);
  };

  const styleMap = {
    RED: {
      color: 'red',
    },
    UNDERLINE: {
      textDecoration: 'underline',
    },
  };

  return (
    <div className="app-container">
      <div className='editor-title'>
        <em>Demo Editor by Rini Chandra</em>
        <button onClick={handleSave} className='save-btn'>Save</button>
      </div>
      <div className="editor-container">
        <Editor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={handleBeforeInput}
          onChange={setEditorState}
          customStyleMap={styleMap}
          blockRenderMap={extendedBlockRenderMap}
        />
      </div>
    </div>
  );
}

export default App;
