import { observer } from "mobx-react";
import * as React from 'react';
import { STextNodeStore } from "../../../stores";
import { TopBar } from "../TopBar";
import "./../NodeView.scss";
import "./STextNodeView.scss";
import { ResizeHandles } from "../ResizeHandles";



interface STextNodeProps {
    store: STextNodeStore;
}

/**
 * View component for a simple noneditable text node.
 */
@observer
export class STextNodeView extends React.Component<STextNodeProps> {

    render() {
        let store = this.props.store;
        return (
            <div className="node sTextNode" style={{ transform: store.transform, height: store.getHeight, width: store.getWidth, zIndex: store.zIndexValue.toString() }} onWheel={(e: React.WheelEvent) => {
                e.stopPropagation();
            }}>
                <TopBar store={store} />
                <ResizeHandles store={store} />
                <div className="scroll-box">
                    <div className="content">
                        <h3 className="title">{store.title}</h3>
                        <p className="paragraph">{store.text}</p>
                    </div>
                </div>
            </div>
        );
    }
}