import React, { Component } from 'react';
import { observer } from "mobx-react";
import { WebNodeStore } from "../../../stores";
import "./WebNodeView.scss";
import { TopBar } from "../TopBar";
import "./../NodeView.scss";
import { ResizeHandles } from "../ResizeHandles";

interface WebNodeProps {
    store: WebNodeStore;
}

/**
 * View component for a web node.
 */
@observer
export class WebNodeView extends Component<WebNodeProps> {
    private iframeRef: React.RefObject<HTMLIFrameElement>;

    constructor(props: WebNodeProps) {
        super(props);
        this.iframeRef = React.createRef();
        this.state = {
            currentUrl: props.store.url
        };
    }

    render() {
        const { store } = this.props;

        return (
            <div
                className="node webNode"
                style={{ transform: store.transform, height: store.getHeight, width: store.getWidth, zIndex: store.zIndex }}
                onWheel={(e: React.WheelEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
            >
                <TopBar store={store} />
                <ResizeHandles store={store} />
                <iframe
                    ref={this.iframeRef}
                    src={store.url}
                    className="web-iframe"
                    title="Web Content"
                />
            </div>
        );
    }
}
