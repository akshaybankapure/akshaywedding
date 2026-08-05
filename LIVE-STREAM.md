# Live streaming the muhurat

**On the day, you don't need to touch code at all** — log in to `/admin`, go to the **Live stream** tab, paste the link and press Save. It appears for every guest within a minute, including those who already have the page open. Hand `FOR-THE-HELPER.md` to whoever is helping.

The value in `lib/config.js` below is only the fallback used before anyone sets one:

```js
stream: {
  url: "https://meet.google.com/abc-defg-hij",
  label: "Watch the muhurat live",
  note: "Opens at 11:45 AM. Keep yourself on mute — Aaji will notice.",
},
```

It then appears in two places: in the day section (so people find it in advance) and inside the live ceremony at 12:00.

## Google Meet vs YouTube Live — read this before choosing

**Google Meet cannot be embedded in a web page.** Google sends an `X-Frame-Options` header that blocks it, and there is no workaround — anyone who tells you otherwise is describing something that renders a blank box. So a Meet link gets a large **Join the live stream** button instead, which opens the Meet app properly on phones. That works well; it just isn't *inside* the invitation.

**A YouTube Live link plays embedded**, right in the page. For a wedding this is usually the better choice:

| | Google Meet | YouTube Live |
|---|---|---|
| Plays inside the invitation | No — opens the app | **Yes** |
| Participant limit | 100 on a free account | Unlimited |
| Guests need an account | Often yes | No |
| Someone can accidentally unmute | Yes | No |
| Can be replayed afterwards | No | Yes, automatically |

For a hundred relatives who mostly want to *watch*, YouTube Live (set to **Unlisted**) is calmer: no cap, no accidental interruptions during the mangalashtak, and the recording survives for people who missed it. Use Meet only if you want guests to talk back.

The invitation detects which you've used automatically — `youtube.com/live/…`, `youtu.be/…` and `youtube.com/watch?v=…` all embed; anything else becomes a join button.

## Streaming to YouTube from a phone

The simplest path on the day: open the YouTube app on a well-charged phone on a tripod, **Create → Go live**, set visibility to *Unlisted*, and paste the share link into `stream.url`. Do a five-minute test the night before — mobile live streaming sometimes needs the channel verified 24 hours in advance, which is not something to discover at 11:50 AM.

Leave `url` empty and nothing shows at all.


## Which YouTube links work

| Link shape | Result |
|---|---|
| `youtu.be/xxxxxxxx` | Embeds ✓ |
| `youtube.com/live/xxxxxxxx` | Embeds ✓ |
| `youtube.com/watch?v=xxxxxxxx` | Embeds ✓ |
| `youtube.com/channel/UCxxxx/live` | Embeds ✓ (whatever that channel is streaming) |
| `youtube.com/@name/live` | **Won't embed** — no video id in the URL |

Always use YouTube's **Share** button rather than copying the browser address bar from a channel page. The admin panel rejects the `@name/live` form with an explanation rather than silently falling back to a button.
