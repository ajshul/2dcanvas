import React, { Component } from 'react';
import { NodeStore, STextNodeStore, FTextNodeStore, VideoNodeStore, ChatNodeStore, StoreType, WebNodeStore } from '../../stores';
import './ConfirmationPopup.scss';
import { ImageSelector } from './ImageSelector';
import { STARTING_NODE_SIZE, INVALID_URL_MESSAGE, URL_REGEX, COHERE_API_KEY_PLACEHOLDER, CHAT_TEXT_FIELD_PLACEHOLDER, TEXT_FIELD_PLACEHOLDER, TITLE_FIELD_PLACEHOLDER, URL_FIELD_PLACEHOLDER } from '../../constants';


interface ConfirmationPopupProps {
    nodeType: StoreType;
    onConfirm: (node: NodeStore | null) => void;
    onCancel: () => void;
}

interface ConfirmationPopupState {
    nodeTitle: string;
    content: string;
}

/**
 * A popup component for confirming the creation of different types of nodes.
 */
export class ConfirmationPopup extends Component<ConfirmationPopupProps, ConfirmationPopupState> {
    constructor(props: ConfirmationPopupProps) {
        super(props);
        this.state = {
            nodeTitle: '',
            content: '',
        };
    }

    /**
     * Handles changes to the node title.
     */
    handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ nodeTitle: e.target.value });
    };

    /**
     * Handles changes to the node content.
     */
    handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        this.setState({ content: e.target.value });
    };


    /**
     * Confirms the creation of a new node based on the type and input values.
     */
    handleConfirm = async () => {

        if (this.state.nodeTitle === '' || this.state.content === '') {
            alert("Please fill in all fields")
            this.props.onCancel();
            return;
        }
        const newNode = this.createNodeByType();
        this.props.onConfirm(newNode);
    };

    /**
     * Creates a new node based on the selected node type.
     */
    createNodeByType = (): NodeStore | null => {
        const { nodeType } = this.props;
        const { nodeTitle, content } = this.state;

        switch (nodeType) {
            case StoreType.SText:
                return new STextNodeStore({ type: StoreType.SText, x: STARTING_NODE_SIZE, y: STARTING_NODE_SIZE, title: nodeTitle, text: content });
            case StoreType.FText:
                return new FTextNodeStore({ type: StoreType.FText, x: STARTING_NODE_SIZE, y: STARTING_NODE_SIZE, title: nodeTitle, text: content });
            case StoreType.Video:
                return new VideoNodeStore({ type: StoreType.Video, x: STARTING_NODE_SIZE, y: STARTING_NODE_SIZE, title: nodeTitle, url: content });
            case StoreType.Chat:
                let chatNode: ChatNodeStore = new ChatNodeStore({ type: StoreType.Chat, x: STARTING_NODE_SIZE, y: STARTING_NODE_SIZE, title: nodeTitle });
                chatNode.setApiKey(this.state.content);
                return chatNode;
            case StoreType.Webpage:
                return this.createWebNode(content, nodeTitle);
            default:
                return null;
        }
    };

    /**
     * Creates a WebNodeStore if the provided URL is valid.
     */
    createWebNode = (url: string, title: string): NodeStore | null => {
        if (this.isValidUrl(url)) {
            return new WebNodeStore({ type: StoreType.Webpage, x: STARTING_NODE_SIZE, y: STARTING_NODE_SIZE, title, url });
        } else {
            window.alert(INVALID_URL_MESSAGE);
            return null;
        }
    };

    /**
     * Validates the given URL.
     */
    isValidUrl = (url: string): boolean => {
        const urlPattern = URL_REGEX; // fragment locator

        return urlPattern.test(url) && new URL(url).origin !== window.location.origin;
    };


    /**
     * Renders input fields based on the selected node type.
     */
    renderFields = () => {
        const { nodeType } = this.props;
        const { nodeTitle, content } = this.state;

        switch (nodeType) {
            case StoreType.SText:
            case StoreType.FText:
            case StoreType.Chat:
                return this.renderTextInputFields(nodeTitle, content, nodeType);
            case StoreType.Video:
            case StoreType.Webpage:
                return this.renderUrlInputFields(nodeTitle, content);
            default:
                return null;
        }
    };

    /**
     * Renders text input fields for title and content.
     */
    renderTextInputFields = (title: string, content: string, nodeType: StoreType) => (
        <>
            <input type="text" placeholder={TITLE_FIELD_PLACEHOLDER} value={title} onChange={this.handleTitleChange} />
            {nodeType !== StoreType.Chat && <textarea placeholder={TEXT_FIELD_PLACEHOLDER} value={content} onChange={this.handleContentChange} />}
            {nodeType === StoreType.Chat && <input placeholder={COHERE_API_KEY_PLACEHOLDER} onChange={this.handleContentChange} />}

        </>
    );

    /**
     * Renders input fields for title and URL.
     */
    renderUrlInputFields = (title: string, url: string) => (
        <>
            <input type="text" placeholder={TITLE_FIELD_PLACEHOLDER} value={title} onChange={this.handleTitleChange} />
            <input type="text" placeholder={URL_FIELD_PLACEHOLDER} value={url} onChange={this.handleContentChange} />
        </>
    );

    render() {
        const { nodeType } = this.props;
        switch (nodeType) {
            case StoreType.Image:
                return (
                    <ImageSelector onAdd={this.props.onConfirm} onCancel={this.props.onCancel} />
                );
            default:
                return (
                    <div className="confirmation-popup">
                        {this.renderFields()}
                        <div className="popup-buttons">
                            <button onClick={this.props.onCancel}>Cancel</button>
                            <button onClick={this.handleConfirm}>Create</button>
                        </div>
                    </div>
                );
        }
    }
}