import { db } from "./db";
import { sql } from "drizzle-orm";
import { log } from "./index";

export async function runMigrations() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS stages (
        id VARCHAR PRIMARY KEY,
        name TEXT NOT NULL,
        scenario_type TEXT,
        cadence JSONB NOT NULL DEFAULT '[]'::jsonb,
        position INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        name TEXT NOT NULL,
        email TEXT NOT NULL DEFAULT '',
        phone TEXT NOT NULL DEFAULT '',
        company TEXT NOT NULL DEFAULT '',
        value TEXT NOT NULL DEFAULT 'R$ 0',
        stage TEXT NOT NULL DEFAULT 'new',
        owner TEXT NOT NULL DEFAULT '',
        tags TEXT[] NOT NULL DEFAULT '{}'::text[],
        score INTEGER NOT NULL DEFAULT 0,
        form_responses JSONB NOT NULL DEFAULT '{}'::jsonb,
        notes TEXT NOT NULL DEFAULT '',
        history JSONB NOT NULL DEFAULT '[]'::jsonb,
        meeting_date TEXT,
        next_task TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        priority TEXT NOT NULL DEFAULT 'schedule',
        due_date TEXT NOT NULL,
        responsible_user TEXT NOT NULL DEFAULT '',
        linked_lead_id INTEGER,
        linked_stage_id TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        type TEXT NOT NULL DEFAULT 'Manual',
        created_at TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS calendar_events (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        hour INTEGER NOT NULL DEFAULT 9,
        duration TEXT NOT NULL DEFAULT '1',
        type TEXT NOT NULL DEFAULT 'meeting',
        linked_lead_id INTEGER,
        linked_task_id TEXT,
        style TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR PRIMARY KEY DEFAULT 'default',
        language TEXT NOT NULL DEFAULT 'pt-BR',
        currency TEXT NOT NULL DEFAULT 'BRL'
      );
    `);

    // Add crm_config column if it doesn't exist yet
    await db.execute(sql`
      ALTER TABLE settings ADD COLUMN IF NOT EXISTS crm_config JSONB DEFAULT '{}'::jsonb;
    `);

    // Add archive + close chance columns to leads
    await db.execute(sql`
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS close_chance INTEGER NOT NULL DEFAULT 0;
    `);

    // Seed default stages if empty
    const existingStages = await db.execute(sql`SELECT COUNT(*) as count FROM stages`);
    const stageCount = Number((existingStages.rows[0] as any).count);
    if (stageCount === 0) {
      await db.execute(sql`
        INSERT INTO stages (id, name, scenario_type, cadence, position) VALUES
        ('new', 'Novos Leads', 'Cold call funnel', '[{"type":"email","intervalValue":0,"intervalUnit":"minutes"},{"type":"call","intervalValue":1,"intervalUnit":"days"}]'::jsonb, 0),
        ('qualified', 'Qualificados', 'Meeting follow-up funnel', '[{"type":"call","intervalValue":2,"intervalUnit":"days"}]'::jsonb, 1),
        ('demo', 'Demo Agendada', null, '[]'::jsonb, 2),
        ('negotiation', 'Negociação', null, '[{"type":"email","intervalValue":3,"intervalUnit":"days"},{"type":"call","intervalValue":5,"intervalUnit":"days"}]'::jsonb, 3),
        ('won', 'Fechado/Ganho', null, '[]'::jsonb, 4)
        ON CONFLICT (id) DO NOTHING
      `);
    }

    // Seed default settings if empty
    await db.execute(sql`
      INSERT INTO settings (id, language, currency) VALUES ('default', 'pt-BR', 'BRL')
      ON CONFLICT (id) DO NOTHING
    `);

    log("Database migrations completed successfully");
  } catch (err) {
    log(`Migration error: ${err}`);
    throw err;
  }
}
