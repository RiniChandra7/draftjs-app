import { DefaultDraftBlockRenderMap } from 'draft-js';
import Immutable from 'immutable';

const blockRenderMap = Immutable.Map({
  'code-block': {
    element: 'div',
    wrapper: <div className="code-block" />
  }
});

export const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);
