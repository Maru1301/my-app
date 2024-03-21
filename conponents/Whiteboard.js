import React from 'react';
import Konva from 'konva';

const Whiteboard = () => {
  // 創建一個新的 Konva Stage
  const stage = new Konva.Stage({
    container: 'whiteboard',
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // 創建一個新的 Konva Layer
  const layer = new Konva.Layer();

  // 將 Layer 添加到 Stage
  stage.add(layer);

  // 渲染 Whiteboard 組件
  return (
    <div id="whiteboard" />
  );
};

export default Whiteboard;