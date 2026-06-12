# VUX Events Integration Documentation

Welcome to the VUX Events Integration guide. This document explains how you can integrate the powerful VUX Events engine (including ticketing, QR codes, and automated emails via SMTP) into your own platforms, such as DevOS.

## The Two-Part System

Integrating VUX Events into your app consists of two pieces:
1. **The VUX React SDK:** A drop-in UI component that renders the event management or RSVP flow.
2. **The VUX REST API:** The backend layer that securely handles the data, sends the SMTP emails, and fires Webhooks back to your system.

---

## Step 1: Getting an API Key

Before integrating the SDK, you need to authenticate your app.
1. Log into the **VUX Events Admin Dashboard**.
2. Navigate to the **API & Integrations** section.
3. Click **Generate API Key** and copy your token (e.g., `vux_live_12345...`).
4. Keep this secure. You will pass this into the React SDK.

---

## Step 2: Installing the SDK

In your target project (e.g., **DevOS**), you will bring in the VUX SDK.
*(Note: During development, you can simply copy the `@vux-events/react` folder into your project. Eventually, this will be an NPM package.)*

```bash
# If using NPM (future state)
npm install @vux-events/react
```

---

## Step 3: Using the SDK Components

You can replace your custom event pages with the drop-in VUX widget.

### Displaying an Event

To render an interactive Event Page that allows users to RSVP:

```tsx
import { VUXEventWidget } from '@vux-events/react';

export default function DevOSEventPage() {
  return (
    <div className="event-container">
      <VUXEventWidget 
        apiKey={process.env.NEXT_PUBLIC_VUX_API_KEY} 
        eventId="vux_event_98765" 
        
        // Pass the logged-in DevOS user so they can "Guest RSVP" automatically
        currentUser={{
          name: "John Doe",
          email: "john@devos.com"
        }}
      />
    </div>
  );
}
```

### What happens when they click RSVP?
When a user clicks RSVP in the widget:
1. The SDK securely passes their `name` and `email` to the VUX API.
2. VUX automatically generates the ticket and QR code.
3. VUX sends the ticket directly to `john@devos.com` using its native SMTP server.
4. John does **not** need to create a password or log into VUX Events.

---

## Step 4: Webhooks (Data Syncing)

Because your app (DevOS) needs to display the event details in its own database, VUX Events will automatically keep you in sync.

When an event is created, updated, or when someone RSVPs, VUX Events will send a `POST` request to your webhook URL.

**Example Webhook Payload:**
```json
{
  "event": "event.upgraded",
  "data": {
    "vuxEventId": "vux_event_98765",
    "title": "Hackathon 2026",
    "description": "...",
    "date": "2026-08-15T10:00:00Z",
    "totalRsvps": 42
  }
}
```

You can configure your Webhook URL in the VUX Events Admin Dashboard.

---

## Support
For any questions regarding integration, please reach out to the VUX infrastructure team.
