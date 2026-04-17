import { useState } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useToast } from "@/hooks/use-toast";

export function PushNotificationBanner() {
  const { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem("push-banner-dismissed") === "true";
  });

  if (!isSupported || permission === "denied" || dismissed || isSubscribed) {
    return null;
  }

  if (permission === "granted" && isSubscribed) {
    return null;
  }

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      toast({
        title: "Notificações ativadas",
        description: "Você receberá alertas de tarefas e leads.",
      });
      setDismissed(true);
    } else {
      toast({
        title: "Permissão negada",
        description: "Ative as notificações nas configurações do navegador.",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("push-banner-dismissed", "true");
    setDismissed(true);
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 bg-primary/10 border-b border-primary/20"
      data-testid="push-notification-banner"
    >
      <Bell className="h-4 w-4 text-primary shrink-0" />
      <p className="text-sm flex-1 text-foreground/80">
        Ative as notificações para receber alertas de tarefas e leads.
      </p>
      <Button
        size="sm"
        onClick={handleSubscribe}
        disabled={isLoading}
        data-testid="button-enable-notifications"
      >
        {isLoading ? "Ativando..." : "Ativar"}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={handleDismiss}
        data-testid="button-dismiss-notification-banner"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function NotificationToggle() {
  const { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe, sendTestNotification } = usePushNotifications();
  const { toast } = useToast();

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="push-not-supported">
        <BellOff className="h-4 w-4" />
        <span>Notificações não suportadas</span>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="push-permission-denied">
        <BellOff className="h-4 w-4" />
        <span>Notificações bloqueadas pelo navegador</span>
      </div>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
      toast({ title: "Notificações desativadas" });
    } else {
      const success = await subscribe();
      if (success) {
        toast({ title: "Notificações ativadas", description: "Você receberá alertas de tarefas e leads." });
      }
    }
  };

  const handleTest = async () => {
    await sendTestNotification();
    toast({ title: "Notificação de teste enviada" });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isSubscribed ? "default" : "outline"}
        size="sm"
        onClick={handleToggle}
        disabled={isLoading}
        data-testid="button-toggle-notifications"
      >
        {isSubscribed ? (
          <>
            <Bell className="h-4 w-4 mr-2" />
            {isLoading ? "..." : "Notificações ativas"}
          </>
        ) : (
          <>
            <BellOff className="h-4 w-4 mr-2" />
            {isLoading ? "..." : "Ativar notificações"}
          </>
        )}
      </Button>
      {isSubscribed && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTest}
          data-testid="button-test-notification"
        >
          Testar
        </Button>
      )}
    </div>
  );
}
