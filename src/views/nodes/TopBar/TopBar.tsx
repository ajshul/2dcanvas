import { observer } from 'mobx-react';
import { reaction } from 'mobx';
import * as React from 'react';
import { NodeStore, StoreType } from "../../../stores";
import "./TopBar.scss";
import { LinkList } from "../LinkList";


interface TopBarProps {
    store: NodeStore;
}

interface TopBarState {
    topbarEditMode: boolean;
    nodeHasLinks: boolean;
    nodeCurrentLink: boolean;
}

@observer
export class TopBar extends React.Component<TopBarProps, TopBarState> {

    state: TopBarState = {
        topbarEditMode: this.props.store.editable,
        nodeHasLinks: this.props.store.hasLinks, // Initialize based on the current value of hasLinks
        nodeCurrentLink: this.props.store.currentLink, // Initialize based on the current value of currentLink
    };

    // Reactions to track changes in the hasLinks and currentLink properties
    reactionDisposerForHasLinks: (() => void) | null = null;
    reactionDisposerForCurrentLink: (() => void) | null = null;
    reactionDisposerForEditable: (() => void) | null = null;


    /**
     * Initializes the reactions to track changes in the hasLinks and currentLink properties.
     */
    componentDidMount() {
        this.reactionDisposerForHasLinks = reaction(
            () => this.props.store.hasLinks,
            (hasLinks) => {
                this.setState({ nodeHasLinks: hasLinks });
            }
        );

        this.reactionDisposerForCurrentLink = reaction(
            () => this.props.store.currentLink,
            (currentLink) => {
                this.setState({ nodeCurrentLink: currentLink });
            }
        );

        this.reactionDisposerForEditable = reaction(
            () => this.props.store.editable,
            (editable) => {
                this.setState({ topbarEditMode: editable });
            }
        );
    }

    /**
     * Disposes the reactions when the component is unmounted.
     */
    componentWillUnmount() {
        if (this.reactionDisposerForHasLinks) {
            this.reactionDisposerForHasLinks();
        }
        if (this.reactionDisposerForCurrentLink) {
            this.reactionDisposerForCurrentLink();
        }
        if (this.reactionDisposerForEditable) {
            this.reactionDisposerForEditable();
        }
    }

    private isPointerDown = false;
    private x: number = 0
    private y: number = 0
    private cellOver: number[] = []

    /**
     * Handles the double click event on the top bar to toggle the editable state.
     * @param e 
     */
    onDoubleClickCapture = (e: React.MouseEvent): void => {
        this.props.store.editable = !this.props.store.editable;
    }

    /**
     * Handles the pointer down event on the top bar to enable dragging.
     * @param e 
     */
    onPointerDown = (e: React.PointerEvent): void => {
        this.x = 0;
        this.y = 0;
        e.stopPropagation();
        e.preventDefault();
        this.isPointerDown = true;
        this.props.store.setZIndex(true);
        document.removeEventListener("pointermove", this.onPointerMove);
        document.addEventListener("pointermove", this.onPointerMove);
        document.removeEventListener("pointerup", this.onPointerUp);
        document.addEventListener("pointerup", this.onPointerUp);
    }

    /**
     * Handles the pointer up event on the top bar to disable dragging.
     * @param e 
     */
    onPointerUp = (e: PointerEvent): void => {
        e.stopPropagation();
        e.preventDefault();
        this.isPointerDown = false;
        document.removeEventListener("pointermove", this.onPointerMove);
        document.removeEventListener("pointerup", this.onPointerUp);
    }

    /**
     * Handles the pointer move event on the top bar to move the node.
     * @param e 
     */
    onPointerMove = (e: PointerEvent): void => {
        e.stopPropagation();
        e.preventDefault();
        if (!this.isPointerDown) return;
        this.x += e.movementX;
        this.y += e.movementY;
        if (!this.props.store.addedCollection) {
            this.props.store.x += this.x;
            this.props.store.y += this.y;
            this.x = 0;
            this.y = 0;

        } else {
            if (Math.sqrt(this.x ** 2 + this.y ** 2) > 300) {
                if (window.confirm("Are you sure you want to remove this node from the collection?")) {
                    this.props.store.deleteNode(false);
                    this.props.store.x += this.x;
                    this.props.store.y += this.y;
                }
                this.x = 0;
                this.y = 0;
                this.isPointerDown = false;
                document.removeEventListener("pointermove", this.onPointerMove);
            }
        }

    }

    /**
     * Handles the delete button click event to delete the node.
     */
    handleDelete = () => {
        this.props.store.deleteNode(true);
    };

    /**
     * Handles the collection removal button click event to remove the node from the collection.
     */
    handleCollectionRemoval = () => {
        this.props.store.deleteNode(false);
    };


    /**
     * Renders the delete button if the node is editable.
     * @returns JSX element of the delete button.
     */
    renderDeleteButton = (): JSX.Element | null => {
        if (this.props.store.editable) {
            return <button className="delete-button" onClick={this.handleDelete}>X</button>
        }
        return null;
    }

    /**
     * Renders the link square if the node is editable and has handles.
     * @returns JSX element of the link square.
     */
    renderLinkSquare = (): JSX.Element | null => {
        if (this.props.store.editable && this.props.store.type !== StoreType.Collection) {
            return <div className="link-square" onClick={this.handleLinking} style={{ backgroundColor: this.state.nodeCurrentLink ? "green" : "purple" }}><div className='arrow'>&#8677;</div></div>
        }
        return null;
    }

    /**
     * Renders the link menu if the node is editable and has links.
     * @returns JSX element of the link menu.
     */
    renderLinkMenu = (): JSX.Element | null => {
        if (this.props.store.editable && this.state.nodeHasLinks /*only when it has links*/) {
            return <LinkList store={this.props.store} />
        }
        return null;
    }

    /**
     * Handles the linking event to add the node to the link manager.
     * @param e 
     */
    handleLinking = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (this.props.store.mainCollection?.addLinkToManager(this.props.store)) {
            alert("Link added successfully!");
        };
    }


    render = () => {
        return (
            <div className="full-toparea">
                <div className="topbar"
                    style={{ opacity: this.state.topbarEditMode ? 1 : 0.5 }}
                    onDoubleClick={this.onDoubleClickCapture}
                    onPointerDown={this.onPointerDown}>
                    {this.renderLinkSquare()}
                    {this.renderDeleteButton()}
                </div>
                {this.renderLinkMenu()}
            </div>

        );
    }
}