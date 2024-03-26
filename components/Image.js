import React from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';

const URLImage = ({ imageProps, draggable }) => {
    const imageRef = React.useRef();
    const [img] = useImage(imageProps.src);
    
    return (
        <>
            <Image
                alt={"image"}
                key={imageProps.key}
                image={img}
                ref={imageRef}
                {...imageProps}
                draggable={draggable}
                onDragEnd={(e) => {
                    imageProps.x = e.target.x();
                    imageProps.y = e.target.y();
                }}
                onTransformEnd={(e) => {
                    const node = imageRef.current;
                    imageProps.x = node.x();
                    imageProps.y = node.y();
                    imageProps.scaleX = node.scaleX();
                    imageProps.scaleY = node.scaleY();
                    imageProps.rotation = node.rotation();
                }}
            />
        </>
    );
};

export default URLImage;