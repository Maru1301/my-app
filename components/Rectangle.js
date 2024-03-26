import React from 'react';
import { Rect, Transformer } from 'react-konva';

const Rectangle = ({ shapeProps, draggable }) => {
    const shapeRef = React.useRef();
  
    return (
        <>
            <React.Fragment>
                <Rect
                //onClick={onSelect}
                //onTap={onSelect}
                ref={shapeRef}
                width={shapeProps.width}
                height={shapeProps.height}
                strokeScaleEnabled={false}
                {...shapeProps}
                draggable={draggable}
                onDragEnd={(e) => {
                    shapeProps.x = e.target.x();
                    shapeProps.y = e.target.y();
                }}
                onTransformEnd={(e) => {
                    const node = shapeRef.current;
                    shapeProps.x = e.target.x();
                    shapeProps.y = e.target.y();
                    shapeProps.scaleX = node.scaleX();
                    shapeProps.scaleY = node.scaleY();
                    shapeProps.rotation = node.rotation();
                }}
                />
            </React.Fragment>
        </>
    );
  };

  export default Rectangle;