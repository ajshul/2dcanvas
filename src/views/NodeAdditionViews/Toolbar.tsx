import React, { Component } from 'react';
import { reaction } from 'mobx';
import './Toolbar.scss';
import { NodeStore, NodeCollectionStore, StoreType } from '../../stores';
import { ConfirmationPopup } from './ConfirmationPopup';
import { ImageSelector } from './ImageSelector';
import { GridSelector } from './GridSelector';
import { zIndexManager } from '../../zIndexManager/zIndexManager';
import { GridCollectionStore } from '../../stores/GridCollectionStore';
import { STARTING_NODE_SIZE, NODE_ASSIGNMENT_WARNING_MESSAGE, NO_COLLECTIONS_WARNING_MESSAGE, TOO_MANY_COLLECTIONS_WARNING_MESSAGE } from '../../constants';



interface ToolbarProps {
    nodeCollection: NodeCollectionStore;
    addNode: (node: NodeStore) => void;
}


interface ToolbarState {
    showMenu: boolean;
    showBottomMenu: boolean;
    showPopup: boolean;
    collectedNodes: NodeStore[];
    collection: GridCollectionStore | null;
    selectedNodeType?: StoreType;
    addingToCollection: boolean;
}

/**
 * Toolbar component for adding different types of nodes.
 */
export class Toolbar extends Component<ToolbarProps, ToolbarState> {
    constructor(props: ToolbarProps) {
        super(props);
        this.state = {
            showBottomMenu: false,
            showMenu: false,
            showPopup: false,
            collectedNodes: [],
            collection: null,
            addingToCollection: false
        };
    }

    /**
     * Handles adding a new node of a specified type.
     * @param type Type of the node to add.
     */
    handleAddNode = (type: StoreType | null) => {
        if (!type) {
            return;
        }

        if (type === StoreType.Collection) {
            this.handleCollectionCreation();
        } else {
            this.setState({ selectedNodeType: type, showPopup: true });
        }

    };

    /**
     * Handles adding a node to a collection.
     */
    handleAddingToCollection = () => {
        const nodesToAdd: NodeStore[] = [];
        const collectionToAddTo: GridCollectionStore[] = [];
        for (let i = 0; i < this.props.nodeCollection.childCollections.length; i++) {
            if (this.props.nodeCollection.childCollections[i].editable) {
                collectionToAddTo.push(this.props.nodeCollection.childCollections[i]);
            }
        }
        if (collectionToAddTo.length === 1) {
            this.props.nodeCollection.nodes.forEach(function (node) {
                if (node.editable && !node.addedCollection && node.type !== StoreType.Collection) {
                    nodesToAdd.push(node);

                }
            });
            if (nodesToAdd.length >= 1) {
                this.setState({
                    selectedNodeType: StoreType.Collection, showPopup: true,
                    collectedNodes: nodesToAdd, collection: collectionToAddTo[0], addingToCollection: true
                });
                collectionToAddTo[0].editable = false;
                return;
            } else if (nodesToAdd.length < 1) {
                alert(NODE_ASSIGNMENT_WARNING_MESSAGE)
                return;
            }
        } else if (collectionToAddTo.length < 1) {
            alert(NO_COLLECTIONS_WARNING_MESSAGE)
            return;
        } else {
            alert(TOO_MANY_COLLECTIONS_WARNING_MESSAGE)
            return;
        }
    }

    // Reaction disposer for the bottom menu visibility
    reactionDisposerForBottomMenu: (() => void) | null = null;

    /**
     * Sets up a reaction to the node collection length to determine if the bottom menu should be shown based
     * on whether there are any collections and nodes to add to the collections.
     */
    componentDidMount = () => {
        this.reactionDisposerForBottomMenu = reaction(
            () => this.props.nodeCollection.nodes.length,
            () => {
                let possibleCollection: boolean = false;
                let possibleNode: boolean = false;

                this.props.nodeCollection.nodes.forEach(node => {
                    if (!node.addedCollection && node.type !== StoreType.Collection) possibleNode = true;
                });
                this.props.nodeCollection.nodes.forEach(collection => {
                    if (collection.type === StoreType.Collection) possibleCollection = true;
                });
                this.setState({ showBottomMenu: possibleCollection && possibleNode });
            }
        );
    }

    /**
     * Cleans up the reaction disposer when the component is unmounted.
     */
    componentWillUnmount = () => {
        if (this.reactionDisposerForBottomMenu) {
            this.reactionDisposerForBottomMenu();
        }
    }

