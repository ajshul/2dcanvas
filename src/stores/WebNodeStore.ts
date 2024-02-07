import { action, observable } from "mobx";
import { NodeStore } from "./NodeStore";

export class WebNodeStore extends NodeStore {

    /**
     * Constructs a new WebNodeStore instance.
     * @param initializer Partial object to initialize the properties of WebNodeStore.
     * This allows for optional overriding of properties from both WebNodeStore and NodeStore.
     */
    constructor(initializer: Partial<WebNodeStore>) {
        super();
        Object.assign(this, initializer);
    }

    @observable
    public url: string = "";

    /**
     * Sets the url of the webpage node.
     * @param newURL the url to set
     */
    @action
    setURL(newURL: string) {
        this.url = newURL;
    }


}