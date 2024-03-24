import React from 'react';
import { Image, Transformer } from 'react-konva';
import useImage from 'use-image';

const URLImage = ({ imageProps, isSelected, onSelect, onChange, draggable }) => {
    const imageRef = React.useRef();
    const trRef = React.useRef();
    const [width, setWidth] = React.useState();
    const [height, setHeight] = React.useState();
    const [img] = useImage(imageProps.src);

    React.useEffect(() => {
        if (isSelected) {
            // we need to attach transformer manually
            trRef.current.nodes([imageRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);
    
    return (
        <>
            <Image
                key={imageProps.key}
                image={img}
                x={imageProps.x}
                y={imageProps.y}
                width={ img ? img.width : 0 }
                height={ img ? img.height : 0 }
                // I will use offset to set origin to the center of the image
                //offsetX={img ? img.width / 2 : 0}
                //offsetY={img ? img.height / 2 : 0}

                onClick={onSelect}
                onTap={onSelect}
                ref={imageRef}
                // {...shapeProps}
                draggable={draggable}
                onDragEnd={(e) => {
                    onChange({
                    ...imageProps,
                    x: e.target.x(),
                    y: e.target.y(),
                    });
                }}
                onTransformEnd={(e) => {
                    // transformer is changing scale of the node
                    // and NOT its width or height
                    // but in the store we have only width and height
                    // to match the data better we will reset scale on transform end
                    const node = imageRef.current;
                    img.width = Math.max(5, img.width * node.scaleX());
                    img.height = Math.max(5, img.height * node.scaleY());

                    // we will reset it back
                    node.scaleX(1);
                    node.scaleY(1);
                    onChange({
                    ...imageProps,
                    //x: node.x(),
                    //y: node.y(),
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
        </>
    );
};

export default URLImage;