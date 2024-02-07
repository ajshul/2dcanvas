import * as React from 'react';
import { observer } from "mobx-react";
import { ChatNodeStore } from "../../../stores";
import "./../NodeView.scss";
import { TopBar } from "./../TopBar";
import { ResizeHandles } from "../ResizeHandles";
import "./ChatNodeView.scss";

interface ChatNodeProps {
    store: ChatNodeStore;
}

@observer
export class ChatNodeView extends React.Component<ChatNodeProps> {
    private handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const textInput = event.currentTarget.elements.namedItem("messageInput") as HTMLInputElement;
        const text = textInput.value.trim();
        if (text) {
            this.props.store.addMessageAndFetchResponse(text);
            textInput.value = "";
        }
    };


    render() {
        const { store } = this.props;
        return (
            <div className="node chatNode" style={{ transform: store.transform, height: store.getHeight, width: store.getWidth, zIndex: store.zIndex }}>
                <TopBar store={store} />
                <ResizeHandles store={store} />
                <div className="scroll-box chat-content">
                    <div className="messages">
                        {store.messages.map((message, index) => (
                            <div key={index} className={`message ${message.role.toLowerCase()}`}>
                                <span>{message.message}</span>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={this.handleSendMessage} className="chat-form">
                        <input type="text" name="messageInput" autoComplete="off" placeholder="Type a message..." />
                        <button type="submit">Send</button>
                    </form>
                </div>
            </div>
        );
    }
}
