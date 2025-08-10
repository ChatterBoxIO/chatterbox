const axios = require('axios');
const io = require('socket.io-client');

class ChatterBox {
    constructor(config) {
        if (!config.authorizationToken) {
            throw new Error('Authorization token is required');
        }

        this.authorizationToken = config.authorizationToken;
        this.apiBaseUrl = config.apiBaseUrl || 'https://bot.chatter-box.io';
        this.wsBaseUrl = config.wsBaseUrl || 'https://ws.chatter-box.io';
    }

    async getTemporaryToken(expiresIn = 3600) {
        try {
            if (expiresIn < 60 || expiresIn > 86400) {
                throw new Error('Expiration time must be between 60 and 86400 seconds');
            }

            const response = await axios.post(`${this.apiBaseUrl}/token`, {
                expiresIn
            }, {
                headers: {
                    Authorization: `Bearer ${this.authorizationToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                token: response.data.token,
                expiresIn: response.data.expiresIn
            };
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                throw new Error(error.response.data.message);
            } else if (error.request) {
                throw new Error('No response from server. Please check your network or try again later.');
            } else {
                throw new Error('Unexpected error: ' + error.message);
            }
        }
    }

    async sendBot({platform, meeting_id, meeting_password, bot_name = 'ChatterBox', webhook_url, model = 'nova-3', language = 'multi', noTranscriptTimeoutSeconds}) {
        try {
            if (!platform || (typeof meeting_id !== 'string' && typeof meeting_id !== 'number') || String(meeting_id).trim() === '') {
                throw new Error('Platform and meeting ID are required');
            }

            if (!this.authorizationToken) {
                throw new Error('Authorization token is missing or invalid');
            }

            if (noTranscriptTimeoutSeconds !== undefined && typeof noTranscriptTimeoutSeconds !== 'number') {
                throw new Error('noTranscriptTimeoutSeconds must be a number when provided');
            }

            const payload = {
                platform,
                meetingId: String(meeting_id),
                meetingPassword: meeting_password || '',
                botName: bot_name,
                webhookUrl: webhook_url,
                model,
                language
            };

            if (noTranscriptTimeoutSeconds !== undefined) {
                payload.noTranscriptTimeoutSeconds = noTranscriptTimeoutSeconds;
            }

            const response = await axios.post(`${this.apiBaseUrl}/join`, payload, {
                headers: {
                    Authorization: `Bearer ${this.authorizationToken}`,
                },
            });

            const sessionId = response.data.sessionId;
            return { id: sessionId };
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                throw new Error(error.response.data.message);
            } else if (error.request) {
                throw new Error('No response from server. Please check your network or try again later.');
            } else {
                throw new Error('Unexpected error: ' + error.message);
            }
        }
    }

    connectSocket(sessionId, callbacks) {
        const socket = io(this.wsBaseUrl, {
            auth: {token: this.authorizationToken},
            query: {sessionId},
        });

        socket.on('connect', () => {
            socket.emit('joinSession', {sessionId});
        });

        socket.on('started', (data) => {
            if (callbacks.onMeetingStarted) callbacks.onMeetingStarted(data);
        });

        socket.on('finished', (data) => {
            if (callbacks.onMeetingFinished) callbacks.onMeetingFinished(data);
        });

        socket.on('transcript', (data) => {
            if (callbacks.onTranscriptReceived) callbacks.onTranscriptReceived(data);
        });

        return socket;
    }
}

function createChatterBoxClient(config) {
    return new ChatterBox(config);
}

module.exports = {ChatterBox: createChatterBoxClient};