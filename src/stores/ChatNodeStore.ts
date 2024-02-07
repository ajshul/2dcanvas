import { observable, action } from "mobx";
import { NodeStore, StoreType } from "./NodeStore";
import * as https from 'https'
import axios, { AxiosInstance } from 'axios';


interface ChatMessage {
    role: "USER" | "CHATBOT";
    message: string;
}


export class ChatNodeStore extends NodeStore {
    @observable public messages: ChatMessage[] = [];
    private axiosInstance: AxiosInstance | null = null;


    constructor(initializer: Partial<ChatNodeStore> = {}) {
        super();
        this.type = StoreType.Chat;
        Object.assign(this, initializer);

    }


    @action
    setApiKey(apiKey: string): void {
        this.axiosInstance = axios.create({
            baseURL: 'https://api.cohere.ai',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });
    }


    public async addMessageAndFetchResponse(message: string) {
        this.messages.push({ role: "USER", message: message });

        try {
            if (!this.axiosInstance) {
                throw new Error('API key not set');
            }
            const response = await this.axiosInstance.post('/v1/chat', {
                chat_history: this.messages,
                message: message,
                connectors: [{ id: 'web-search' }],
            });
            this.messages.push({ role: "CHATBOT", message: response.data.text });
            return;
        } catch (error) {
            this.messages.push({ role: "CHATBOT", message: "Sorry, I'm having trouble connecting to the server." });
            throw error;
            return;
        }
    }
}
