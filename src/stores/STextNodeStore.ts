import { observable } from "mobx";
import { NodeStore } from "./NodeStore";

export class STextNodeStore extends NodeStore {

    /**
     * Constructs a new STextNodeStore instance.
     * @param initializer Partial object to initialize the properties of STextNodeStore.
     * This allows for optional overriding of properties from both STextNodeStore and NodeStore.
     */
    constructor(initializer: Partial<STextNodeStore>) {
        super();
        Object.assign(this, initializer);
    }

    @observable
    public text: string = "";

}