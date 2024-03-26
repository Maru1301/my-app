import React from 'react';
import { Line } from 'react-konva';

const ResizableLine = ({ lineProps, draggable }) => {
    const lineRef = React.useRef();
    return (
        <>
            <React.Fragment>
                <Line
                    id={lineProps.id}
                    points={lineProps.points}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    globalCompositeOperation={
                        lineProps.tool === 'eraser' ? 'destination-out' : 'source-over'
                    }
                    strokeScaleEnabled={false}
                    draggable={draggable}
                    //onClick={onSelect}
                    //onTap={onSelect}
                    ref={lineRef}
                    scaleX={lineProps.scaleX ? 1 : lineProps.scaleX}
                    scaleY={lineProps.scaleY ? 1 : lineProps.scaleY}
                    {...lineProps}
                    onDragEnd={(e) => {
                        lineProps.x = e.target.x();
                        lineProps.y = e.target.y();
                    }}
                    onTransformEnd={(e) => {
                        const node = lineRef.current;
                        lineProps.x = node.x();
                        lineProps.y = node.y();
                        lineProps.scaleX = node.scaleX();
                        lineProps.scaleY = node.scaleY();
                        lineProps.rotation = node.rotation();
                    }}
                />
            </React.Fragment>
        </>
    );
};

export default ResizableLine;