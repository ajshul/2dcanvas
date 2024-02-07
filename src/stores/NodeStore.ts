import { computed, observable, action } from "mobx";
import { Utils } from "../Utils";
import { NodeCollectionStore } from "./NodeCollectionStore";
import { zIndexManager } from "../zIndexManager/zIndexManager";
import { GridCollectionStore } from "./GridCollectionStore";
import { MINIMUM_NODE_SIZE } from "../constants";

export enum StoreType {
    SText = 1,
    FText,
    Video,
    Image,
    Webpage,
    Collection,
    Chat
}

/**
 * Represents a node in the system with various properties and behaviors.
 */
export class NodeStore {
    @observable public Id: string = Utils.GenerateGuid();
    @observable public type: StoreType | null = null;
    @observable public title: string | undefined;
    @observable public inGrid: boolean = false;
    @observable public mainCollection: NodeCollectionStore | null = null;
    @observable public addedCollection: GridCollectionStore | null = null;
    @observable public hasLinks: boolean = false;
    @observable public x: number = 0;
    @observable public y: number = 0;
    @observable public zIndex: number = 0;
    @observable public width: number = 300;
    @observable public height: number = 300;
    @observable public editable: boolean = false;
    @observable public toCollectionAdd: boolean = false;
    @observable public linkedNodes: NodeStore[] = [];
    @observable public currentLink: boolean = false;
    @observable public gridRow: number = 0;
    @observable public gridColumn: number = 0;

    /**
     * Toggles the hasLinks state of the node.
     */
    @action
    toggleHasLinks = (): void => {
        this.hasLinks = !this.hasLinks;
    };

    /**
     * Retrieves the current link status.
     */
    @computed
    public get getCurrentLinkStatus(): boolean {
        return this.currentLink;
    }

    /**
     * Computes the transform property for CSS.
     */
    @computed
    public get transform(): string {
        return `translate(${this.x}px, ${this.y}px)`;
    }

    /**
     * Retrieves the zIndex as a string.
     */
    @computed
    public get zIndexValue(): number {
        return this.zIndex;
    }

    /**
     * Sets the zIndex of the node.
     * @param front Whether the node should be brought to the front.
     * @param alternativeZIndex An alternative zIndex value.
     */
    @action
    public setZIndex(front: boolean, alternativeZIndex?: number): void {
        this.zIndex = front ? zIndexManager.getNewZIndex() : alternativeZIndex ?? 0;
    }

    /**
     * Retrieves the height as a string with 'px'.
     */
    @computed
    public get getHeight(): string {
        return `${this.height}px`;
    }

    /**
     * Sets the x coordinate of the node
     * @param newX 
     */
    @action
    public setX(newX: number): void {
        this.x = newX;
    }

    /**
    * Sets the y coordinate of the node
    * @param newY
    */
    @action
    public setY(newY: number): void {
        this.y = newY;
    }

    /**
     * Adds a collection to the node's collection array
     * @param collectionToAddTo 
     */
    @action
    public addToCollection(collectionToAddTo: GridCollectionStore): void {
        this.addedCollection = collectionToAddTo;
    }

    /**
     * Sets the width of the node if over 100px
     * @param newWidth width to set
     */
    @action
    public setWidth(newWidth: number): void {
        if (newWidth < MINIMUM_NODE_SIZE) {
            alert("Width must be at least 100px")
            this.width = MINIMUM_NODE_SIZE;
            return;
        } else {
            this.width = newWidth;
        }
        if (this.addedCollection) {
            this.addedCollection.updateGridDimensions();
        }

    }

    /**
     * Sets the height of the node if over 100px
     * @param newHeight height to set 
     */
    @action
    public setHeight(newHeight: number): void {
        if (newHeight < MINIMUM_NODE_SIZE) {
            alert("Height must be at least 100px")
            this.height = MINIMUM_NODE_SIZE;
            return;
        } else {
            this.height = newHeight;
        }
        if (this.addedCollection) {
            this.addedCollection.updateGridDimensions();
        }
    }

    /**
     * Retrieves the width as a string with 'px'.
     */
    @computed
    public get getWidth(): string {
        return this.width + "px"
    }

    /**
     * Retrieves the id of the node.
     */
    public get getId(): string {
        return this.Id;
    }

    /**
     * Deletes the node either from its individual collection or completely (by removing it from the base/main collection)
     * @param fullDeletion indicates whether the node should be fully deleted or just removed from the collection
     */
    @action
    deleteNode(fullDeletion: boolean): void {
        if (this.mainCollection) {
            if (fullDeletion) this.mainCollection.removeLinksForNode(this);
            if (this.addedCollection) {
                this.addedCollection.removeNode(this);
                this.addedCollection.updateGridDimensions();
                this.addedCollection = null;
            }
            if (fullDeletion) {
                this.mainCollection.removeNode(this);
                this.mainCollection = null;
            }
        } else {
            return;
        }
    }

}