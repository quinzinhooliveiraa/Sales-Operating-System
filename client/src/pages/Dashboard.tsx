import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar as CalendarIcon, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Good morning, John</h1>
        <p className="text-muted-foreground mt-2">Here's what's happening with your pipeline today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-primary/10">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Leads (This Week)</CardTitle>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +12% from last week
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass border-primary/10">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Meetings</CardTitle>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">3 scheduled for today</p>
          </CardContent>
        </Card>

        <Card className="glass border-primary/10">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks</CardTitle>
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-orange-600 font-medium mt-1">5 overdue follow-ups</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your upcoming meetings and tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { time: "10:00 AM", title: "Discovery Call with Acme Corp", type: "meeting" },
              { time: "11:30 AM", title: "Follow up with Sarah", type: "task" },
              { time: "02:00 PM", title: "Product Demo: TechFlow", type: "meeting" },
              { time: "04:00 PM", title: "Send proposal to Innovate Inc", type: "task" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-16 text-sm font-medium text-muted-foreground shrink-0 pt-0.5">{item.time}</div>
                <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${item.type === 'meeting' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events in your pipeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { user: "Sarah M.", action: "booked a meeting", time: "10 mins ago", avatar: "SM" },
              { user: "Mike T.", action: "moved to Negotiation", time: "1 hour ago", avatar: "MT" },
              { user: "System", action: "generated 3 follow-up tasks", time: "2 hours ago", avatar: "OS" },
              { user: "Alex W.", action: "completed qualification form", time: "3 hours ago", avatar: "AW" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-2">
                <Avatar className="w-8 h-8 text-xs border">
                  <AvatarFallback className={item.user === 'System' ? 'bg-primary/20 text-primary' : ''}>
                    {item.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{item.user}</span> {item.action}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-2">View All Activity</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}