    /**
     * Handles adding a new collection node with the currently selected nodes. 
     */
    handleCollectionCreation = () => {
        const toAdd: NodeStore[] = [];
        if (this.props.nodeCollection.nodes) {
            this.props.nodeCollection.nodes.forEach(function (node) {
                if (node.editable && !node.addedCollection) {
                    toAdd.push(node);
                }
            });
            if (toAdd.length !== 0) {
                const newCollection: GridCollectionStore = new GridCollectionStore({
                    type: StoreType.Collection, x: STARTING_NODE_SIZE, y: STARTING_NODE_SIZE, title: ''
                });
                this.props.nodeCollection.childCollections.push(newCollection);
                this.setState({ selectedNodeType: StoreType.Collection, showPopup: true, collectedNodes: toAdd, collection: newCollection, addingToCollection: false });
                return;
            }
        }
        alert(NODE_ASSIGNMENT_WARNING_MESSAGE)
        return;
    }

    /**
     * Renders the popup for adding a new node.
     */
    renderPopup = (): JSX.Element | null => {
        if (this.state.showPopup && this.state.selectedNodeType) {
            switch (this.state.selectedNodeType) {
                case StoreType.Image:
                    return (
                        <ImageSelector onAdd={this.handleNodeCreation} onCancel={this.handleCancelPopup} />
                    );
                case StoreType.Collection:
                    if (this.state.collection) {
                        return (<GridSelector onConfirm={this.handleNodeCreation}
                            onCancel={this.handleCancelPopup}
                            nodesToAdd={this.state.collectedNodes}
                            collection={this.state.collection}
                            addingToCollection={this.state.addingToCollection} />);
                    } else {
                        alert("No collection selected")
                        return null;
                    }
                default:
                    return (
                        <ConfirmationPopup
                            nodeType={this.state.selectedNodeType}
                            onConfirm={this.handleNodeCreation}
                            onCancel={this.handleCancelPopup}
                        />
                    );
            }
        } return null;
    }

    /**
     * Handles the creation of a new node.
     * @param node Node to be added.
     */
    handleNodeCreation = (node: NodeStore | null) => {
        if (node) {
            this.props.addNode(node);
        }
        this.setState({ showPopup: false });
    };

    /**
     * Handles cancellation of the popup.
     */
    handleCancelPopup = () => {
        this.setState({ showPopup: false });
    };

    /**
     * Toggles the menu visibility.
     */
    toggleMenu = () => {
        this.setState(prevState => ({ showMenu: !prevState.showMenu }));
    };

    /**
     * Renders the menu buttons for adding different types of nodes.
     */
    renderMenuButtons = () => (
        <div className="menu">
            <button onClick={() => this.handleAddNode(StoreType.SText)}>Static Text Node</button>
            <button onClick={() => this.handleAddNode(StoreType.FText)}>Formattable Text Node</button>
            <button onClick={() => this.handleAddNode(StoreType.Webpage)}>Webpage</button>
            <button onClick={() => this.handleAddNode(StoreType.Video)}>Video Node</button>
            <button onClick={() => this.handleAddNode(StoreType.Image)}>Image Node</button>
            <button onClick={() => this.handleAddNode(StoreType.Chat)}>Chat Node</button>
            <button onClick={() => this.handleAddNode(StoreType.Collection)}>Collection Node</button>
        </div>
    );

    /**
     * Renders the bottom menu for adding nodes to collections.
     */
    renderBottomMenu = () => (
        <div className="bottom-menu">
            <button onClick={() => this.handleAddingToCollection()}>Add To Collection</button>
            <div className="info-circle">
                <span className="question-mark">?</span>
                <span className="info-box">To add a node to an existing collection, select one collection and whichever
                    nodes you would like to add by double-clicking their topbars.</span>
            </div>
        </div>
    );

    render = () => {
        const { showBottomMenu, showMenu, showPopup, selectedNodeType } = this.state;

        return (
            <div className={`toolbar ${showMenu ? 'show-menu' : ''}`} style={{ zIndex: zIndexManager.getNewZIndex() }}>
                <button className="menu-open-button" onClick={this.toggleMenu}>☰ Add Node</button>
                {showMenu && this.renderMenuButtons()}
                {showBottomMenu && this.renderBottomMenu()}
                {this.renderPopup()}
            </div>
        );
    }
}
