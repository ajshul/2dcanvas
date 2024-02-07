import { computed, observable, action } from "mobx";
import { NodeCollectionStore } from "./NodeCollectionStore";
import { NodeStore } from "./NodeStore";
import { COLLECTION_BORDER_WIDTH, TOOLBAR_HEIGHT } from '../constants';


/**
 * Represents a specialized collection of nodes arranged in a grid, extending the functionalities of NodeCollectionStore.
 */
export class GridCollectionStore extends NodeCollectionStore {

    @observable public maxColumnWidths: { [key: number]: number } = {};
    @observable public maxRowHeights: { [key: number]: number } = {};
    @observable public rowNumber: number = 0;
    @observable public colNumber: number = 0;

    /**
     * Constructs a new GridCollectionStore instance.
     * @param initializer Partial object to initialize the properties of GridCollectionStore.
     */
    constructor(initializer: Partial<GridCollectionStore>) {
        super(initializer);
    }


    /**
     * Updates the dimensions of the grid based on the nodes present.
     */
    @action
    public updateGridDimensions(): void {
        this.normalizeGrid(this.nodes);
        this.maxColumnWidths = {};
        this.maxRowHeights = {};
        this.updateGridSize();
        this.nodes.forEach(node => {
            this.updateMaxDimensions(node);
        });
        this.updateNodePositions();
        if (this.addedCollection) {
            this.addedCollection.updateGridDimensions();
        }
    }

    /**
     * Normalizes the grid after assignment is done.
     */
    normalizeGrid(nodes: NodeStore[]): void {
        const uniqueRows = new Set<number>();
        const uniqueCols = new Set<number>();
        nodes.forEach(node => {
            uniqueRows.add(node.gridRow);
            uniqueCols.add(node.gridColumn);
        });

        const rowMap = new Map<number, number>();
        Array.from(uniqueRows).sort((a, b) => a - b).forEach((value, index) => rowMap.set(value, index));
        const colMap = new Map<number, number>();
        Array.from(uniqueCols).sort((a, b) => a - b).forEach((value, index) => colMap.set(value, index));

        nodes.forEach(node => {
            node.gridRow = rowMap.get(node.gridRow)!;
            node.gridColumn = colMap.get(node.gridColumn)!;
        });
    }

    /**
     * Updates the positions of the nodes in the grid.
     */
    @action
    public updateNodePositions(): void {
        this.moveChildrenInFront();
        this.nodes.forEach(node => {
            const gridX = this.x + (this.widthRightToColumn(node.gridColumn));
            const gridY = this.y + (this.heightDownToRow(node.gridRow));
            node.setX(gridX + COLLECTION_BORDER_WIDTH);
            if (node.gridRow === 0) {
                node.setY(gridY + TOOLBAR_HEIGHT + COLLECTION_BORDER_WIDTH);
            } else {
                node.setY(gridY + TOOLBAR_HEIGHT + COLLECTION_BORDER_WIDTH + COLLECTION_BORDER_WIDTH / 2);
            }
        });
        if (this.addedCollection) {
            this.addedCollection.updateNodePositions();
            this.addedCollection.moveChildrenInFront();
        }
    }

