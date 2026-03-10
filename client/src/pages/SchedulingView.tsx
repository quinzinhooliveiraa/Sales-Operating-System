import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Link as LinkIcon, Settings2, Copy, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SchedulingView() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scheduling</h1>
          <p className="text-muted-foreground mt-2">Manage your event types, forms, and availability.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Event Type
        </Button>
      </div>

      <Tabs defaultValue="event-types" className="w-full">
        <TabsList className="grid w-full sm:w-auto grid-cols-3 mb-6 bg-muted/50 p-1">
          <TabsTrigger value="event-types">Event Types</TabsTrigger>
          <TabsTrigger value="forms">Qualification Forms</TabsTrigger>
          <TabsTrigger value="settings">Availability</TabsTrigger>
        </TabsList>
        
        <TabsContent value="event-types" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Discovery Call", duration: "30 min", type: "1-on-1", color: "bg-blue-500" },
              { title: "Product Demo", duration: "45 min", type: "1-on-1", color: "bg-purple-500" },
              { title: "Onboarding Session", duration: "60 min", type: "Group", color: "bg-emerald-500" },
            ].map((event, i) => (
              <Card key={i} className="glass overflow-hidden group hover:shadow-md transition-all">
                <div className={`h-2 w-full ${event.color}`} />
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Settings2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                  <CardDescription>{event.duration} • {event.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="pt-2 flex items-center justify-between border-t border-border/50">
                    <Button variant="link" className="text-primary p-0 h-auto gap-1 text-sm font-medium">
                      <Copy className="w-3 h-3" /> Copy Link
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="forms" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Inbound Lead Form</CardTitle>
                  <CardDescription>Qualify leads before they book a meeting</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2"><BarChart3 className="w-3 h-3" /> Tracking Pixels</Button>
                  <Button size="sm">Edit Form</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-2xl bg-muted/30 p-6 rounded-lg border border-border/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name *</label>
                  <Input disabled placeholder="e.g. Acme Corp" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">What is your biggest challenge? *</label>
                  <Input disabled placeholder="Short answer" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monthly Revenue</label>
                  <select disabled className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
                    <option>$0 - $10k</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="glass max-w-2xl">
            <CardHeader>
              <CardTitle>Default Availability</CardTitle>
              <CardDescription>Set your standard working hours for bookings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                <div key={day} className="flex items-center gap-4 p-3 rounded-md bg-muted/20 border">
                  <div className="w-24 font-medium">{day}</div>
                  <div className="flex-1 flex gap-2 items-center">
                    <Input defaultValue="09:00" type="time" className="w-32" />
                    <span className="text-muted-foreground">-</span>
                    <Input defaultValue="17:00" type="time" className="w-32" />
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive"><Plus className="w-4 h-4 rotate-45" /></Button>
                </div>
              ))}
              <Button className="mt-4">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}