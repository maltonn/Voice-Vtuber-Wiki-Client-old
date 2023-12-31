import React, { useState } from 'react';
import '../css/circle.css';

export default function Circle(props) {
    const onClickFunc=()=>{
        props.onCircleClick(props.index)
    }

    if (props.data.id == undefined) return (<div></div>)
    return (
        // <a href={`https://www.youtube.com/channel/${props.data.id}`} target='_blank'>
            <div             
                onClick={onClickFunc} className="circle" 
                style={{
                    transform:`
                        translate(${props.data["posx"]}px,${props.data["posy"]}px)
                        scale(${Math.min(1/props.boardTransform.scale**0.8,2)})
                    `}}>
                <img src={props.data.channel_thumbnail} />
            </div>
        // </a>
    );
}