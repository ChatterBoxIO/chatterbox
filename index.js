const axios = require('axios');
const io = require('socket.io-client');

class ChatterBox {
    constructor(config) {
        if (!config.authorizationToken) {
            throw new Error('Authorization token is required');
        }

        this.authorizationToken = config.authorizationToken;
        this.apiBaseUrl = config.apiBaseUrl || 'https://zoom.chatter-box.io';
        this.wsBaseUrl = config.wsBaseUrl || 'https://ws.chatter-box.io';
    }

    async sendBot({platform, meeting_id, meeting_password, bot_name = 'ChatterBox'}) {
        if (!platform || !meeting_id) {
            throw new Error('Platform and meeting ID are required');
        }

        const payload = {
            platform,
            meetingId: meeting_id,
            meetingPassword: meeting_password || '',
            botName: bot_name,
        };

        try {
            const response = await axios.post(`${this.apiBaseUrl}/join`, payload, {
                headers: {
                    Authorization: `Bearer ${this.authorizationToken}`,
                },
            });

            const sessionId = response.data.sessionId;
            return {id: sessionId};
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to send bot to meeting');
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
