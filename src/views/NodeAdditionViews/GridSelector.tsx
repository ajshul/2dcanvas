import React from 'react';
import { NodeStore } from '../../stores';
import { GridCollectionStore } from '../../stores/GridCollectionStore';
import './GridSelector.scss';
import { TITLE_FIELD_PLACEHOLDER, NO_TITLE_WARNING_MESSAGE, NODE_ASSIGNMENT_WARNING_MESSAGE, STARTING_GRID_SELECTOR_SIZE, EXTRA_ROWS_TO_SHOW } from '../../constants';


interface GridSelectorProps {
    collection: GridCollectionStore;
    nodesToAdd: NodeStore[];
    onCancel: () => void;
    onConfirm: (node: NodeStore | null) => void;
    addingToCollection: boolean;
}

interface GridSelectorState {
    grid: boolean[][];
    dragging: boolean;
    selectedSize: { rows: number; columns: number };
    currentNodeIndex: number;
    done: boolean;
    assignmentDone: boolean;
}

/**
 * A component for selecting a grid for a collection node.
 */
export class GridSelector extends React.Component<GridSelectorProps, GridSelectorState> {
    constructor(props: GridSelectorProps) {
        super(props);
        let correctGrid = Array(10).fill(null).map(() => Array(10).fill(false));
        if (this.props.collection.nodes.length > 0) {
            const rows: number = this.props.collection.rowNumber;
            const columns: number = this.props.collection.colNumber;
            correctGrid = Array(rows + EXTRA_ROWS_TO_SHOW).fill(null).map(() => Array(columns + EXTRA_ROWS_TO_SHOW).fill(false));
            this.props.collection.nodes.forEach(node => {
                const newGrid = correctGrid.map(row => [...row]);
                newGrid[node.gridRow][node.gridColumn] = true;
                correctGrid = newGrid;
            });
            this.state = {
                grid: correctGrid,
                dragging: false,
                selectedSize: { rows: this.props.collection.rowNumber, columns: this.props.collection.colNumber },
                currentNodeIndex: 0,
                done: true,
                assignmentDone: false,
            };
            return;

        }

        this.state = {
            grid: correctGrid,
            dragging: false,
            selectedSize: { rows: 0, columns: 0 },
            currentNodeIndex: 0,
            done: false,
            assignmentDone: false,
        };


    }

    /**
     * Confirms the creation of a new collection node based on the input values.
     */
    handleConfirm = async () => {

        if (this.state.assignmentDone === false) {
            alert(NODE_ASSIGNMENT_WARNING_MESSAGE)
            return;
        }
        if (this.props.collection?.title === '') {
            alert(NO_TITLE_WARNING_MESSAGE)
            return;
        }
        if (this.props.collection) {
            if (!this.props.addingToCollection) {
                this.props.onConfirm(this.props.collection);
            } else {
                this.props.collection.updateGridDimensions();
                this.props.onConfirm(null);
            }
        }
    };

