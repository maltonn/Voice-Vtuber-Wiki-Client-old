import React, { useState } from 'react';
import '../css/contour.css';
export default function Contour(props){
    return(
        <div className='contour' style={{
            transform: `translate(${-props.boardTransform.x}px, ${-props.boardTransform.y}px))`
        }}>
            <div className='contour1'></div>
            <div className='contour2'></div>
            <div className='contour3'></div>
        </div>
    )
}
