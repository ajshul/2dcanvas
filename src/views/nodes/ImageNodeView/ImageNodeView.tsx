import { observer } from "mobx-react";
import React from 'react';
import { ImageNodeStore } from "../../../stores";
import "./../NodeView.scss";
import { TopBar } from "./../TopBar";
import "./ImageNodeView.scss";
import { ResizeHandles } from "../ResizeHandles";

interface ImageNodeProps {
    store: ImageNodeStore;
}

/**
 * Component for rendering an image node.
 */
@observer
export class ImageNodeView extends React.Component<ImageNodeProps> {

    /**
     * Generates style for the node based on the store's properties.
     * @param store Image node store
     */
    getNodeStyle = (store: ImageNodeStore) => ({
        transform: store.transform,
        height: store.getHeight,
        width: store.getWidth,
        zIndex: store.zIndex
    });

    /**
     * Renders the content of the image node.
     * @param store Image node store
     */
    renderImageContent = (store: ImageNodeStore) => (
        <div className="scroll-box">
            <div className="content">
                <h3 className="title">{store.title}</h3>
                <img src={store.url} alt={store.title} />
            </div>
        </div>
    );

    /**
     * Renders the ImageNodeView component.
     */
    render() {
        const { store } = this.props;
        return (
            <div className="node imageNode" style={this.getNodeStyle(store)}>
                <TopBar store={store} />
                <ResizeHandles store={store} />
                {this.renderImageContent(store)}
            </div>
        );
    }


}
