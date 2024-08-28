declare module '@chatterboxio/bot' {
    export interface ChatterBoxConfig {
        authorizationToken: string;
        apiBaseUrl?: string;
        wsBaseUrl?: string;
    }

    export interface SendBotOptions {
        platform: string;
        meeting_id: string;
        meeting_password?: string;
        bot_name?: string;
    }

    export function ChatterBox(config: ChatterBoxConfig): {
        sendBot: (options: SendBotOptions) => Promise<{ id: string }>;
        connectSocket: (
            sessionId: string,
            callbacks: {
                onMeetingStarted?: (data: any) => void;
                onMeetingFinished?: (data: any) => void;
                onTranscriptReceived?: (data: any) => void;
            }
        ) => any;
    };
}
