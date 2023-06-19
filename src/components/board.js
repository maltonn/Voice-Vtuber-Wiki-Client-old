import React, { useState,useEffect } from 'react';
import interact from 'interactjs'

import '../css/board.css';

export default function Board(props) {
    const boardTransform=props.boardTransform
    const setBoardTransform=props.setBoardTransform
    
    const handleWheel = (event) => {
        // event.preventDefault()

        let mousePos={
            x:event.clientX,
            y:event.clientY,
        }
    
        const scaleDelta=0.05
        if(event.deltaY>0){
            boardTransform.scale*=(1-scaleDelta)
            boardTransform.x=boardTransform.x*(1-scaleDelta)+mousePos.x*(scaleDelta)
            boardTransform.y=boardTransform.y*(1-scaleDelta)+mousePos.y*(scaleDelta)
    
        }else if(event.deltaY<0){
            boardTransform.scale*=(1+scaleDelta)
            boardTransform.x=boardTransform.x*(1+scaleDelta)-mousePos.x*(scaleDelta)
            boardTransform.y=boardTransform.y*(1+scaleDelta)-mousePos.y*(scaleDelta)
        }
    
        setBoardTransform({...boardTransform})
    }


    
    useEffect(() => {
        interact('.board').draggable({
            listeners: {
                start(event) {
                    
                },
                move(event) {
                    setBoardTransform({
                        x:boardTransform.x+event.dx,
                        y:boardTransform.y+event.dy,
                        scale: boardTransform.scale
                    })
                },
            }
        })
    }, [boardTransform])


    return (
        <div ref={props.boardRef} onWheel={handleWheel} className="board" style={{transform:`translate(${boardTransform.x}px,${boardTransform.y}px) scale(${boardTransform.scale})`}}>
            {props.children}
        </div>
    );
}

