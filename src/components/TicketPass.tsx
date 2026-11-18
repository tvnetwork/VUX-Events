/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Download,
  Calendar,
  MapPin,
  Clock,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Zap,
  Globe,
  Share2,
} from 'lucide-react';
import { Event, RSVP } from '../types';
import { formatDate, cn } from '../lib/utils';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

interface TicketPassProps {
  event: Event;
  rsvp: RSVP;
  onClose?: () => void;
}

export function TicketPass({ event, rsvp, onClose }: TicketPassProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const ticketCode = rsvp.ticketCode || `VUX-TKT-${(rsvp.id || 'VALID').substring(0, 8).toUpperCase()}`;
  const verificationUrl = `${window.location.origin}/events/${event.id}?checkin=${ticketCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(ticketCode);
    setCopied(true);
    toast.success('Ticket code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);

    try {
      // High-res canvas capture
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#07070a',
        scale: 3,
        useCORS: true,
        logging: false,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      pdf.setFillColor(7, 7, 10);
      pdf.rect(0, 0, pdfWidth, pdf.internal.pageSize.getHeight(), 'F');
      pdf.addImage(imgData, 'PNG', margin, 20, contentWidth, contentHeight);

      const safeTitle = event.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
      pdf.save(`VUX-Ticket-${safeTitle}-${ticketCode}.pdf`);
      toast.success('Official PDF Ticket downloaded!');
    } catch (err) {
      console.error('Failed to export ticket PDF:', err);
      toast.error('Failed to generate PDF. You can also print the pass directly.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadICS = () => {
    const startStr = `${event.date.replace(/-/g, '')}T${(event.time || '10:00').replace(':', '')}00Z`;
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PROID:-//VUX Events//Ticket Pass//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${event.title}`,
      `DESCRIPTION:Your ticket pass: ${ticketCode}\\n${event.description || ''}`,
      `LOCATION:${event.isVirtual ? 'Virtual Meeting' : event.location}`,
      `DTSTART:${startStr}`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `VUX-${event.title.substring(0, 20)}.ics`;
    link.click();
    toast.success('Calendar event saved');
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-300">
            {rsvp.status === 'approved' ? 'Verified Ticket Pass' : `Status: ${rsvp.status.toUpperCase()}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="font-mono">{ticketCode}</span>
          </button>

          <button
            onClick={handleDownloadICS}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
            title="Add to Calendar"
          >
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Calendar</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-purple-900/40 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Exporting...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Printable / Renderable Ticket Element */}
      <div
        ref={ticketRef}
        className="w-full max-w-xl mx-auto rounded-[32px] overflow-hidden bg-[#0a0a0f] border border-white/10 shadow-2xl relative text-left"
        style={{
          boxShadow: '0 25px 60px -15px rgba(168, 85, 247, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Decorative ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Header Ribbon */}
        <div className="p-6 sm:p-8 border-b border-white/[0.08] relative bg-gradient-to-r from-purple-950/20 via-black to-zinc-950">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="VUX" className="w-10 h-10 rounded-xl border border-white/10 shadow-md" />
              <div>
                <span className="text-[10px] font-black tracking-[0.25em] uppercase text-purple-400 block">
                  VUX NETWORK ACCESS
                </span>
                <span className="text-sm font-black tracking-tight text-white uppercase">OFFICIAL PASS</span>
              </div>
            </div>

            <div className="text-right">
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                rsvp.status === 'approved' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                rsvp.status === 'waitlist' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                "bg-amber-500/10 text-amber-400 border-amber-500/20"
              )}>
                <ShieldCheck className="w-3 h-3" />
                {rsvp.status}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
              EVENT ADMISSION
            </span>
            <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-white leading-tight">
              {event.title}
            </h2>
          </div>
        </div>

        {/* Pass Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Key Event Details Grid */}
          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-white/[0.06]">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-purple-400" /> DATE
              </span>
              <p className="text-sm font-bold text-white">
                {formatDate(event.date, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-400" /> TIME
              </span>
              <p className="text-sm font-bold text-white">{event.time || 'Schedule on Event'}</p>
            </div>

            <div className="col-span-2 space-y-1 pt-2">
              <span className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-purple-400" /> LOCATION
              </span>
              <p className="text-sm font-bold text-white break-words">
                {event.isVirtual || event.category === 'Webinar' ? 'Online Virtual Infrastructure' : event.location}
              </p>
            </div>
          </div>

          {/* Attendee & QR Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/[0.02] p-5 rounded-2xl border border-white/[0.06]">
            <div className="space-y-3 text-center sm:text-left flex-1 min-w-0">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">ADMITTED ATTENDEE</span>
                <p className="text-base font-bold text-white truncate">{rsvp.userDisplayName || 'Registered Guest'}</p>
                <p className="text-xs font-mono text-zinc-400 truncate">{rsvp.userEmail}</p>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">TICKET IDENTIFIER</span>
                <code className="text-sm font-mono font-bold text-purple-400 tracking-wider">
                  {ticketCode}
                </code>
              </div>

              {rsvp.checkedIn && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                  <Check className="w-3.5 h-3.5" /> Checked In
                </div>
              )}
            </div>

            {/* High-Contrast QR Code */}
            <div className="p-3 bg-white rounded-2xl shadow-xl shrink-0 flex flex-col items-center">
              <QRCodeCanvas
                value={verificationUrl}
                size={140}
                level="H"
                includeMargin={false}
              />
              <span className="text-[8px] font-mono font-bold text-black uppercase mt-1 tracking-wider">
                SCAN FOR ENTRY
              </span>
            </div>
          </div>

          {/* Security & Verification Notice */}
          <div className="pt-2 text-center text-zinc-500 space-y-1">
            <p className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">
              NON-TRANSFERABLE SINGLE-ADMISSION PASS
            </p>
            <p className="text-[9px] text-zinc-600 leading-tight">
              Present this pass at event check-in. The QR code links to your cryptographically verified registration record on the VUX network.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
