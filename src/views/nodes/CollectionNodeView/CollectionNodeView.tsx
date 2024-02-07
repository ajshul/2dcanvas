import React from 'react';
import { observer } from "mobx-react";
import { TopBar } from "../TopBar";
import "./../NodeView.scss";
import "./CollectionNodeView.scss";
import { GridCollectionStore } from '../../../stores/GridCollectionStore';
import { COLLECTION_BORDER_WIDTH } from '../../../constants';

interface NodeCollectionProps {
    store: GridCollectionStore;
}

interface CollectionNodeState {
    prevDimensions: { [nodeId: string]: { width: number, height: number } };
}

/**
 * Represents the view for a collection of nodes.
 */
@observer
export class CollectionNodeView extends React.Component<NodeCollectionProps, CollectionNodeState> {
    constructor(props: NodeCollectionProps) {
        super(props);
        this.state = {
            prevDimensions: {},
        };
    }

    /**
     * Renders the grid lines for the collection.
     */
    renderGridLines = () => {
        const { store } = this.props;
        const gridLines: JSX.Element[] = [];
        let xPos = -2.5;
        Object.keys(store.maxColumnWidths).forEach((key, index) => {
            const width = store.maxColumnWidths[parseInt(key)];
            const columnLineKey = this.props.store.Id + "col-" + key + "x" + index;
            if (index > 0) {
                gridLines.push(
                    <line key={columnLineKey} x1={xPos} y1="0" x2={xPos} y2={store.height} stroke="gray" strokeWidth={COLLECTION_BORDER_WIDTH} />
                );
            }
            xPos += width;
        });

        let yPos = 20;
        Object.keys(store.maxRowHeights).forEach((key, index) => {
            const height = store.maxRowHeights[parseInt(key)];
            const rowLineKey = this.props.store.Id + "row-" + key + "x" + index;
            if (index > 0) {
                gridLines.push(
                    <line key={rowLineKey} x1="0" y1={yPos} x2={store.width} y2={yPos} stroke="gray" strokeWidth={COLLECTION_BORDER_WIDTH} />
                );
            }
            yPos += height;
        });

        return (
            <svg key={this.props.store.Id + "gridlines"} className="grid-lines" width={store.width} height={store.height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                {gridLines}
            </svg>
        );
    }

    /**
     * Updates the grid when the component updates.
     * @param prevProps 
     */
    componentDidUpdate(prevProps: NodeCollectionProps) {
        this.updateGrid();
        this.props.store.updateNodePositions();
    }

    /**
     * Updates the grid when the component mounts.
     */
    componentDidMount() {
        this.updateGrid();
        this.props.store.updateNodePositions();
    }

    /**
     * Updates the grid when the dimensions of the nodes change.
     */
    updateGrid = () => {
        this.props.store.nodes.forEach((node, index) => {
            const prevDim = this.state.prevDimensions[node.Id] || { width: 0, height: 0 };
            if (node.width !== prevDim.width || node.height !== prevDim.height) {
                this.props.store.updateGridDimensions();
                this.setState(prevState => ({
                    prevDimensions: {
                        ...prevState.prevDimensions,
                        [node.Id]: { width: node.width, height: node.height }
                    }
                }));
            }
        });
    }


    render() {
        return (
            <div className="node collectionNode" style={{ transform: this.props.store.transform, height: this.props.store.getHeight, width: this.props.store.getWidth, zIndex: this.props.store.zIndexValue.toString() }}>
                <TopBar store={this.props.store} />
                {this.renderGridLines()}
            </div>
        );
    }
}