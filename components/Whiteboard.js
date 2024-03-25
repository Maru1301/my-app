import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Ellipse } from 'react-konva';
import ResizableLine from './Line.js';
import Rectangle  from './Rectangle.js';
import URLImage from './Image.js';
import Text from './Text.js';
import ResizableCircle from './Circle.js'

const ToolButton = ({ key, tool, value, onClick, activeColor = 'red', inactiveColor = 'black' }) => {
  return (
    <button
      //key={key}
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

const tools = ['pen', /*'eraser'*/, 'line', 'rectangle', 'circle', 'text', 'cursor', 'hand'];

const rectInitialState={
  id: 'rect',
  tool: 'rectangle',
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  stroke: 'black',
  strokeWidth: 5,
  visible: false,
};

const circleInitialState={
  id: 'circle',
  tool: 'circle',
  x: 0,
  y: 0,
  radius: { x: 0, y: 0 },
  stroke: 'black',
  strokeWidth: 5,
  visible: false,
}

const Whiteboard = () => {
  const stageRef = useRef(null);
  const [scale, setScale] = useState(1);
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

  const [selectedId, selectShape] = React.useState(null);
  const [rect, setRect] = useState(rectInitialState);
  const [circle, setCircle] = useState(circleInitialState);

  const [texts, setTexts] = useState([]);
  const [textId, setTextId] = useState(0);
  const [selectedTextIndex, setSelectedTextIndex] = useState();

  const checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
      setSelectedTextIndex(null);
    }
  };

  useEffect(() => {
    const stage = stageRef.current.getStage(); // Get the Konva stage using the ref
    const container = stage.attrs.container;
    container.tabIndex = 1;
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
    
    const handleMouseDown = (e) => {
      const pos = stage.getPointerPosition();
      const adjustedPoint = getAdjustedPoint(pos);
      switch (tool) {
        case 'text':
          const newText = {
            id: textId,
            content: 'Start typing',
            x: adjustedPoint.x,
            y: adjustedPoint.y,
            fontSize: 20,
          };
          setTexts([...texts, newText]);
          setSelectedTextIndex(textId);
          setTextId(textId+1);
          selectShape(null);
          return;
        case 'cursor':
          checkDeselect(e);
          return;
        case 'pen':
        case 'eraser':
          isDrawing.current = true;
          var newItems = [...itemsHistory, { tool, points: [adjustedPoint.x, adjustedPoint.y], id: historyPointer }];
          setItems(newItems);
          setItemsHistory(newItems);
          setHistoryPointer(historyPointer+1);
          return;
        case 'line':
          isDrawing.current = true;
          var newItems = [...itemsHistory, { tool, points: [adjustedPoint.x, adjustedPoint.y], id: historyPointer }];
          setItems(newItems);
          setItemsHistory(newItems);
          setHistoryPointer(historyPointer+1);
          return;
        case 'rectangle':
          isDrawing.current = true;
          const newRect = JSON.parse(JSON.stringify(rect));
          newRect.x = adjustedPoint.x;
          newRect.y = adjustedPoint.y;
          newRect.visible = true;
          setRect(newRect);
          return;
        case 'circle':
          isDrawing.current = true;
          const newCircle = JSON.parse(JSON.stringify(circle));
          newCircle.x = adjustedPoint.x;
          newCircle.y = adjustedPoint.y;
          newCircle.visible = true;
          setCircle(newCircle);
          return;
      }
    };

    const handleMouseMove = (e) => {
      if (!isDrawing.current) {
        return;
      }
      const pos = stage.getPointerPosition();
      const adjustedPoint = getAdjustedPoint(pos);
      if(tool == 'pen' || tool == 'eraser') {
        let lastLine = items[items.length - 1];
        lastLine.points = lastLine.points.concat([adjustedPoint.x, adjustedPoint.y]);
        // Update lines using functional state update to ensure latest state is used
        setItems([...items.slice(0, -1), lastLine]);
      } else if(tool == 'line') {
        let lastLine = items[items.length - 1];
        lastLine.points = [...lastLine.points.slice(0,2), adjustedPoint.x, adjustedPoint.y];
        // Update lines using functional state update to ensure latest state is used
        setItems([...items.slice(0, -1), lastLine]);
      } else if (tool == 'rectangle') {
        const lastRect = JSON.parse(JSON.stringify(rect));
        lastRect.width = adjustedPoint.x - lastRect.x;
        lastRect.height = adjustedPoint.y - lastRect.y;
        lastRect.visible = true;
        setRect(lastRect);
      } else if (tool == 'circle') {
        const lastCircle = JSON.parse(JSON.stringify(circle));
        lastCircle.radius = { x: Math.abs(adjustedPoint.x - lastCircle.x), y: Math.abs(adjustedPoint.y - lastCircle.y)};
        lastCircle.visible = true;
        setCircle(lastCircle);
      }
    };

    const handleMouseUp = () => {
      isDrawing.current = false;
      if (tool == 'rectangle') {
        const newRect = JSON.parse(JSON.stringify(rect));
        newRect.id = historyPointer;
        var newItems = [...itemsHistory, newRect];
        setItems(newItems);
        setItemsHistory(newItems);
        setHistoryPointer(historyPointer+1);
        //resetRect
        setRect(rectInitialState);
      } else if (tool == 'circle') {
        const newCircle = JSON.parse(JSON.stringify(circle));
        newCircle.id = historyPointer;
        var newItems = [...itemsHistory, newCircle];
        setItems(newItems);
        setItemsHistory(newItems);
        setHistoryPointer(historyPointer+1);
        //resetRect
        setCircle(circleInitialState);
      }
    };

    const handleKeyDown = (e) => {
      if (tool != 'cursor' && tool != 'text') return;
      const key = e.key;
      if(texts.find((text) => {return text.id == selectedTextIndex}) == undefined) return;
      const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Enter', ...Array.from('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ,.?!')];

      // Check if the pressed key is allowed for text editing
      if (allowedKeys.includes(key)) {
        var updatedTexts = [...texts];
        // Handle special keys with specific behavior
        if (key === 'Backspace') {
          updatedTexts[selectedTextIndex].content = updatedTexts[selectedTextIndex].content.slice(0, -1); // Backspace removes last character
        } else if (key === 'Delete') {
          if (updatedTexts.length == 1) {
            updatedTexts = [];
          } else {
            updatedTexts = updatedTexts.filter((text) => {
              return text.id != selectedTextIndex;
            })
          }
        } else if (key === 'Enter') {
          setIsTyping(false);
        } else {
          // Append regular characters to text
          updatedTexts[selectedTextIndex].content = updatedTexts[selectedTextIndex].content + key;
        }
        setTexts(updatedTexts);
      }
    }

    // Adding event listeners
    stage.on('mousedown touchstart', handleMouseDown);
    stage.on('mousemove touchmove', handleMouseMove);
    stage.on('mouseup touchend', handleMouseUp);
    container.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove event listeners
    return () => {
      stage.off('mousedown touchstart', handleMouseDown);
      stage.off('mousemove touchmove', handleMouseMove);
      stage.off('mouseup touchend', handleMouseUp);
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [tool, items, historyPointer, texts, selectedTextIndex, rect, scale, itemsHistory, circle, textId]); // Dependency array includes lines and tool to ensure useEffect runs when they change
  
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
      x: (pos.x - stagePos.x) / scale,
      y: (pos.y - stagePos.y) / scale,
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
    //console.log(object.tool);
    switch (object.tool) {
      case 'pen':
      case 'eraser':
      case 'line':
        return (
          <ResizableLine
            lineProps={object}
            isSelected={tool=="cursor" && object.id === selectedId}
            onSelect={() => {
              selectShape(object.id);
            }}
            onChange={(newAttrs) => {
              const newItems = items.slice();
              newItems[object.id] = newAttrs;
              setItems(newItems);
              setItemsHistory(newItems);
            }}
            draggable={tool=='cursor'}
          />
        );
      case 'image':
        return (
          <URLImage 
            imageProps={object}
            isSelected={tool=="cursor" && object.id === selectedId}
            onSelect={() => {
              selectShape(object.id);
            }}
            onChange={(newAttrs) => {
              const newItems = items.slice();
              newItems[object.id] = newAttrs;
              setItems(newItems);
              setItemsHistory(newItems);
            }}
            draggable={tool=="cursor"}
          />
        );
      case 'rectangle':
        return (
          <Rectangle
            key={object.id}
            shapeProps={object}
            isSelected={object.id === selectedId}
            onSelect={() => {
              selectShape(object.id);
            }}
            onChange={(newAttrs) => {
              const newItems = items.slice();
              newItems[object.id] = newAttrs;
              setItems(newItems);
              setItemsHistory(newItems);
            }}
            draggable={tool=="cursor"}
          />
        );
        case 'circle':
          return (
            <ResizableCircle
              key={object.id}
              shapeProps={object}
              isSelected={object.id === selectedId}
              onSelect={() => {
                selectShape(object.id);
              }}
              onChange={(newAttrs) => {
                const newItems = items.slice();
                newItems[object.id] = newAttrs;
                setItems(newItems);
                setItemsHistory(newItems);
              }}
              draggable={tool=="cursor"}
            />
          );
      default:
        return <></>
    }
  }

  const downloadURI = (uri, name) => {
    var link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const saveImage = () => {
    const stage = stageRef.current.getStage();;
    var dataURL = stage.toDataURL();
    downloadURI(dataURL, 'stage.png');
  }

  return (
    <div 
      onDrop={addImage}
      onDragOver={(e) => e.preventDefault()}
    >
      {tools.map((tooltext) => {
        return (
          <ToolButton
            key={tooltext}
            tool={tool}
            value={tooltext}
            label={tooltext}
            onClick={() => {
                selectShape(null);
                setTool(tooltext)
                setSelectedTextIndex(null);
              }
            }
          ></ToolButton>
        )
      })}
      <button onClick={handleUndo}>undo</button>
      <button onClick={handleRedo}>redo</button>
      <button onClick={saveImage}>Save as image</button>
      <br />
      <span>items: { items.length } </span>
      <span>historyPointer: { historyPointer }</span>
      <br />
      <button onClick={() => {
        if (Math.floor(scale*10) > 1){
          setScale(scale-0.1)
        }
      }}>-10%</button>
      <span>{Math.floor(scale * 100)}%</span>
      <button onClick={() => {
        if (Math.floor(scale*10) < 20) {
          setScale(scale+0.1)
        }
      }}>+10%</button>
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
        scale={{x: scale, y: scale}}
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
                key={text.id}
                textProps={text}
                isSelected={text.id === selectedTextIndex}
                onSelect={() => {
                  if (tool != 'cursor') return;
                  setSelectedTextIndex(text.id);
                  selectShape(null);
                }}
                onChange={(newAttrs) => {
                  const newTexts = texts.slice();
                  newTexts[selectedTextIndex] = newAttrs;
                  setTexts(newTexts);
                }}
                onDragStart={() => {
                    if (tool != 'cursor') return;
                    setSelectedTextIndex(text.id);
                    selectShape(null);
                  }
                }
                draggable={tool=='cursor'}
              />
            )
          })}
          <textarea></textarea>
          {items.slice(0, historyPointer).map((item) => {
            return  render(item);
          })}
          <Rect
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            stroke={rect.stroke}
            strokeWidth={rect.strokeWidth}
            visible={rect.visible} 
          />
          <Ellipse 
            x={circle.x}
            y={circle.y}
            radius={circle.radius}
            width={100}
            height={10}
            stroke={circle.stroke}
            strokeWidth={circle.strokeWidth}
            visible={circle.visible}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default Whiteboard;