# Testing the live muhurat

The invitation changes by itself on 09.08.2026. You don't have to wait for the day — or change your phone's clock — to see it.

## The three ways to test

**1. Jump straight into the live ceremony**

```
https://yourdomain.com/?rehearsal=1
```

The full-screen ceremony opens immediately: "शुभमंगल सावधान", the akshata button, the live counters. Tap away. This is the one to show family.

**2. Time-travel to any moment**

`?at=` pretends the clock is a number of minutes past the muhurat. Negative means before.

| URL | What you'll see |
|---|---|
| `/?at=-40` | Nothing yet — too early for the banner |
| `/?at=-20` | The quiet banner: "Live ceremony opens in 20:00" |
| `/?at=-1` | Banner with **Join live** now enabled, countdown ticking |
| `/?at=0` | The moment itself — akshata throwing opens |
| `/?at=15` | Still live, mid-ceremony |
| `/?at=45` | Closed again; the wishes wall stays open |

Combine with language: `/?at=0&lang=mr`.

**3. On the day itself**

Nothing to do — it runs on its own, timed to the akshata at **12:00 PM IST**:

| Time | What happens |
|---|---|
| 11:30 am | A quiet banner appears for anyone with the link |
| 11:58 am | **Join live** becomes tappable, countdown running |
| **12:00 pm** | The ceremony opens — remote guests throw akshata at the same moment you do |
| 12:30 pm | It closes gracefully; the wishes wall stays open |

The whole window follows `CONFIG.weddingISO` in `lib/config.js`, so if the muhurat shifts, change that one line and everything moves with it.

## Check that it's actually working

The akshata counter is shared across everyone, so open the rehearsal on two devices and confirm the number climbs on both. Then look at `/admin` — the dashboard shows **Akshata thrown** and how many devices joined.

## Before the day

Rehearsal taps count toward the real total. To reset it once you're done testing, either clear the row in phpMyAdmin:

```sql
UPDATE ceremony SET akshata = 0 WHERE id = 1;
DELETE FROM ceremony_guests;
```

…or, if you're still on the JSON file, delete `data/kv.json`.

**Time zone note:** the muhurat is defined with `+05:30` in `lib/config.js`, so the ceremony opens at the right IST moment regardless of where a guest's phone thinks it is. A cousin in Dubai joins at 09:30 their time, automatically.
