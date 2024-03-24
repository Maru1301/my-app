import React, { useState, useRef, useEffect, useReducer } from 'react';
import { Stage, Layer, Line, Text, Image, Transformer } from 'react-konva';
import  Rectangle  from './Rectangle.js';
import URLImage from './Image.js';

const initialRectangles = [
  {
    x: 10,
    y: 10,
    width: 100,
    height: 100,
    stroke: 'black',
    strokeWidth: 5,
    id: 'rect1',
  },
  {
    x: 150,
    y: 150,
    width: 100,
    height: 100,
    fill: 'green',
    id: 'rect2',
  },
];

const ToolButton = ({ tool, value, onClick, activeColor = 'red', inactiveColor = 'black' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        color: tool === value ? activeColor : inactiveColor,
        cursor: 'pointer', // Ensure consistent cursor for buttons
      }}
    >
      {value}
    </button>
  );
};

const tools = ['pen', 'eraser', 'text', 'cursor', 'hand'];

const Whiteboard = () => {
  const stageRef = useRef(null);
  const [items, setItems] = useState([]);
  const [itemsHistory, setItemsHistory] = useState([]);
  const [historyPointer, setHistoryPointer] = useState(0);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [tool, setTool] = useState('pen');
  const isDrawing = useRef(false);
  const dragUrl = useRef();
  const [image, setImage] = useState();
  const textAreaRef = useRef(null);

  const [rectangles, setRectangles] = React.useState(initialRectangles);
  const [selectedId, selectShape] = React.useState(null);

  const [texts, setTexts] = useState([]);
  const [text, setText] = useState();

  const checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  useEffect(() => {
    const stage = stageRef.current.getStage(); // Get the Konva stage using the ref
    setWidth(window.innerWidth)
    setHeight(window.innerHeight)
    
    const handleMouseDown = (e) => {
      if (tool == 'text') {
        const pos = stage.getPointerPosition();
        const adjustedPoint = getAdjustedPoint(pos);
        const newText = {
          id: 1,
          content: 'Some text here',
          x: adjustedPoint.x,
          y: adjustedPoint.y,
          fontSize: 20,
        };
        setTexts([...texts, newText]);
      }
      if (tool == "cursor") {
        checkDeselect(e);
        return;
      }
      if (tool != "pen" && tool != "eraser") return;

      isDrawing.current = true;
      const pos = stage.getPointerPosition();
      const adjustedPoint = getAdjustedPoint(pos);
      var newItems = [...itemsHistory, { tool, points: [adjustedPoint.x, adjustedPoint.y], key: historyPointer }];
      setItems(newItems);
      setItemsHistory(newItems);
      setHistoryPointer(historyPointer+1);
    };

    const handleMouseMove = (e) => {
      if (!isDrawing.current) {
        return;
      }
      const pos = stage.getPointerPosition();
      const adjustedPoint = getAdjustedPoint(pos);
      let lastLine = items[items.length - 1];
      lastLine.points = lastLine.points.concat([adjustedPoint.x, adjustedPoint.y]);
      // Update lines using functional state update to ensure latest state is used
      setItems([...items.slice(0, -1), lastLine]);
    };

    const handleMouseUp = () => {
      isDrawing.current = false;
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
  }, [tool, items, historyPointer, texts]); // Dependency array includes lines and tool to ensure useEffect runs when they change
  
  const handleUndo = () => {
    if (historyPointer > 0) {
      setHistoryPointer(historyPointer-1);
      setItemsHistory([...items.slice(0, historyPointer-1)])
    }
  };

  const handleRedo = () => {
    if(historyPointer < items.length){
      setHistoryPointer(historyPointer+1);
      setItemsHistory([...items.slice(0, historyPointer+1)])
    }
  };

  const addImage = (e) => {
    e.preventDefault();
    // register event position
    stageRef.current.setPointersPositions(e);
    const pos = stageRef.current.getPointerPosition(e);
    const adjustedPoint = getAdjustedPoint(pos);
    // add image to items
    var newImage = {
      id: historyPointer,
      tool: 'image',
      key: historyPointer,
      type: 'image',
      ...adjustedPoint,
      src: dragUrl.current,
    };
    var newItems = [...itemsHistory, newImage];
    setItems(newItems);
    setItemsHistory(newItems);
    setHistoryPointer(historyPointer+1);
  }

  const getAdjustedPoint = (pos) => {
    const adjustedPoint = {
      x: pos.x - stagePos.x,
      y: pos.y - stagePos.y,
    };
    return adjustedPoint;
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
  
    reader.onload = (e) => {
      setImage(e.target.result)
    };
    
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const render = (object) => {
    switch (object.tool) {
      case 'pen':
      case 'eraser':
        return (
          <Line
            key={object.key}
            points={object.points}
            stroke="black"
            strokeWidth={5}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            globalCompositeOperation={
              object.tool === 'eraser' ? 'destination-out' : 'source-over'
            }
            draggable
          />
        );
      case 'image':
        return (
          <URLImage 
            imageProps={object}
            isSelected={tool=="cursor" && object.id === selectedId}
            onSelect={() => {
              console.log(object.id)
              selectShape(object.id);
            }}
            onChange={(newAttrs) => {
              const newItems = items.slice();
              newItems[object.id] = newAttrs;
              setItems(newItems);
            }}
            draggable={tool=="cursor"}
          />
        );
      default:
        return <></>
    }
  }

  const handleDoubleClick = (e) => {
    console.log(e.target.attrs)
    textAreaRef.value = e.target.attrs.text;
    // textAreaRef.current.style.top = `${e.evt.y + stagePos.y}px`;
    // textAreaRef.current.style.left = `${e.evt.x + stagePos.x}px`;
    textAreaRef.current.focus(); // Focus on text input
  };

  const handleChange = (e) => {
    
  };

  return (
    <div 
      onDrop={addImage}
      onDragOver={(e) => e.preventDefault()}
    >
      {tools.map((tooltext) => {
        return (
          <ToolButton
            tool={tool}
            value={tooltext}
            label={tooltext}
            onClick={() => {
              selectShape(null);
              setTool(tooltext)}
            }
          ></ToolButton>
        )
      })}
      <button onClick={handleUndo}>undo</button>
      <button onClick={handleRedo}>redo</button>
      <br />
      <span>items: { items.length } </span>
      <span>historyPointer: { historyPointer }</span>
      <br />
      <img
        width={100}
        height={100}
        src={image}
        draggable="true"
        onDragStart={(e) => {
          dragUrl.current = e.target.src;
        }}
      />
      <input type="file" onChange={handleImageUpload} />
      <Stage
        ref={stageRef}
        x={stagePos.x}
        y={stagePos.y}
        width={width}
        height={height}
        style={{ border: '1px solid black'}}
        draggable={tool=="hand"}
        onDragEnd={e => {
          setStagePos(e.currentTarget.position());
        }}
      >
        <Layer>
          {texts.map((text) => {
            return (
              <Text
                text={text.content}
                x={text.x}
                y={text.y}
                fontSize={text.fontSize}
                onDblClick={ handleDoubleClick }
              />
            )
          })}
          <textarea></textarea>
          {items.slice(0, historyPointer).map((line) => {
            return  render(line);
          })}
          {rectangles.map((rect, i) => {
            return (
              <Rectangle
                key={i}
                shapeProps={rect}
                isSelected={rect.id === selectedId}
                onSelect={() => {
                  selectShape(rect.id);
                }}
                onChange={(newAttrs) => {
                  const rects = rectangles.slice();
                  rects[i] = newAttrs;
                  setRectangles(rects);
                }}
              />
            );
          })}
        </Layer>
      </Stage>
      <textarea ref={textAreaRef} value={textAreaRef.value} onChange={handleChange} style={{ /*display: 'none'*/ }} />
    </div>
  );
};

export default Whiteboard;