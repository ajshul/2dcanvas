import { computed, observable, action } from "mobx";
import { NodeStore } from "./NodeStore";
import LinkingManager from "../LinkingManager/LinkingManager";
import { GridCollectionStore } from "./GridCollectionStore";

/**
 * Represents a collection of nodes, extending the functionalities of a single node.
 */
export class NodeCollectionStore extends NodeStore {
    @observable public nodes: NodeStore[] = [];
    private linkManager: LinkingManager = new LinkingManager();

    public childCollections: GridCollectionStore[] = [];

    /**
     * Constructs a new NodeCollectionStore instance.
     * @param initializer Partial object to initialize the properties of NodeCollectionStore.
     * This allows for optional overriding of properties from both NodeCollectionStore and NodeStore.
     */
    constructor(initializer: Partial<NodeCollectionStore>) {
        super();
        Object.assign(this, initializer);
    }

    /**
     * Retrieves the transform property for CSS.
     */
    @computed
    public get transform(): string {
        return `translate(${this.x}px, ${this.y}px)`;
    }

    /**
     * Adds multiple nodes to the collection and updates the grid layout if in grid mode.
     * @param stores Array of NodeStore to add.
     */
    @action
    public addNodes(stores: NodeStore[]): void {
        stores.forEach(store => {
            this.nodes.push(store);
            store.setZIndex(true);
        });
    }

    /**
     * Removes a specific node from the collection.
     * @param node Node to be removed.
     */
    @action
    public removeNode(node: NodeStore): void {
        this.nodes = this.nodes.filter(n => n !== node);
        if (this.nodes.length === 0) {
            this.deleteNode(true);
        }
    }

    /**
     * Deletes the node and all child nodes.
     * @param fullDeletion Boolean indicating if the node should be deleted from the collection.
     */
    @action
    public override deleteNode(fullDeletion: boolean): void {
        if (fullDeletion) {
            this.nodes.forEach(node => node.deleteNode(true));
            super.deleteNode(true);
        } else {
            super.deleteNode(false);
        }
    }

    /**
     * Adds a link between nodes through the LinkManager.
     * @param node Node to be linked.
     * @returns Boolean indicating if the link was added successfully.
     */
    @action
    public addLinkToManager(node: NodeStore): boolean {
        return this.linkManager.addLink(node);
    }

    /**
     * Retrieves links for a specific node from the LinkManager.
     * @param node Node for which to retrieve links.
     * @returns Array of linked NodeStore objects.
     */
    @action
    public getLinks(node: NodeStore): NodeStore[] {
        return this.linkManager.getLinksForNode(node);
    }

    /**
     * Removes all links for a specific node using the LinkManager.
     * @param node Node for which to remove links.
     */
    @action
    public removeLinksForNode(node: NodeStore): void {
        this.linkManager.removeLinks(node);
    }

    /**
     * Deletes a specific link between two nodes.
     * @param node1 First node in the link.
     * @param node2 Second node in the link.
     */
    @action
    public deleteLink(node1: NodeStore, node2: NodeStore): void {
        this.linkManager.removeSpecificLink(node1, node2);
    }

    /**
     * Centers a node in the viewport.
     * @param nodeId ID of the node to center.
     */
    @action
    public centerNode(nodeId: string): void {
        const node = this.nodes.find(n => n.Id === nodeId);
        if (node) {
            this.x = -node.x + window.innerWidth / 2 - node.width / 2;
            this.y = -node.y + window.innerHeight / 2 - node.height / 2;
        }
    }
}
