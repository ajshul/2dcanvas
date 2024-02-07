import React from 'react';
import { observer } from "mobx-react";
import { NodeStore } from "../../../stores";
import "./LinkList.scss";

interface LinkListProps {
    store: NodeStore;
}

interface LinkListState {
    isDropdownVisible: boolean;
}

/**
 * Component for displaying and managing a list of links associated with a node.
 */
@observer
export class LinkList extends React.Component<LinkListProps, LinkListState> {
    state = {
        isDropdownVisible: false,
    };

    /**
     * Toggles the visibility of the dropdown.
     */
    toggleDropdown = () => {
        this.setState(prevState => ({
            isDropdownVisible: !prevState.isDropdownVisible
        }));
    };

    /**
     * Renders links of the node.
     */
    renderLinks = () => {
        return this.props.store.linkedNodes.map(node => (
            <div key={node.Id} className="link-item">
                <button className="link" onClick={() => this.handleLinkClick(node.Id)}>
                    {node.title}
                </button>
                <button className="link-delete" onClick={() => this.handleDeleteLink(node.Id)}>
                    X
                </button>
            </div>
        ));
    }

    /**
     * Handles click event on a link.
     */
    handleLinkClick = (nodeId: string) => {
        this.props.store.mainCollection?.centerNode(nodeId);
    }

    /**
     * Handles the deletion of a link.
     */
    handleDeleteLink = (nodeId: string) => {
        this.props.store.linkedNodes.forEach(node => {
            if (node.Id === nodeId) {
                this.props.store.mainCollection?.deleteLink(node, this.props.store);
            }
        });
    }

    /**
     * Renders the dropdown if it is visible.
     */
    renderDropdown = () => {
        if (this.state.isDropdownVisible) {
            return <div className="dropdown-content">{this.renderLinks()}</div>;
        }
        return null;
    };

    render() {
        return (
            <div className="linklist-bar-with-dropdown">
                <div className="linklist-bar" onClick={this.toggleDropdown}>
                    {/* SVG for dropdown icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20px" height="20px"><path d="M7 10l5 5 5-5z" /><path d="M0 0h24v24H0z" fill="none" /></svg>
                </div>
                {this.renderDropdown()}
            </div >
        );
    }
}
