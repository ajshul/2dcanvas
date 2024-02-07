import React from 'react';
import { ImageNodeStore, NodeCollectionStore, NodeStore, StoreType } from '../../stores';
import { IMAGE_API_FAILURE_MESSAGE, TITLE_FIELD_PLACEHOLDER, OPENAI_API_KEY_PLACEHOLDER } from '../../constants';

interface ImageSelectorProps {
    onAdd: (node: NodeStore) => void;
    onCancel: () => void;
}

enum ImageType {
    UPLOAD = 1,
    GENERATE
}

interface ImageSelectorState {
    nodeTitle: string;
    imageFile: File | null;
    imageOption: ImageType;
    dallePrompt: string;
    openaiApiKey: string;
    isLoading: boolean;
}



/**
 * A component for selecting a grid for a collection node.
 */
export class ImageSelector extends React.Component<ImageSelectorProps, ImageSelectorState> {
    constructor(props: ImageSelectorProps) {
        super(props);
        this.state = {
            nodeTitle: '',
            imageFile: null,
            imageOption: ImageType.UPLOAD, // 'upload' or 'generate'
            dallePrompt: '',
            openaiApiKey: '',
            isLoading: false,
        };
    }

    /**
     * Handles changes to the image file input.
     * @param e 
     */
    handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            this.setState({ imageFile: file });
        }
    };

    /**
     * Handles changes to the node title.
     * @param e text input event
     */
    handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ nodeTitle: e.target.value });
    };

    /**
     * Handles changes to the image option.
     * @param e text input event
     */
    handleImageOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        switch (e.target.value) {
            case 'upload':
                this.setState({ imageOption: ImageType.UPLOAD });
                break;
            case 'generate':
                this.setState({ imageOption: ImageType.GENERATE });
                break;
            default:
                break;
        }
    };

    /**
     * Handles changes to the DALL-E prompt.
     * @param e text input event
     */
    handleDallePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ dallePrompt: e.target.value });
        this.setState({ nodeTitle: e.target.value });
    };

    /**
     * Handles changes to the OpenAI API key.
     * @param e text input event
     */
    handleOpenaiApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ openaiApiKey: e.target.value });
    };

    /**
     * Renders the image options based on the selected image option.
     * @returns image options
     */
    renderImageOptions = () => {
        const { nodeTitle } = this.state;
        return (
            <div className='image-options'>
                <select className='image-option-select' value={this.state.imageOption} onChange={this.handleImageOptionChange}>
                    <option value="upload">Upload Image</option>
                    <option value="generate">Image Generation</option>
                </select>
                <div className="image-option-content">
                    {this.state.imageOption === ImageType.UPLOAD && (
                        <>
                            <input type="text" placeholder={TITLE_FIELD_PLACEHOLDER} value={nodeTitle} onChange={this.handleTitleChange} />
                            <input type="file" onChange={this.handleImageChange} accept="image/*" />
                        </>
                    )}
                    {this.state.imageOption === ImageType.GENERATE && (
                        <>
                            <input type="text" placeholder="DALL-E Prompt" value={this.state.dallePrompt} onChange={this.handleDallePromptChange} />
                            <input type="text" placeholder={OPENAI_API_KEY_PLACEHOLDER} value={this.state.openaiApiKey} onChange={this.handleOpenaiApiKeyChange} />
                        </>
                    )}
                </div>
            </div>
        );
    };

    /**
     * Handles the creation of an image node based on the selected image option.
     * @returns 
     */
    handleImageCreation = async () => {
        const imageNode = new ImageNodeStore({ type: StoreType.Image, x: 500, y: 500, title: this.state.nodeTitle });
        if (this.state.imageOption === ImageType.GENERATE) {
            this.setState({ isLoading: true });

            const requestBody = JSON.stringify({
                model: 'dall-e-3',
                prompt: this.state.dallePrompt,
                n: 1,
                size: '1024x1024'
            });

            try {
                const response = await fetch('https://api.openai.com/v1/images/generations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.state.openaiApiKey}`
                    },
                    body: requestBody
                });

                if (!response.ok) {
                    const errorResponse = await response.text();
                    alert(IMAGE_API_FAILURE_MESSAGE);
                    this.props.onCancel();
                    return;
                }

                const data = await response.json();
                imageNode.url = data.data[0].url;
                this.props.onAdd(imageNode);
                this.setState({ isLoading: false });
            } catch (error) {
                alert(IMAGE_API_FAILURE_MESSAGE);
                this.props.onCancel();
                this.setState({ isLoading: false });
            }
        } else {
            if (this.state.imageFile) {
                this.setState({ isLoading: true });
                //file to URL (in future, change to storing file in server...)
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (reader.result) {
                        imageNode.url = reader.result.toString();
                        this.props.onAdd(imageNode);
                    }
                };
                reader.readAsDataURL(this.state.imageFile);
                this.setState({ isLoading: false });
            }
        }
        return;
    }

    render() {
        const { onCancel } = this.props;
        const { isLoading } = this.state;

        if (isLoading) {
            return (
                <div className="confirmation-popup">
                    <div className="loading-animation">
                        Loading<span className="loading-dots"></span>
                    </div>
                </div>
            );
        }
        return (
            <div className="confirmation-popup">
                {this.renderImageOptions()}
                <div className="popup-buttons">
                    <button onClick={this.props.onCancel}>Cancel</button>
                    <button onClick={this.handleImageCreation}>Create</button>
                </div>
            </div>
        );
    }
}