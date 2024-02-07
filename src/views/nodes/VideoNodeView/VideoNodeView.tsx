import { observer } from "mobx-react";
import * as React from 'react';
import { VideoNodeStore } from "../../../stores";
import "./../NodeView.scss";
import { TopBar } from "./../TopBar";
import "./VideoNodeView.scss";
import { ResizeHandles } from "../ResizeHandles";


interface VideoNodeProps {
    store: VideoNodeStore;
}

/**
 * View component for a video node.
 */
@observer
export class VideoNodeView extends React.Component<VideoNodeProps> {

    render() {
        let store = this.props.store;
        return (
            <div className="node videoNode" style={{ transform: store.transform, height: store.getHeight, width: store.getWidth, zIndex: store.zIndex }}>
                <TopBar store={store} />
                <ResizeHandles store={store} />
                <div className="scroll-box">
                    <div className="content">
                        <h3 className="title">{store.title}</h3>
                        <video src={store.url} controls />
                    </div>
                </div>
            </div>
        );
    }
}