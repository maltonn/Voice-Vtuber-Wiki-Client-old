import React, { useState } from 'react';
import '../css/detail_tab.css';

export default function DetailTab(props) {


    if (props.data == undefined) return (<div></div>)
    return (<a href={`https://www.youtube.com/channel/${props.data.id}`} target='_blank'>
        <div className="detail-tab">
            <div className="detail-tab-image">
                <img src={props.data.channel_thumbnail || ""} />
            </div>

            <div className="detail-tab-text">
                <div className="detail-tab-text-title">
                    {props.data.channel_title}
                </div>
                <div className="detail-tab-text-description">
                    {props.data.channel_description}
                    {/* {props.data.channel_description.slice(0, 300) + ((props.data.channel_description.length > 300) ? "..." : "")} */}
                </div>
            </div>
        </div>
    </a>
    );
}