import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Text } from 'react-konva';

const Whiteboard = () => {
  const stageRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [tool, setTool] = useState('pen');
  const [lines, setLines] = useState([]);
  const [history, setHistory] = useState({curHistory:0 , record:[]});
  const isDrawing = useRef(false);

  useEffect(() => {
    const stage = stageRef.current.getStage(); // Get the Konva stage using the ref
    setWidth(window.innerWidth)
    setHeight(window.innerHeight)
    
    const handleMouseDown = (e) => {
      isDrawing.current = true;
      const pos = stage.getPointerPosition();
      setLines([...lines, { tool, points: [pos.x, pos.y] }]);
    };

    const handleMouseMove = (e) => {
      if (!isDrawing.current) {
        return;
      }
      const point = stage.getPointerPosition();
      let lastLine = lines[lines.length - 1];
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      // Update lines using functional state update to ensure latest state is used
      setLines(prevLines => {
        const newLines = prevLines.slice(0, -1);
        return [...newLines, lastLine];
      });
    };

    const handleMouseUp = () => {
      isDrawing.current = false;
      const newHistoryRecord = [...history.record.slice(0, history.curHistory), lines];
      setHistory({curHistory: newHistoryRecord.length, record: newHistoryRecord});
    };

    // Adding event listeners
    stage.on('mousedown touchstart', handleMouseDown);
    stage.on('mousemove touchmove', handleMouseMove);
    stage.on('mouseup touchend', handleMouseUp);

    // Cleanup function to remove event listeners
    return () => {
      stage.off('mousedown touchstart', handleMouseDown);
      stage.off('mousemove touchmove', handleMouseMove);
      stage.off('mouseup touchend', handleMouseUp);
    };
  }, [lines, tool, history]); // Dependency array includes lines and tool to ensure useEffect runs when they change
  
  const handleUndo = () => {
    if (history.record.length > 0) {
      console.log("undo")
      const newlines = history.record[history.curHistory - 2];
      if(newlines !== undefined) {
        setHistory({curHistory: history.curHistory - 1, record: history.record})
        setLines(newlines);
      } else {
        setHistory({curHistory: 0, record: history.record})
        setLines([])
      }
    }
  };

  const handleRedo = () => {
    if (history.record.length > 0 && history.curHistory < history.record.length) {
      console.log("redo")
      const newLines = history.record[history.curHistory];
      setHistory({curHistory: history.curHistory + 1, record: history.record})
      setLines(newLines);
    }
  };

  return (
    <div id="root" style={{ border: '1px solid black' }}>
      <select
        value={tool}
        onChange={(e) => {
          setTool(e.target.value);
        }}
      >
        <option value="pen">Pen</option>
        <option value="eraser">Eraser</option>
      </select>
      <button onClick={handleUndo}>undo</button>
      <button onClick={handleRedo}>redo</button>
      <span>{ history.curHistory }</span>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        style={{ border: '1px solid black'}}
      >
        <Layer>
          <Text text="Just start drawing" x={5} y={30} />
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="black"
              strokeWidth={5}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === 'eraser' ? 'destination-out' : 'source-over'
              }
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Whiteboard;