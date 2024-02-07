import { observer } from "mobx-react";
import * as React from 'react';
import { NodeStore, ImageNodeStore, NodeCollectionStore, STextNodeStore, StoreType, VideoNodeStore, FTextNodeStore, WebNodeStore, ChatNodeStore } from "../../stores";
import { STextNodeView, FTextNodeView, VideoNodeView, ImageNodeView, WebNodeView, CollectionNodeView } from "../nodes";
import "./FreeFormCanvas.scss";
import { GridCollectionStore } from "../../stores/GridCollectionStore";
import { ChatNodeView } from "../nodes/ChatNodeView";

interface FreeFormProps {
    store: NodeCollectionStore
}

/**
 * Represents a freeform canvas for rendering different types of nodes.
 */
@observer
export class FreeFormCanvas extends React.Component<FreeFormProps> {

    /**
     * Constructs the canvas and sets its grid property to false.
     * @param props 
     */
    constructor(props: FreeFormProps) {
        super(props);
    }

    private isPointerDown: boolean | undefined;

    /**
     * Handles the pointer down event on the canvas.
     */
    onPointerDown = (e: React.PointerEvent): void => {
        if (!['INPUT', 'BUTTON', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
            e.stopPropagation();
            e.preventDefault();
            this.isPointerDown = true;
            document.removeEventListener("pointermove", this.onPointerMove);
            document.addEventListener("pointermove", this.onPointerMove);
            document.removeEventListener("pointerup", this.onPointerUp);
            document.addEventListener("pointerup", this.onPointerUp);
        } else {
            this.isPointerDown = false;
        }
    }

    /**
     * Handles the pointer up event on the canvas.
     */
    onPointerUp = (e: PointerEvent): void => {
        e.stopPropagation();
        e.preventDefault();
        this.isPointerDown = false;
        document.removeEventListener("pointermove", this.onPointerMove);
        document.removeEventListener("pointerup", this.onPointerUp);
    }

    /**
     * Handles the pointer move event on the canvas.
     */
    onPointerMove = (e: PointerEvent): void => {
        e.stopPropagation();
        e.preventDefault();
        if (!this.isPointerDown) return;
        this.props.store.x += e.movementX;
        this.props.store.y += e.movementY;
    }

    /**
     * Renders the nodes in the canvas based on their type.
     */
    renderNode = (nodeStore: NodeStore): JSX.Element | null => {
        switch (nodeStore.type) {
            case StoreType.SText:
                return <STextNodeView key={nodeStore.Id} store={nodeStore as STextNodeStore} />;
            case StoreType.FText:
                return <FTextNodeView key={nodeStore.Id} store={nodeStore as FTextNodeStore} />;
            case StoreType.Video:
                return <VideoNodeView key={nodeStore.Id} store={nodeStore as VideoNodeStore} />;
            case StoreType.Webpage:
                return <WebNodeView key={nodeStore.Id} store={nodeStore as WebNodeStore} />;
            case StoreType.Image:
                return <ImageNodeView key={nodeStore.Id} store={nodeStore as ImageNodeStore} />;
            case StoreType.Chat:
                return <ChatNodeView key={nodeStore.Id} store={nodeStore as ChatNodeStore} />;
            case StoreType.Collection:
                return <CollectionNodeView key={nodeStore.Id} store={nodeStore as GridCollectionStore} />;
            default:
                return null;
        }
    }
    /**
     * Renders the freeform canvas component.
     */
    render() {
        const { store } = this.props;
        return (
            <div className="freeformcanvas-container" onPointerDown={this.onPointerDown}>
                <div className="freeformcanvas" style={{ transform: store.transform }}>
                    {store.nodes.map(this.renderNode)}
                </div>
            </div>
        );
    }
}