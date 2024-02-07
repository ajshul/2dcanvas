import { observable } from "mobx";
import { NodeStore } from "./NodeStore";

export class VideoNodeStore extends NodeStore {

    /**
     * Constructs a new VideoNodeStore instance.
     * @param initializer Partial object to initialize the properties of VideoNodeStore.
     * This allows for optional overriding of properties from both VideoNodeStore and NodeStore.
     */
    constructor(initializer: Partial<VideoNodeStore>) {
        super();
        Object.assign(this, initializer);
    }

    @observable
    public url: string = "";

}