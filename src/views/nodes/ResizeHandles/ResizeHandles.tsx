import { observer } from "mobx-react";
import * as React from 'react';
import { NodeStore } from "../../../stores";
import './ResizeHandles.scss';

interface ResizeHandlesProps {
    store: NodeStore;
}

/**
 * Component for rendering resize handles for a node.
 */
@observer
export class ResizeHandles extends React.Component<ResizeHandlesProps> {

    private isPointerDown = false;

    /**
     * Handles the pointer down event on the resize handle.
     */
    onPointerDown = (e: React.PointerEvent): void => {
        e.stopPropagation();
        e.preventDefault();
        this.isPointerDown = true;
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = this.props.store.width;
        const startHeight = this.props.store.height;
        document.removeEventListener("pointermove", this.onPointerMove);
        document.addEventListener("pointermove", this.onPointerMove);
        document.removeEventListener("pointerup", this.onPointerUp);
        document.addEventListener("pointerup", this.onPointerUp);
    }

    /**
     * Handles the pointer up event on the resize handle.
     */
    onPointerUp = (e: PointerEvent): void => {
        e.stopPropagation();
        e.preventDefault();
        this.isPointerDown = false;
        document.removeEventListener("pointermove", this.onPointerMove);
        document.removeEventListener("pointerup", this.onPointerUp);
    }

    /**
     * Handles the pointer move event on the resize handle.
     */
    onPointerMove = (e: PointerEvent): void => {
        e.stopPropagation();
        e.preventDefault();
        if (!this.isPointerDown) return
        this.props.store.setWidth(this.props.store.width += e.movementX);
        this.props.store.setHeight(this.props.store.height += e.movementY);
    }

    render() {
        if (this.props.store.editable) {
            return (
                <div className="resize-handle" onPointerDown={this.onPointerDown}>&#8991;</div>
            );
        } else {
            return null;
        }
    }
}
