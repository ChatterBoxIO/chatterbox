# ChatterBox Client

The **ChatterBox Client** is an easy-to-use JavaScript/TypeScript package that allows you to integrate your applications with popular video conferencing platforms. With this package, you can deploy bots to meetings, retrieve real-time meeting events, and access live transcripts with just a few lines of code.

## Features

- **Send Bots to Meetings**: Easily deploy a bot to your video conferencing meetings. Currently, Zoom and Google Meet are supported.
- **Real-Time Transcription**: Receive live transcripts of ongoing meetings.
- **WebSocket Integration**: Get real-time meeting events such as meeting start, finish, and transcript updates.
- **Customizable**: Set your own bot names and optionally customize API and WebSocket base URLs.
- **Temporary Tokens**: Generate short-lived tokens for enhanced security in client-side applications.

## Installation

You can install the ChatterBox Client via npm:

```bash
npm install @chatterboxio/bot
```

## Usage

### Basic Example

To use the ChatterBox client, initialize it with your authorization token and deploy a bot to a meeting:

```javascript
import { ChatterBox } from "@chatterboxio/bot";

const client = ChatterBox({
  authorizationToken: "YOUR_ACCESS_TOKEN",
});

async function startBot() {
  try {
    const { id } = await client.sendBot({
      platform: "zoom",
      meeting_id: "1234567890",
      meeting_password: "your-meeting-password",
      bot_name: "MyCustomBot", // Optional bot name
    });

    console.log("Bot started, session ID:", id);

    // Connecting to the WebSocket for real-time events
    const socket = client.connectSocket(id, {
      onMeetingStarted: (data) => console.log("Meeting started:", data),
      onMeetingFinished: (data) => console.log("Meeting finished:", data),
      onTranscriptReceived: (data) => console.log("Transcript:", data),
    });

    // Close the socket when the process exits
    process.on("exit", () => socket.close());
  } catch (error) {
    console.error("Error:", error.message);
  }
}

startBot();
```

### Parameters for sendBot

- platform: The platform to send the bot to ('zoom', 'googlemeet').
- meeting_id: The ID of the meeting (numeric ID for Zoom, 'xxx-xxx-xxx' for Google Meet).
- meeting_password: (Optional) The meeting password.
- bot_name: (Optional) Customize the name of the bot. Default is 'ChatterBox'.
- webhook_url: (Optional) The webhook URL to send the meeting events to.

### WebSocket Event Callbacks

- onMeetingStarted: Triggered when the meeting starts.
- onMeetingFinished: Triggered when the meeting ends.
- onTranscriptReceived: Triggered when a transcript update is received.

### Utility Functions

#### Generating Temporary Tokens

For enhanced security in client-side applications, you can generate temporary tokens:

```javascript
import { ChatterBox } from "@chatterboxio/bot";

const client = ChatterBox({
  authorizationToken: "YOUR_ACCESS_TOKEN",
});

async function getTemporaryToken() {
  try {
    // Generate a token that expires in 1 hour (3600 seconds)
    const { token, expiresIn } = await client.getTemporaryToken(3600);

    // Use the temporary token for client-side operations
    const clientSideClient = ChatterBox({
      authorizationToken: token,
    });

    // The token will automatically expire after the specified time
    console.log("Temporary token expires in:", expiresIn, "seconds");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

getTemporaryToken();
```

#### Parameters for getTemporaryToken

- expiresIn: (Optional) The duration in seconds for which the token should be valid. Must be between 60 and 86400 seconds (1 minute to 24 hours). Defaults to 3600 seconds (1 hour).

## Getting Your Access Token

To use the ChatterBox client, you need an access token. You can request your access token by signing up at our website: https://chatter-box.io/.

Once you have your token, you can use it to initialize the ChatterBox client as shown in the examples above.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
