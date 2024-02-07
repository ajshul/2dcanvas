import React from 'react';
import { observer } from "mobx-react";
import { FTextNodeStore } from "../../../stores";
import { TopBar } from "../TopBar";
import "./../NodeView.scss";
import "./FTextNodeView.scss";
import { ResizeHandles } from "../ResizeHandles";

interface FTextNodeProps {
    store: FTextNodeStore;
}

interface FTextNodeState {
    isEditing: boolean;
    text: string;
}

/**
 * View component for a formattable text node.
 */
@observer
export class FTextNodeView extends React.Component<FTextNodeProps, FTextNodeState> {
    private textAreaRef: React.RefObject<HTMLTextAreaElement>;

    constructor(props: FTextNodeProps) {
        super(props);
        this.state = {
            isEditing: false,
            text: props.store.text,
        };
        this.textAreaRef = React.createRef();
    }

    /**
     * Adds a listener for clicks outside of the text area to save and exit editing mode.
     */
    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside, true);
    }

    /**
     * Removes the listener for clicks outside of the text area when the component is unmounted.
     */
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside, true);
    }

    /**
     * Handles click outside of the text area to save and exit editing mode.
     */
    handleClickOutside = (event: MouseEvent) => {
        if (this.textAreaRef.current && !this.textAreaRef.current.contains(event.target as Node)) {
            this.saveAndExitEditing();
        }
    };

    /**
     * Saves the current text and exits editing mode.
     */
    saveAndExitEditing = () => {
        this.setState({ isEditing: false });
        this.props.store.setText(this.state.text);
    };

    /**
     * Enters editing mode on double click.
     */
    handleDoubleClick = () => {
        this.setState({ isEditing: true }, () => {
            this.textAreaRef.current?.focus();
        });
    };

    /**
     * Handles changes to the text in the textarea.
     */
    handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({ text: event.target.value });
    };

    /**
     * Renders the editable textarea when in editing mode.
     */
    renderEditableTextArea = (text: string) => (
        <textarea
            ref={this.textAreaRef}
            className="editable-textarea"
            value={text}
            onChange={this.handleChange}
            onBlur={this.saveAndExitEditing}
            autoFocus
        />
    );

    /**
     * Renders the text content when not in editing mode.
     */
    renderContent = (text: string) => (
        <div className="content paragraph" onDoubleClick={this.handleDoubleClick}>
            {text}
        </div>
    );

    render() {
        const { store } = this.props;
        const { isEditing, text } = this.state;

        return (
            <div className={`node textNode`} style={{ transform: store.transform, height: store.getHeight, width: store.getWidth, zIndex: store.zIndex }}>
                <TopBar store={store} />
                <ResizeHandles store={store} />
                <div className="scroll-box">
                    <h3 className="title">{store.title}</h3>
                    {isEditing ? this.renderEditableTextArea(text) : this.renderContent(text)}
                </div>
            </div>
        );
    }


}