    /**
     * Updates the maximum dimensions of the grid based on the nodes present.
     */
    private updateGridSize(): void {
        this.colNumber = 0;
        this.rowNumber = 0;
        this.nodes.forEach(node => {
            this.colNumber = Math.max(this.colNumber, node.gridColumn);
            this.rowNumber = Math.max(this.rowNumber, node.gridRow);
        });

    }
    /**
     * Updates the maximum dimensions of a grid cell based on a node's size.
     * @param node Node to use for updating dimensions.
     */
    private updateMaxDimensions(node: NodeStore): void {
        const gridColumn = node.gridColumn;
        const gridRow = node.gridRow;
        if (!this.maxColumnWidths[gridColumn] || this.maxColumnWidths[gridColumn] < node.width) {
            this.maxColumnWidths[gridColumn] = node.width + COLLECTION_BORDER_WIDTH
            if (gridColumn === this.colNumber) {
                this.maxColumnWidths[gridColumn] += COLLECTION_BORDER_WIDTH;
            }
        }

        if (!this.maxRowHeights[gridRow] || this.maxRowHeights[gridRow] < node.height) {
            this.maxRowHeights[gridRow] = node.height + COLLECTION_BORDER_WIDTH;

            if (gridRow === this.rowNumber) {
                this.maxRowHeights[gridRow] += COLLECTION_BORDER_WIDTH + COLLECTION_BORDER_WIDTH / 2;
            }
            if (gridRow === 0) {
                this.maxRowHeights[gridRow] -= COLLECTION_BORDER_WIDTH / 2;
            }
        }
        this.sumMaxColumnWidths();
        this.sumMaxRowHeights();
    }

    /**
     * Retrieves the width of the grid cell to the right of a specific column.
     * @param column Column to retrieve width for.
     * @returns Width of the grid cell to the right of the column.
     */
    public widthRightToColumn(column: number): number {
        let total = 0;
        for (let key in this.maxColumnWidths) {
            if (this.maxColumnWidths.hasOwnProperty(key) && parseInt(key) < column) {
                total += this.maxColumnWidths[key];
            }
        }
        return total;
    }

    /**
     * Retrieves the height of the grid cell below a specific row.
     * @param row Row to retrieve height for.
     * @returns Height of the grid cell below the row.
     */
    public heightDownToRow(row: number): number {
        let total = 0;
        for (let key in this.maxRowHeights) {
            if (this.maxRowHeights.hasOwnProperty(key) && parseInt(key) < row) {
                total += this.maxRowHeights[key];
            }
        }
        return total;
    }

    /**
     * Sums the maximum column widths to determine the width of the grid.
     */
    @action
    public sumMaxColumnWidths(): void {
        let total = 0;
        for (let column in this.maxColumnWidths) {
            if (this.maxColumnWidths.hasOwnProperty(column)) {
                total += this.maxColumnWidths[column];
            }
        }
        this.width = total;
    }

    /**
     * Sums the maximum row heights to determine the height of the grid.
     */
    @action
    public sumMaxRowHeights(): void {
        let total = 0;
        for (let key in this.maxRowHeights) {
            if (this.maxRowHeights.hasOwnProperty(key)) {
                total += this.maxRowHeights[key];
            }
        }
        this.height = total + TOOLBAR_HEIGHT;
    }


    /**
     * Moves all child nodes in front of the current node.
     */
    @action
    public moveChildrenInFront(): void {
        this.nodes.forEach(node => {
            node.setZIndex(false, this.zIndex + 1);
        });
    }

    /**
     * Deletes a node from the collection.
     * @param fullDeletion Whether the node should be fully deleted or just removed from its collection
     * Reason for this instead of having seperate delete node and remove node from collection methods is
     * for future implementations of move up collection feature.
     */
    @action
    override deleteNode(fullDeletion: boolean): void {
        super.deleteNode(fullDeletion);
        this.updateGridDimensions();
    }

    /**
     * Adds multiple nodes to the collection.
     * @param stores nodes to add to the collection.
     */
    @action
    override addNodes(nodes: NodeStore[]): void {
        nodes.forEach(node => {
            this.nodes.push(node);
            node.setZIndex(true);
            node.addToCollection(this);
            node.toCollectionAdd = false;
        });
        this.updateGridDimensions();

    }

    /**
     * Sets the zIndex of the node by retrieving it from the universal zIndex manager.
     * @param front Whether the node should be brought to the front.
     * @param alternativeZIndex An alternative zIndex value.
     */
    @action
    public override setZIndex(front: boolean, alternativeZIndex?: number): void {
        super.setZIndex(front, alternativeZIndex);
        this.moveChildrenInFront();
    }



}