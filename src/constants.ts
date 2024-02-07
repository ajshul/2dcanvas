export const COLLECTION_BORDER_WIDTH: number = 5;
export const TOOLBAR_HEIGHT: number = 20;
export const MINIMUM_NODE_SIZE: number = 100;
export const STARTING_NODE_SIZE: number = 500;
export const INVALID_URL_MESSAGE: string = "Invalid URL. Please enter a valid, absolute URL.";
export const URL_REGEX: RegExp = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i');
export const TEXT_FIELD_PLACEHOLDER: string = "Enter text here...";
export const TITLE_FIELD_PLACEHOLDER: string = "Enter title here...";
export const URL_FIELD_PLACEHOLDER: string = "Enter URL here...";
export const EXTRA_ROWS_TO_SHOW: number = 2;
export const NODE_ASSIGNMENT_WARNING_MESSAGE: string = "Please assign nodes to the collection";
export const NO_TITLE_WARNING_MESSAGE: string = "Please enter a title";
export const STARTING_GRID_SELECTOR_SIZE: number = 10;
export const IMAGE_API_FAILURE_MESSAGE: string = "Failed to generate image. Please check the API key and prompt.";
export const TOO_MANY_NODES_WARNING_MESSAGE: string = "Please only select one node.";
export const NO_COLLECTIONS_WARNING_MESSAGE: string = "There are no collections selected.";
export const TOO_MANY_COLLECTIONS_WARNING_MESSAGE: string = "Please only select one collection.";
export const CHAT_TEXT_FIELD_PLACEHOLDER: string = "Provide a system message to guide your helpful assistant... (e.g. 'You are a math tutor who is an expert at multivariable calculus.')";
export const OPENAI_API_KEY_PLACEHOLDER: string = "Enter OpenAI API key here...";
export const COHERE_API_KEY_PLACEHOLDER: string = "Enter Cohere API key here...";
