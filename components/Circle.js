import React from 'react';
import { Ellipse } from 'react-konva';

const ResizableCircle = ({ shapeProps, draggable }) => {
    const shapeRef = React.useRef();
  
    return (
        <>
            <React.Fragment>
                <Ellipse
                    ref={shapeRef}
                    {...shapeProps}
                    strokeScaleEnabled={false}
                    draggable={draggable}
                    onDragEnd={(e) => {
                        shapeProps.x = e.target.x();
                        shapeProps.y = e.target.y();
                    }}
                    onTransformEnd={(e) => {
                        const node = shapeRef.current;
                        shapeProps.x = node.x();
                        shapeProps.y = node.y();
                        shapeProps.scaleX = node.scaleX();
                        shapeProps.scaleY = node.scaleY();
                        shapeProps.radius = { x: Math.max(5, node.radius().x), y: Math.max(5, Math.max(5, node.radius().y))};
                        shapeProps.rotation = node.rotation();
                    }}
                />
            </React.Fragment>
        </>
    );
  };

  export default ResizableCircle;