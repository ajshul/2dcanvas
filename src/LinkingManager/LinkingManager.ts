import { observable } from "mobx";
import { NodeStore } from "../stores";
/**
 * Manages the linking of nodes in a graph structure.
 */
export default class LinkingManager {
    private adjacencyList: Map<NodeStore, NodeStore[]>;

    @observable
    public lastStartNode: NodeStore | null;

    /**
     * Initializes a new instance of the LinkingManager class.
     */
    constructor() {
        this.adjacencyList = new Map();
        this.lastStartNode = null;
    }

    /**
     * Adds a node to the adjacency list if it does not already exist.
     * @param node The node to add.
     */
    addNode(node: NodeStore): void {
        if (!this.adjacencyList.has(node)) {
            this.adjacencyList.set(node, []);
        }
    }

    /**
     * Adds a link between two nodes.
     * @param node The end node to link.
     * @returns A boolean indicating whether the link was successfully added.
     */
    addLink(node: NodeStore): boolean {
        if (this.handleCurrentLinkState(node)) {
            return false;
        }

        this.manageNodeAddition(node);

        if (this.lastStartNode) {
            return this.createLink(node);
        }

        return false;
    }

    /**
     * Gets the links for a specified node.
     * @param node The node for which to retrieve links.
     * @returns An array of nodes linked to the specified node.
     */
    getLinksForNode(node: NodeStore): NodeStore[] {
        return this.adjacencyList.get(node) || [];
    }

    /**
     * Removes all links associated with a given node.
     * @param node The node whose links are to be removed.
     */
    removeLinks(node: NodeStore): void {
        if (!this.adjacencyList.has(node)) {
            return;
        }
        this.adjacencyList.get(node)?.forEach(linkedNode => {
            this.removeLinkFromNode(node, linkedNode);
        });
        this.adjacencyList.delete(node);
        this.updateLinkedNodesAfterRemoval(node);

        if (this.lastStartNode === node) {
            this.lastStartNode = null;
        }

        node.hasLinks = false;
    }

    /**
     * Removes a specific link between two nodes.
     * @param node1 The first node.
     * @param node2 The second node.
     */
    removeSpecificLink(node1: NodeStore, node2: NodeStore): void {
        this.removeLinkFromNode(node1, node2);

        this.updateNodeLinkStatus(node1);
        this.updateNodeLinkStatus(node2);
    }

    /**
     * Handles the current link state of a node.
     * @param node The node to handle.
     * @returns A boolean indicating if the current link state was handled.
     */
    private handleCurrentLinkState(node: NodeStore): boolean {
        node.currentLink = true;
        if (this.lastStartNode === node) {
            node.currentLink = false;
            this.lastStartNode = null;
            return true;
        } else if (this.lastStartNode === null) {
            this.lastStartNode = node;
            return true;
        }
        return false;
    }

    /**
    * Creates a link between the last start node and the given node.
    * @param node The node to link with the last start node.
    */
    private createLink(node: NodeStore): boolean {
        if (this.lastStartNode) {

            const existingLinks = this.adjacencyList.get(this.lastStartNode);
            if (existingLinks && existingLinks.includes(node)) {
                alert('Link already created.');
                node.currentLink = false;
                this.lastStartNode.currentLink = false;
                this.lastStartNode = null;
                return false;
            }

            this.adjacencyList.get(this.lastStartNode)?.push(node);
            this.adjacencyList.get(node)?.push(this.lastStartNode);

            this.lastStartNode.hasLinks = true;
            node.hasLinks = true;

            this.lastStartNode.currentLink = false;
            node.currentLink = false;

            this.lastStartNode.linkedNodes.push(node);
            node.linkedNodes.push(this.lastStartNode);
        }
        this.lastStartNode = null;
        return true;
    }

    /**
     * Manages the addition of a node to the adjacency list.
     * @param node The node to add.
     */
    private manageNodeAddition(node: NodeStore): void {
        this.addNode(node);
        if (this.lastStartNode && !this.adjacencyList.has(this.lastStartNode)) {
            this.addNode(this.lastStartNode);
        }
    }


    /**
     * Updates linked nodes after removal of a node.
     * @param node The node that was removed.
     */
    private updateLinkedNodesAfterRemoval(node: NodeStore): void {
        for (const [otherNode, links] of Array.from(this.adjacencyList.entries())) {
            const index = links.indexOf(node);
            otherNode.linkedNodes = otherNode.linkedNodes.filter(item => item !== node);
            if (index > -1) {
                links.splice(index, 1);
            }
        }
    }

    /**
    * Removes a link from a node.
    * @param node The node to remove the link from.
    * @param targetNode The target node to be removed from the link.
    */
    private removeLinkFromNode(node: NodeStore, targetNode: NodeStore): void {

        if (!this.adjacencyList.has(node) || !this.adjacencyList.has(targetNode)) {
            return;
        }

        // Remove the target node from the node's adjacency list
        const nodeLinks = this.adjacencyList.get(node);
        if (nodeLinks) {
            const index = nodeLinks.indexOf(targetNode);
            if (index > -1) {
                nodeLinks.splice(index, 1);
                // Update the adjacency list in the map
                this.adjacencyList.set(node, nodeLinks);
            }
        }

        // Remove the node from the target node's adjacency list
        const targetNodeLinks = this.adjacencyList.get(targetNode);
        if (targetNodeLinks) {
            const targetIndex = targetNodeLinks.indexOf(node);
            if (targetIndex > -1) {
                targetNodeLinks.splice(targetIndex, 1);
                // Update the adjacency list in the map
                this.adjacencyList.set(targetNode, targetNodeLinks);
            }
        }

        // Update linkedNodes for both nodes
        node.linkedNodes = node.linkedNodes.filter(item => item !== targetNode);
        targetNode.linkedNodes = targetNode.linkedNodes.filter(item => item !== node);

        // Update the hasLinks status
        node.hasLinks = node.linkedNodes.length > 0;
        targetNode.hasLinks = targetNode.linkedNodes.length > 0;
    }



    /**
     * Updates the link status of a node.
     * @param node The node to update.
     */
    private updateNodeLinkStatus(node: NodeStore): void {
        node.hasLinks = node.linkedNodes.length > 0;
    }
}
