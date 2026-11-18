/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Event } from '../types';
import { EventDetails } from '../components/EventDetails';
import { PageShell } from '../components/PageShell';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function PublicEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      if (!id) {
        setError('No event identifier specified');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const docRef = doc(db, 'events', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setEvent({ id: docSnap.id, ...docSnap.data() } as Event);
        } else {
          setError('Event not found or has been unpublished by the host.');
        }
      } catch (err: any) {
        console.error('Failed to load event:', err);
        setError('Failed to load event details. Please check your network connection.');
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <PageShell>
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">
            Loading Event Access Protocol...
          </p>
        </div>
      </PageShell>
    );
  }

  if (error || !event) {
    return (
      <PageShell>
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-white">Event Unavailable</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {error || 'This event does not exist or may have been removed.'}
            </p>
          </div>
          <Button
            onClick={() => navigate('/discover')}
            className="bg-purple-600 hover:bg-purple-500 text-xs font-bold uppercase tracking-wider rounded-xl gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Discover Other Events</span>
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Helmet>
        <title>{`${event.title} | VUX Events`}</title>
        <meta name="description" content={event.description || `Join ${event.title} on VUX Events.`} />
        <meta property="og:title" content={`${event.title} | VUX Events`} />
        <meta property="og:description" content={event.description || `Join ${event.title} on VUX Events.`} />
        {event.coverImageUrl && <meta property="og:image" content={event.coverImageUrl} />}
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${event.title} | VUX Events`} />
        <meta name="twitter:description" content={event.description || `Join ${event.title} on VUX Events.`} />
        {event.coverImageUrl && <meta name="twitter:image" content={event.coverImageUrl} />}
      </Helmet>

      <div className="pt-24 pb-20">
        <EventDetails
          event={event}
          onClose={() => navigate('/discover')}
        />
      </div>
    </PageShell>
  );
}
