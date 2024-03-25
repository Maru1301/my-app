import React from 'react';
import { Text, Transformer } from 'react-konva';

const URLImage = ({ textProps, isSelected, onSelect, onChange, onDragStart, draggable, handleDoubleClick }) => {
    const textRef = React.useRef();
    const trRef = React.useRef();
    const [width, setWidth] = React.useState();
    const [height, setHeight] = React.useState();

    React.useEffect(() => {
        if (isSelected) {
            // we need to attach transformer manually
            trRef.current.nodes([textRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    return (
        <>
            <Text
                text={textProps.content}
                x={textProps.x}
                y={textProps.y}
                fontSize={textProps.fontSize}
                onDblClick={ handleDoubleClick }

                onClick={onSelect}
                onTap={onSelect}
                ref={textRef}
                // {...shapeProps}
                draggable={draggable}
                onDragStart={onDragStart}
                onDragEnd={(e) => {
                    onChange({
                    ...textProps,
                    x: e.target.x(),
                    y: e.target.y(),
                    });
                }}
                onTransformEnd={(e) => {
                    
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
        </>
    );
};

export default URLImage;