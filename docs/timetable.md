# Emploi du temps

## API contract

The timetable uses the existing EcoleDirecte authentication tokens and request
transport already provided by `App.jsx`.

- Method: `POST`
- Route: `/v3/E/{studentId}/emploidutemps.awp?verbe=get&v={apiVersion}`
- Headers: `X-Token`, `2FA-Token`, and
  `Content-Type: application/x-www-form-urlencoded`
- Body:

```text
data={"dateDebut":"YYYY-MM-DD","dateFin":"YYYY-MM-DD","avecTrous":false}
```

The response `data` array is normalized inside the timetable component. The
implementation consumes the course identifier, subject, subject code, start
and end dates, color, teacher, room, class/group, cancellation and modification
flags, exemption value, and the session-content/homework flags. Boolean API
values are accepted as booleans, numeric flags, or string flags.

Each timetable response is enriched with the authenticated upcoming-homework
response from `/v3/Eleves/{studentId}/cahierdetexte.awp`. Homework is matched by
due date and subject code, with a normalized subject-name fallback. Opening a
course that advertises homework or session content lazily requests
`/v3/Eleves/{studentId}/cahierdetexte/YYYY-MM-DD.awp`, then displays the real
sanitized content, completion/interrogation state, and downloadable attachments.

The endpoint is always called with the selected student's id and the `E` role,
including when the authenticated account is a family account.

## Supported behavior

- Week view, Monday through Saturday by default, with optional Saturday and Sunday toggles
- Three-day view including weekend days when they fall in the selected period
- One-day dashboard preview that switches to tomorrow after today's courses end
- Three-day navigation advances continuously in three-day increments, including across week boundaries
- Dynamic time range based on the first and last visible events
- Previous/next week navigation and return to today
- Loading, refresh, empty, error, and expired-session states
- Cancelled, modified, exempted, homework, and session-content indicators
- Alternating gray-and-yellow construction outlines for modified classes and homework icons at every course size
- Name-priority rendering for short classes with long subjects
- Course details with teacher, room, group, code, date, time, and duration
- Current-day and current-time indicators
- Side-by-side columns for overlapping courses
- Homework icons for pending, completed, and interrogation work
- Hide/show cancelled courses
- iCalendar export and print options for homework icons and cancelled courses
- Keyboard-focusable controls and course cards
- Responsive day selection for compact screens