    /**
     * Handles changes to the collection title.
     * @param e text input event
     */
    handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.props.collection.title = e.target.value;
    };

    /**
     * Resets the grid to its initial state.
     */
    resetGrid = () => {
        this.setState({
            grid: Array(STARTING_GRID_SELECTOR_SIZE).fill(null).map(() => Array(STARTING_GRID_SELECTOR_SIZE).fill(false)),
            dragging: false,
            selectedSize: { rows: 0, columns: 0 },
            currentNodeIndex: 0,
            done: false,
            assignmentDone: false,
        });
    }

    /**
     * Handles the mouse down event on grid cells.
     */
    handleMouseDown = (rowIndex: number, columnIndex: number) => {
        if (!this.state.done) {
            this.setState({ dragging: true });
            this.updateGridSize(rowIndex, columnIndex);
        }
    };

    /**
     * Handles the mouse enter event on grid cells while dragging.
     */
    handleMouseEnter = (rowIndex: number, columnIndex: number) => {
        if (this.state.dragging) {
            this.updateGridSize(rowIndex, columnIndex);
        }
    };

    /**
     * Handles the mouse up event on grid cells.
     */
    handleMouseUp = (rowIndex: number, columnIndex: number) => {
        if ((rowIndex + 1) * (columnIndex + 1) < this.props.nodesToAdd.length) {
            alert("The size of the grid must fit all of the selected nodes.");
            this.resetGrid();
            return;
        }
        this.setState({ dragging: false, done: true });
        const selectedSize = { rows: rowIndex + 1, columns: columnIndex + 1 };
        this.setState({
            selectedSize: selectedSize,
            grid: Array(selectedSize.rows).fill(null).map(() => Array(selectedSize.columns).fill(false)),
        });
    };

    /**
     * Updates the grid size based on mouse interaction.
     */
    updateGridSize = (rowIndex: number, columnIndex: number) => {
        const newGrid = this.state.grid.map(row =>
            row.map(cell => false)
        );

        for (let row = 0; row <= rowIndex; row++) {
            for (let col = 0; col <= columnIndex; col++) {
                newGrid[row][col] = true;
            }
        }

        const selectedSize = { rows: rowIndex + 1, columns: columnIndex + 1 };


        this.setState({
            grid: newGrid,
            selectedSize: selectedSize,
        });
    }

    /**
     * Handles the click event on individual cells for node assignment.
     */
    handleCellClick = (rowIndex: number, columnIndex: number) => {
        const { currentNodeIndex, grid } = this.state;
        if (currentNodeIndex < this.props.nodesToAdd.length) {
            if (grid[rowIndex][columnIndex] !== true) {
                const newGrid = grid.map(row => [...row]);
                newGrid[rowIndex][columnIndex] = true;

                this.props.nodesToAdd[currentNodeIndex].gridRow = rowIndex;
                this.props.nodesToAdd[currentNodeIndex].gridColumn = columnIndex;

                const nextNodeIndex = currentNodeIndex + 1;
                const assignmentDone = nextNodeIndex === this.props.nodesToAdd.length;

                this.setState({
                    grid: newGrid,
                    currentNodeIndex: nextNodeIndex,
                    assignmentDone: assignmentDone,
                });
                if (assignmentDone) {
                    if (this.props.addingToCollection) this.props.collection.normalizeGrid(this.props.nodesToAdd.concat(this.props.collection.nodes));
                    else this.props.collection.normalizeGrid(this.props.nodesToAdd);
                    this.props.collection.addNodes(this.props.nodesToAdd)
                    this.props.nodesToAdd.forEach(nodes => {
                        nodes.addedCollection = this.props.collection;
                    });
                    this.setState({ assignmentDone: true });
                }
            } else {
                alert("This cell is already assigned to a node.")
            }
        }
    };

    /**
     * Renders the grid based on the current state.
     */
    renderGrid = () => {
        if (this.state.done || this.props.collection.nodes.length > 0) {
            return this.state.grid.map((row, rowIndex) => (
                <div key={rowIndex} style={{ display: 'flex' }}>
                    {row.map((cell, columnIndex) => (
                        <div
                            key={columnIndex}
                            className='grid-cell'
                            onClick={() => this.handleCellClick(rowIndex, columnIndex)}
                            style={{
                                width: '20px',
                                height: '20px',
                                border: '1px solid black',
                                backgroundColor: cell ? 'blue' : 'transparent',
                                cursor: 'pointer',
                                pointerEvents: this.state.assignmentDone ? 'none' : 'auto',
                            }}
                        />
                    ))}
                </div>
            ));
        } else {
            return this.state.grid.map((row, rowIndex) => (
                <div key={rowIndex} style={{ display: 'flex' }}>
                    {row.map((cell, columnIndex) => (
                        <div
                            key={columnIndex}
                            className='grid-cell'
                            onMouseDown={() => this.handleMouseDown(rowIndex, columnIndex)}
                            onMouseEnter={() => this.handleMouseEnter(rowIndex, columnIndex)}
                            onMouseUp={() => this.handleMouseUp(rowIndex, columnIndex)}
                            style={{
                                width: '20px',
                                height: '20px',
                                border: '1px solid black',
                                backgroundColor: cell ? 'blue' : 'transparent',
                            }}
                        />
                    ))}
                </div>
            ));
        }
    }

    /**
     * Renders text input fields for title and content.
     */
    renderTitleField = () => {
        if (!this.props.addingToCollection) {
            return (
                <>
                    <input type="text" placeholder={TITLE_FIELD_PLACEHOLDER} onChange={this.handleTitleChange} />
                </>
            )
        }
    };


    render() {
        const { currentNodeIndex, assignmentDone, selectedSize } = this.state;
        return (
            <div className='confirmation-popup'>
                <div
                    className='grid-selector'
                    onMouseLeave={() => this.handleMouseUp}
                    style={{ userSelect: 'none' }}
                >
                    <div className='grid-display'>
                        {this.renderGrid()}
                    </div>

                    <div className='info-panel'>Rows: {selectedSize.rows + 1} x Columns: {selectedSize.columns + 1}</div>
                    {currentNodeIndex < this.props.nodesToAdd.length && (
                        <div className='assignment-info'>Assign: {this.props.nodesToAdd[currentNodeIndex].title}</div>
                    )}
                    {assignmentDone && <div className='done-message'>Done</div>}
                    {this.renderTitleField()}
                </div>
                <div className="popup-buttons">
                    <button onClick={this.props.onCancel}>Cancel</button>
                    <button onClick={this.handleConfirm}>{this.props.addingToCollection ? 'Add' : 'Create'}</button>
                </div>
            </div>
        );
    }
}