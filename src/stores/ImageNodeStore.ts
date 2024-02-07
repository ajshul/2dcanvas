import { observable } from "mobx";
import { NodeStore } from "./NodeStore";


/**
 * Represents an image node, extending the base NodeStore.
 */
export class ImageNodeStore extends NodeStore {

    /**
     * Constructs a new ImageNodeStore instance.
     * @param initializer Partial object to initialize the properties of ImageNodeStore.
     * This allows for optional overriding of properties from both ImageNodeStore and NodeStore.
     */
    constructor(initializer: Partial<ImageNodeStore>) {
        super();
        Object.assign(this, initializer);
    }

    @observable
    public url: string = "";

}