import { useEffect, useRef, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";

export function triggerZapierEvent(event: string, payload: Record<string, unknown>) {
  fetch("/api/zapier/trigger", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, payload }),
  }).catch(() => {});
}

export function useZapierSync() {
  const { leads, tasks, addLead, addTask } = useAppContext();
  const prevLeadIds = useRef<Set<number>>(new Set());
  const prevTaskIds = useRef<Set<string>>(new Set());
  const prevTaskStatuses = useRef<Map<string, string>>(new Map());
  const initialized = useRef(false);

  // Track new leads and trigger outbound events
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      prevLeadIds.current = new Set(leads.map((l) => l.id));
      prevTaskIds.current = new Set(tasks.map((t) => t.id));
      prevTaskStatuses.current = new Map(tasks.map((t) => [t.id, t.status]));
      return;
    }

    const currentLeadIds = new Set(leads.map((l) => l.id));
    leads.forEach((lead) => {
      if (!prevLeadIds.current.has(lead.id)) {
        triggerZapierEvent("new_lead", {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          value: lead.value,
          stage: lead.stage,
          owner: lead.owner,
        });
      }
    });
    prevLeadIds.current = currentLeadIds;
  }, [leads]);

  // Track new/completed tasks and trigger outbound events
  useEffect(() => {
    if (!initialized.current) return;

    const currentTaskIds = new Set(tasks.map((t) => t.id));
    tasks.forEach((task) => {
      if (!prevTaskIds.current.has(task.id)) {
        triggerZapierEvent("new_task", {
          id: task.id,
          title: task.title,
          priority: task.priority,
          dueDate: task.dueDate,
          status: task.status,
        });
      } else {
        const prevStatus = prevTaskStatuses.current.get(task.id);
        if (prevStatus === "pending" && task.status === "completed") {
          triggerZapierEvent("task_completed", {
            id: task.id,
            title: task.title,
            priority: task.priority,
            dueDate: task.dueDate,
          });
        }
      }
    });
    prevTaskIds.current = currentTaskIds;
    prevTaskStatuses.current = new Map(tasks.map((t) => [t.id, t.status]));
  }, [tasks]);

  // Poll for inbound items from Zapier and add to app
  const pollInbound = useCallback(async () => {
    try {
      const res = await fetch("/api/zapier/inbound/queue");
      const { items } = await res.json();
      if (!items || items.length === 0) return;

      for (const item of items) {
        if (item.type === "lead" && item.data.name) {
          addLead({
            name: item.data.name,
            email: item.data.email || "",
            phone: item.data.phone || "",
            company: item.data.company || "",
            value: item.data.value || "R$ 0",
            stage: item.data.stage || "new",
            owner: item.data.owner || "Zapier",
            tags: item.data.tags || ["zapier"],
            score: 0,
            formResponses: {},
            notes: item.data.notes || "Criado via Zapier",
            history: [
              {
                id: `zapier-${Date.now()}`,
                type: "note" as const,
                description: "Lead criado via Zapier",
                date: new Date().toISOString().split("T")[0],
              },
            ],
          });
        }

        if (item.type === "task" && item.data.title) {
          addTask({
            title: item.data.title,
            description: item.data.description || "Criada via Zapier",
            priority: (item.data.priority as any) || "schedule",
            dueDate: item.data.dueDate || new Date().toISOString().split("T")[0],
            responsibleUser: item.data.responsibleUser || "Zapier",
            status: "pending",
            type: "Manual",
          });
        }

        await fetch("/api/zapier/inbound/consume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id }),
        });
      }
    } catch {
      // silent fail - Zapier sync is non-critical
    }
  }, [addLead, addTask]);

  useEffect(() => {
    const interval = setInterval(pollInbound, 10000);
    pollInbound();
    return () => clearInterval(interval);
  }, [pollInbound]);
}
