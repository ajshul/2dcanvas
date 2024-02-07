/**
 * ZIndexManager is a singleton class that manages the z-index of elements.
 */
class ZIndexManager {
    private static instance: ZIndexManager;
    private currentZIndex: number;

    private constructor() {
        this.currentZIndex = 0; // Starting z-index value of 0
    }

    /**
     * Handles the retrieval of the ZIndexManager instance.
     * @returns The ZIndexManager instance.
     */
    public static getInstance(): ZIndexManager {
        if (!ZIndexManager.instance) {
            ZIndexManager.instance = new ZIndexManager();
        }
        return ZIndexManager.instance;
    }

    /**
     * Retrieves the next z-index value.
     * @returns The next z-index value.
     */
    public getNewZIndex(): number {
        this.currentZIndex += 1;
        return this.currentZIndex;
    }
}

export const zIndexManager = ZIndexManager.getInstance();
