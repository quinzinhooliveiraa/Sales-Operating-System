import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search, Plus, Menu, Settings, HelpCircle, User, Grid } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

export default function CalendarView() {
  const { events } = useAppContext();
  const [view, setView] = useState<'month'|'week'|'day'>('week');
  
  const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23
  const days = [
    { name: 'ter', date: '10', active: true },
    { name: 'qua', date: '11', active: false },
    { name: 'qui', date: '12', active: false },
    { name: 'sex', date: '13', active: false },
    { name: 'sáb', date: '14', active: false },
    { name: 'dom', date: '15', active: false },
    { name: 'seg', date: '16', active: false },
  ];

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col bg-white text-slate-900 -m-4 font-sans">
      {/* Top Header matching Google Calendar style */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-gray-600 hover:bg-gray-100 rounded-full">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-lg">
              31
            </div>
            <span className="text-xl font-medium hidden sm:inline-block text-gray-700">Agenda</span>
          </div>
          
          <div className="flex items-center gap-4 ml-6">
            <Button variant="outline" className="h-9 px-4 hidden sm:flex border-gray-300 text-gray-700 font-medium hover:bg-gray-50 rounded-md">Hoje</Button>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 hover:bg-gray-100 rounded-full"><ChevronRight className="w-4 h-4" /></Button>
            </div>
            <h2 className="text-[22px] font-normal text-gray-800 min-w-[140px] ml-2">março 2026</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 mr-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-600 hover:bg-gray-100 rounded-full"><Search className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-600 hover:bg-gray-100 rounded-full"><HelpCircle className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-600 hover:bg-gray-100 rounded-full"><Settings className="w-5 h-5" /></Button>
          </div>
          
          <div className="flex items-center bg-transparent rounded-md border border-gray-300 p-0.5 mr-2 hover:bg-gray-50 transition-colors">
            <select 
              className="h-8 bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer outline-none px-2 pr-6"
              value={view}
              onChange={(e) => setView(e.target.value as any)}
            >
              <option value="day">Dia</option>
              <option value="week">Semana</option>
              <option value="month">Mês</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 hidden sm:flex text-gray-600 hover:bg-gray-100 rounded-full"><Grid className="w-5 h-5" /></Button>
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-medium cursor-pointer">
              Q
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[256px] flex flex-col hidden lg:flex shrink-0 bg-white border-r border-gray-100">
          <div className="p-3 pl-2">
            <Button className="h-[48px] rounded-full px-4 pr-6 flex items-center gap-3 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all border border-gray-200 shadow-sm ml-2">
              <svg width="36" height="36" viewBox="0 0 36 36"><path fill="#34A853" d="M16 16v14h4V20z"></path><path fill="#4285F4" d="M30 16H20l-4 4h14z"></path><path fill="#FBBC05" d="M6 16v4h10l4-4z"></path><path fill="#EA4335" d="M20 16V6h-4v14z"></path><path fill="none" d="M0 0h36v36H0z"></path></svg>
              <span className="font-medium text-sm">Criar</span>
            </Button>
          </div>

          {/* Mini Calendar Mock */}
          <div className="px-6 pb-4 pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-800">março 2026</span>
              <div className="flex">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-600 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-600 hover:bg-gray-100 rounded-full"><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium mb-1 text-gray-500">
              <div>D</div>
              <div>S</div>
              <div>T</div>
              <div>Q</div>
              <div>Q</div>
              <div>S</div>
              <div>S</div>
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] text-gray-700">
              {/* Previous month days */}
              <div className="text-gray-400 p-1 flex items-center justify-center rounded-full w-6 h-6 mx-auto">23</div>
              <div className="text-gray-400 p-1 flex items-center justify-center rounded-full w-6 h-6 mx-auto">24</div>
              <div className="text-gray-400 p-1 flex items-center justify-center rounded-full w-6 h-6 mx-auto">25</div>
              <div className="text-gray-400 p-1 flex items-center justify-center rounded-full w-6 h-6 mx-auto">26</div>
              <div className="text-gray-400 p-1 flex items-center justify-center rounded-full w-6 h-6 mx-auto">27</div>
              <div className="text-gray-400 p-1 flex items-center justify-center rounded-full w-6 h-6 mx-auto">28</div>
              <div className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer w-6 h-6 mx-auto">1</div>
              
              {/* Current month */}
              <div className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer w-6 h-6 mx-auto">2</div>
              <div className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer w-6 h-6 mx-auto">3</div>
              <div className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer w-6 h-6 mx-auto">4</div>
              <div className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer w-6 h-6 mx-auto">5</div>
              <div className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer w-6 h-6 mx-auto">6</div>
              <div className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer w-6 h-6 mx-auto">7</div>
              <div className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer w-6 h-6 mx-auto">8</div>
              
              <div className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer w-6 h-6 mx-auto">9</div>
              <div className="bg-blue-600 text-white p-1 flex items-center justify-center rounded-full cursor-pointer w-6 h-6 mx-auto font-medium">10</div>
              <div className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer w-6 h-6 mx-auto">11</div>
              <div className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer w-6 h-6 mx-auto bg-blue-50 text-blue-700 font-bold">12</div>
              <div className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer w-6 h-6 mx-auto">13</div>
              <div className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer w-6 h-6 mx-auto">14</div>
              <div className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer w-6 h-6 mx-auto">15</div>
              
              <div className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer w-6 h-6 mx-auto">16</div>
              <div className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer w-6 h-6 mx-auto">17</div>
              <div className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer w-6 h-6 mx-auto">18</div>
              <div className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer w-6 h-6 mx-auto">19</div>
              <div className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer w-6 h-6 mx-auto">20</div>
              <div className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer w-6 h-6 mx-auto">21</div>
              <div className="p-1 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer w-6 h-6 mx-auto">22</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="space-y-4">
              <div className="relative mb-4 mt-2 px-2">
                <User className="absolute left-4 top-2.5 h-4 w-4 text-gray-500" />
                <Input placeholder="Encontrar com..." className="h-9 pl-9 text-sm bg-gray-100/80 border-none rounded-md text-gray-700 placeholder:text-gray-500" />
              </div>

              <div className="space-y-3">
                {/* Account 1 */}
                <div>
                  <h4 className="text-[13px] font-medium text-gray-800 mb-1 flex items-center justify-between group cursor-pointer hover:bg-gray-100 p-1.5 -mx-1.5 rounded-md transition-colors">
                    quinzinhooliveira@gmail.com
                    <ChevronLeft className="w-4 h-4 -rotate-90 text-gray-500" />
                  </h4>
                  <div className="space-y-0.5 ml-1">
                    <label className="flex items-center gap-3 text-[13px] cursor-pointer group py-1">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded-sm border-gray-300 text-pink-500 focus:ring-pink-500" style={{ accentColor: '#ec4899' }} />
                      <span className="truncate text-gray-700">quinzinhooliveira@g...</span>
                    </label>
                    <label className="flex items-center gap-3 text-[13px] cursor-pointer group py-1">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded-sm border-gray-300 text-emerald-500 focus:ring-emerald-500" style={{ accentColor: '#10b981' }} />
                      <span className="truncate text-gray-700">Holidays in Brazil</span>
                    </label>
                    <label className="flex items-center gap-3 text-[13px] cursor-pointer group py-1">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded-sm border-gray-300 text-blue-500 focus:ring-blue-500" style={{ accentColor: '#3b82f6' }} />
                      <span className="truncate text-gray-700">Real Madrid Calendar</span>
                    </label>
                  </div>
                </div>

                {/* Account 2 */}
                <div className="pt-2 border-t border-gray-100">
                  <h4 className="text-[13px] font-medium text-gray-800 mb-1 flex items-center justify-between group cursor-pointer hover:bg-gray-100 p-1.5 -mx-1.5 rounded-md transition-colors mt-2">
                    oliveirasocial74@gmail.com
                    <ChevronLeft className="w-4 h-4 -rotate-90 text-gray-500" />
                  </h4>
                  <div className="space-y-0.5 ml-1">
                    <label className="flex items-center gap-3 text-[13px] cursor-pointer group py-1 opacity-80">
                      <input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300 text-yellow-500 focus:ring-yellow-500" style={{ accentColor: '#eab308' }} />
                      <span className="truncate text-gray-700">oliveirasocial74...</span>
                    </label>
                    <label className="flex items-center gap-3 text-[13px] cursor-pointer group py-1 opacity-80">
                      <input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300 text-orange-500 focus:ring-orange-500" style={{ accentColor: '#f97316' }} />
                      <span className="truncate text-gray-700">Feriados no Brasil</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
          {/* Days Header */}
          <div className="flex shrink-0 ml-14 pt-4 pb-2 z-10 bg-white">
            <div className="w-12 shrink-0 flex flex-col justify-end pb-2">
              <div className="flex flex-col text-[10px] text-gray-500 font-medium gap-1 items-end pr-2">
                <span>GMT-3</span>
              </div>
            </div>
            {days.map((day, i) => (
              <div key={day.date} className="flex-1 text-center border-l border-gray-200 min-w-[100px] flex flex-col items-center justify-center pt-2">
                <span className={`text-[11px] font-medium uppercase mb-1 ${day.active ? 'text-blue-600' : 'text-gray-500'}`}>
                  {day.name}
                </span>
                <div className={`text-2xl w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer transition-colors ${day.active ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700'}`}>
                  {day.date}
                </div>
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="flex-1 overflow-y-auto relative bg-white">
            <div className="flex min-w-full relative h-[1440px]"> {/* 24h * 60px */}
              {/* Time Column */}
              <div className="w-[104px] shrink-0 bg-white sticky left-0 z-20">
                <div className="h-6 border-b border-gray-200 text-[10px] text-gray-500 text-right pr-2 flex items-center justify-end">
                  Dia todo
                </div>
                {hours.map(hour => (
                  <div key={hour} className="h-[60px] text-[10px] text-gray-500 text-right pr-2 relative -top-2.5 font-medium">
                    {hour === 0 ? '' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour-12} PM`}
                  </div>
                ))}
              </div>
              
              {/* All day row grid */}
              <div className="absolute top-0 left-[104px] right-0 flex h-6 border-b border-gray-200 bg-white z-10">
                {days.map((day) => (
                  <div key={`allday-${day.date}`} className="flex-1 border-l border-gray-200 min-w-[100px]"></div>
                ))}
              </div>

              {/* Main Grid Columns */}
              <div className="absolute top-6 left-[104px] right-0 flex bottom-0">
                {days.map((day, dayIndex) => (
                  <div key={`grid-${day.date}`} className="flex-1 border-l border-gray-200 relative min-w-[100px]">
                    {hours.map(hour => (
                      <div key={hour} className="h-[60px] border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors relative group">
                        {/* Half hour line (visible on hover) */}
                        <div className="absolute top-1/2 left-0 right-0 h-px border-t border-gray-200 opacity-0 group-hover:opacity-100" />
                      </div>
                    ))}
                    
                    {/* Mock Events Overlay */}
                    {events.map((event, i) => {
                      // Match by simple array index for mockup purposes
                      if (i % 7 !== dayIndex) return null;

                      return (
                        <div 
                          key={event.id}
                          className={`absolute left-0 right-3 rounded-md px-2 py-1 mx-1 ${event.style || 'bg-blue-500 text-white'} shadow-sm cursor-pointer hover:shadow-md transition-all text-xs overflow-hidden border border-white/20`}
                          style={{ 
                            top: `${(event.hour) * 60}px`,
                            height: `${(event.duration) * 60 - 2}px`,
                            zIndex: 10
                          }}
                        >
                          <div className="font-medium truncate leading-tight text-white">{event.title}</div>
                          <div className="text-[10px] mt-0.5 text-white/90 leading-tight">
                            {event.hour}:00 - {event.hour + event.duration}:00
                          </div>
                        </div>
                      )
                    })}

                    {/* Current Time Indicator (mocked for Tuesday) */}
                    {day.active && (
                      <div className="absolute left-0 right-0 flex items-center z-10" style={{ top: `${(20.9) * 60}px` }}> {/* ~20:54 */}
                        <div className="w-3 h-3 rounded-full bg-red-500 -ml-[6px]"></div>
                        <div className="h-[2px] bg-red-500 flex-1 shadow-sm"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}