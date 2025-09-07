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
        webhook_url?: string;
        model?: string;
        language?: string;
        noTranscriptTimeoutSeconds?: number;
        noParticipantsLeftTimeoutSeconds?: number;
    }

    export interface TemporaryTokenResponse {
        token: string;
        expiresIn: number;
    }

    export function ChatterBox(config: ChatterBoxConfig): {
        sendBot: (options: SendBotOptions) => Promise<{ id: string }>;
        getTemporaryToken: (expiresIn?: number) => Promise<TemporaryTokenResponse>;
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
