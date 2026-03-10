import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, CheckSquare, Clock, Plus, ChevronLeft, ChevronRight, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CalendarView() {
  const [view, setView] = useState<'month'|'week'|'day'>('week');
  
  // Generating a simple mock grid for the week view
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM
  const days = ['Mon, 12', 'Tue, 13', 'Wed, 14', 'Thu, 15', 'Fri, 16'];

  const mockEvents = [
    { day: 0, hour: 10, duration: 1, title: "Discovery Call", type: "meeting", color: "bg-blue-500/20 text-blue-700 border-blue-200" },
    { day: 0, hour: 14, duration: 1.5, title: "Follow-up Task (Automated)", type: "task", color: "bg-orange-500/20 text-orange-700 border-orange-200" },
    { day: 2, hour: 11, duration: 1, title: "Demo: Acme Corp", type: "meeting", color: "bg-purple-500/20 text-purple-700 border-purple-200" },
    { day: 3, hour: 9, duration: 0.5, title: "Send Proposal", type: "task", color: "bg-orange-500/20 text-orange-700 border-orange-200" },
    { day: 4, hour: 15, duration: 1, title: "Team Sync", type: "meeting", color: "bg-slate-500/20 text-slate-700 border-slate-200" },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
            <span className="font-semibold text-lg ml-2">March 2026</span>
          </div>
        </div>
        
        <div className="flex gap-3 items-center">
          <div className="flex bg-muted/50 p-1 rounded-md border">
            {['day', 'week', 'month'].map(v => (
              <button 
                key={v}
                onClick={() => setView(v as any)}
                className={`px-3 py-1 text-sm font-medium rounded-sm capitalize transition-colors ${view === v ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {v}
              </button>
            ))}
          </div>
          <Button className="gap-2 h-9">
            <Plus className="w-4 h-4" />
            Create
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Sidebar / Mini Calendar */}
        <div className="w-64 hidden lg:flex flex-col gap-6 shrink-0 overflow-y-auto pb-4">
          <Card className="glass border-none shadow-none bg-muted/30">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Mini Calendar</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="w-full aspect-square bg-background rounded-md border flex items-center justify-center text-muted-foreground text-sm">
                [Calendar Component]
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4 px-1">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Calendars</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary focus:ring-primary" />
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                Meetings (Calendly)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary focus:ring-primary" />
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                Automated CRM Tasks
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary focus:ring-primary" />
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                Personal Google Cal
              </label>
            </div>
          </div>
        </div>

        {/* Main Calendar Grid */}
        <Card className="flex-1 glass overflow-hidden flex flex-col">
          <div className="flex border-b">
            <div className="w-16 shrink-0 border-r" /> {/* Time column header */}
            {days.map((day, i) => (
              <div key={day} className="flex-1 text-center py-3 border-r last:border-r-0">
                <span className={`text-sm font-medium ${i === 0 ? 'text-primary bg-primary/10 px-2 py-1 rounded-md' : 'text-muted-foreground'}`}>
                  {day}
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex-1 overflow-y-auto relative">
            <div className="flex min-w-full">
              {/* Time labels */}
              <div className="w-16 shrink-0 border-r bg-background/50 sticky left-0 z-10">
                {hours.map(hour => (
                  <div key={hour} className="h-20 border-b text-xs text-muted-foreground text-right pr-2 pt-2">
                    {hour === 12 ? '12 PM' : hour > 12 ? `${hour-12} PM` : `${hour} AM`}
                  </div>
                ))}
              </div>
              
              {/* Grid cells */}
              {days.map((day, dayIndex) => (
                <div key={day} className="flex-1 border-r last:border-r-0 relative min-w-[120px]">
                  {hours.map(hour => (
                    <div key={hour} className="h-20 border-b border-border/50 transition-colors hover:bg-muted/30 cursor-pointer" />
                  ))}
                  
                  {/* Events */}
                  {mockEvents.filter(e => e.day === dayIndex).map((event, i) => (
                    <div 
                      key={i}
                      className={`absolute left-1 right-1 rounded-md p-2 border ${event.color} shadow-sm backdrop-blur-md cursor-pointer hover:brightness-95 transition-all`}
                      style={{ 
                        top: `${(event.hour - 8) * 5}rem`,
                        height: `${event.duration * 5}rem`,
                        zIndex: 5
                      }}
                    >
                      <div className="text-xs font-semibold leading-tight">{event.title}</div>
                      <div className="text-[10px] mt-1 opacity-80 flex items-center gap-1">
                        {event.type === 'meeting' ? <User className="w-3 h-3"/> : <CheckSquare className="w-3 h-3"/>}
                        {event.hour}:00 - {event.hour + event.duration}:00
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            
            {/* Current time indicator */}
            <div className="absolute left-16 right-0 border-t-2 border-red-500 z-20 pointer-events-none flex items-center" style={{ top: '12.5rem' }}>
              <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}