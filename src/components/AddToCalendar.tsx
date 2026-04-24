/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Calendar, ExternalLink } from 'lucide-react';
import { Event } from '../types';
import { Button } from './ui/Button';

interface AddToCalendarProps {
  event: Event;
  className?: string;
}

export function AddToCalendar({ event, className }: AddToCalendarProps) {
  const eventDate = new Date(event.date);
  // Default duration 1 hour
  const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000);

  const formatTime = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&dates=${formatTime(eventDate)}/${formatTime(endDate)}`;

  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&startdt=${eventDate.toISOString()}&enddt=${endDate.toISOString()}`;

  const yahooUrl = `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${encodeURIComponent(event.title)}&st=${formatTime(eventDate)}&dur=0100&desc=${encodeURIComponent(event.description)}&in_loc=${encodeURIComponent(event.location)}`;

  const generateIcs = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `URL:${window.location.href}`,
      `DTSTART:${formatTime(eventDate)}`,
      `DTEND:${formatTime(endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${event.location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={className}>
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Add to Calendar</p>
        <div className="grid grid-cols-2 gap-2">
            <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white/5 border-white/5 hover:bg-white/10 text-xs py-1 h-auto"
                onClick={() => window.open(googleUrl, '_blank')}
            >
                Google
            </Button>
            <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white/5 border-white/5 hover:bg-white/10 text-xs py-1 h-auto"
                onClick={() => window.open(outlookUrl, '_blank')}
            >
                Outlook
            </Button>
            <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white/5 border-white/5 hover:bg-white/10 text-xs py-1 h-auto"
                onClick={() => window.open(yahooUrl, '_blank')}
            >
                Yahoo
            </Button>
            <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white/5 border-white/5 hover:bg-white/10 text-xs py-1 h-auto"
                onClick={generateIcs}
            >
                iCal / ICS
            </Button>
        </div>
      </div>
    </div>
  );
}
