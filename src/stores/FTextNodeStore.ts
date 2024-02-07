import { observable, action } from "mobx";
import { NodeStore } from "./NodeStore";

/**
 * Represents a text node, extending the base NodeStore.
 */
export class FTextNodeStore extends NodeStore {

    @observable
    public text: string = "";

    /**
     * Constructs a new FTextNodeStore instance.
     * @param initializer Partial object to initialize the properties of FTextNodeStore.
     * This allows for optional overriding of properties from both FTextNodeStore and NodeStore.
     */
    constructor(initializer: Partial<FTextNodeStore>) {
        super();
        Object.assign(this, initializer);
    }

    /**
     * Sets the text of the node.
     * @param newText The new text to be set for the node.
     */
    @action
    setText(newText: string): void {
        this.text = newText;
    }
}
