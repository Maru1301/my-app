import React from 'react';
import { Line, Transformer } from 'react-konva';

const ResizableLine = ({ lineProps, isSelected, onSelect, onChange }) => {
    const lineRef = React.useRef();
    const trRef = React.useRef();
  
    React.useEffect(() => {
      if (isSelected) {
        // we need to attach transformer manually
        trRef.current.nodes([lineRef.current]);
        trRef.current.getLayer().batchDraw();
      }
    }, [isSelected]);
  
    return (
        <>
            <React.Fragment>
                <Line
                    id={lineProps.id}
                    points={lineProps.points}
                    stroke="black"
                    strokeWidth={5}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    globalCompositeOperation={
                        lineProps.tool === 'eraser' ? 'destination-out' : 'source-over'
                    }
                    draggable
                    onClick={onSelect}
                    onTap={onSelect}
                    ref={lineRef}
                    {...lineProps}
                    onDragEnd={(e) => {
                        onChange({
                        ...lineProps,
                        x: e.target.x(),
                        y: e.target.y(),
                        });
                    }}
                    onTransformEnd={(e) => {
                        // transformer is changing scale of the node
                        // and NOT its width or height
                        // but in the store we have only width and height
                        // to match the data better we will reset scale on transform end
                        const node = lineRef.current;
                        // we will reset it back
                        //node.scaleX(1);
                        //node.scaleY(1);
                        onChange({
                        ...lineProps,
                        x: node.x(),
                        y: node.y(),
                        //strokeWidth: node.strokeWidth() * Math.min(scaleX, scaleY),
                        scaleX: node.scaleX(),
                        scaleY: node.scaleY(),
                        // points: node.points().map((point, i) => {
                        //     console.log(point);
                        //     if (i % 2 == 0) {
                        //         return point * node.scaleX();
                        //     } else {
                        //         return point * node.scaleY();
                        //     }
                        // })
                        // set minimal value
                        });
                    }}
                />
                {isSelected && (
                <Transformer
                    ref={trRef}
                    flipEnabled={false}
                    boundBoxFunc={(oldBox, newBox) => {
                    // limit resize
                    if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                        return oldBox;
                    }
                    return newBox;
                    }}
                />
                )}
            </React.Fragment>
        </>
    );
};

export default ResizableLine;