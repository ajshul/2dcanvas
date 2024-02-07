import React, { createRef } from 'react';
import './App.scss';
import { NodeCollectionStore, NodeStore } from './stores';
import { FreeFormCanvas } from './views/freeformcanvas/FreeFormCanvas';
import { Toolbar } from './views/NodeAdditionViews/Toolbar';


// Create a new node collection to store the nodes
const mainNodeCollection = new NodeCollectionStore({ title: "Main Node Collection" });

/**
 * Main application component.
 */
export class App extends React.Component {

    canvasRef = createRef<HTMLDivElement>();

    /**
     * Handles adding a node to the canvas.
     * @param node Node to add to the canvas
     */
    addNodeToCanvas = (node: NodeStore) => {
        console.log("Adding node to canvas" + node.type)
        mainNodeCollection.addNodes([node]);
        node.mainCollection = mainNodeCollection;
        this.forceUpdate(); // Force an update to re-render the canvas with the new node
    };

    render() {
        return (
            <div className="App">
                <Toolbar nodeCollection={mainNodeCollection} addNode={this.addNodeToCanvas} />
                <FreeFormCanvas store={mainNodeCollection} />
            </div>
        );
    }

}

export default App;