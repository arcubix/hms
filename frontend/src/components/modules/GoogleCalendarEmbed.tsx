import { Card, CardContent } from '../ui/card';

interface GoogleCalendarEmbedProps {
  calendarUrl?: string;
  height?: string;
  calendarId?: string;
}

export function GoogleCalendarEmbed({ 
  calendarUrl, 
  height = '700px',
  calendarId 
}: GoogleCalendarEmbedProps) {
  // Build Google Calendar embed URL
  // If calendarId is provided, use it; otherwise use the provided calendarUrl
  let embedUrl: string;
  
  if (calendarUrl) {
    embedUrl = calendarUrl;
  } else if (calendarId) {
    // Encode the calendar ID for URL
    const encodedCalendarId = encodeURIComponent(calendarId);
    embedUrl = `https://calendar.google.com/calendar/embed?height=700&wkst=1&bgcolor=%23ffffff&ctz=UTC&src=${encodedCalendarId}&color=%23039BE5&mode=WEEK`;
  } else {
    // Default: Show Google Calendar in week view
    embedUrl = 'https://calendar.google.com/calendar/embed?height=700&wkst=1&bgcolor=%23ffffff&ctz=UTC&mode=WEEK';
  }
  
  return (
    <Card>
      <CardContent className="p-0">
        <div style={{ height, width: '100%', minHeight: height }}>
          <iframe
            src={embedUrl}
            style={{
              border: '0',
              width: '100%',
              height: '100%',
              minHeight: height,
            }}
            title="Google Calendar"
            allowFullScreen
          />
        </div>
      </CardContent>
    </Card>
  );
}

