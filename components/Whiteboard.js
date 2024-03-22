import React, { useState, useRef, useEffect, useReducer } from 'react';
import { Stage, Layer, Line, Text } from 'react-konva';

const initial_state = {
  history: {
    curHistory: 0,
    record:[],
  },
  lines: [],
}

const actionTypes = {
  setHistory: "setHistory",
  setLines: "setLines"
}

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.setHistory:
      var payload = action.payload;
      var newHistory = {
        curHistory: payload.curHistory,
        record: payload.record
      };

      return {
        ...state,
        history: newHistory,
      }
    case actionTypes.setLines:
      var payload = action.payload;
      var newLines = payload.newLines;

      return {
        ...state,
        lines: newLines,
      }
    default:
      alert("No matching action");
  }
}

const Whiteboard = () => {
  const [state, dispatch] = useReducer(reducer, initial_state);
  const stageRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [tool, setTool] = useState('pen');
  const isDrawing = useRef(false);

  useEffect(() => {
    const stage = stageRef.current.getStage(); // Get the Konva stage using the ref
    setWidth(window.innerWidth)
    setHeight(window.innerHeight)
    
    const handleMouseDown = (e) => {
      isDrawing.current = true;
      const pos = stage.getPointerPosition();
      dispatch({ type: actionTypes.setLines, payload: { newLines: [...state.lines, { tool, points: [pos.x, pos.y] }] } })
    };

    const handleMouseMove = (e) => {
      if (!isDrawing.current) {
        return;
      }
      const point = stage.getPointerPosition();
      let lastLine = state.lines[state.lines.length - 1];
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      // Update lines using functional state update to ensure latest state is used
      dispatch({ type: actionTypes.setLines, payload: { newLines: [...state.lines.slice(0, -1), lastLine] } })
    };

    const handleMouseUp = () => {
      isDrawing.current = false;
      const newHistoryRecord = [...state.history.record.slice(0, state.history.curHistory), state.lines];
      dispatch({ type: actionTypes.setHistory, payload: { curHistory: newHistoryRecord.length, record: newHistoryRecord } });
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
  }, [state.lines, tool, state.history]); // Dependency array includes lines and tool to ensure useEffect runs when they change
  
  const handleUndo = () => {
    if (state.history.record.length > 0) {
      const newLines = state.history.record[state.history.curHistory - 2];
      if(newLines !== undefined) {
        dispatch({type: actionTypes.setHistory, payload: {curHistory: state.history.curHistory - 1, record: state.history.record}});
        dispatch({ type: actionTypes.setLines, payload: { newLines: newLines } })
      } else {
        dispatch({type: actionTypes.setHistory, payload: {curHistory: 0, record: state.history.record}});
        dispatch({ type: actionTypes.setLines, payload: { newLines: [] } })
      }
    }
  };

  const handleRedo = () => {
    if (state.history.record.length > 0 && state.history.curHistory < state.history.record.length) {
      const newLines = state.history.record[state.history.curHistory];
      dispatch({ type: actionTypes.setHistory, payload: {curHistory: state.history.curHistory + 1, record: state.history.record } });
      dispatch({ type: actionTypes.setLines, payload: { newLines: newLines } })
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
      <span>{ state.history.curHistory }</span>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        style={{ border: '1px solid black'}}
      >
        <Layer>
          <Text text="Just start drawing" x={5} y={30} />
          {state.lines.map((line, i) => (
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