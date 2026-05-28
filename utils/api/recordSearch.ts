import { snRunScript } from './snFetch';
import { gotoTab } from './service';
import { isValidSysId } from '../validation';

interface InstanceRecord {
  key: string;
  fullLabel: string;
  target: string;
}

let cachedScript: string | null = null;

async function loadScript(): Promise<string> {
  if (cachedScript) return cachedScript;
  // Dynamic raw import — keeps the GlideScript out of the main palette bundle
  // and only fetched when the user actually enters FIND_RECORD mode.
  const mod = await import('./recordSearch.script.js?raw');
  cachedScript = mod.default;
  return cachedScript;
}

/**
 * Locates an instance record by sys_id via a background GlideScript and returns
 * a navigable target. Returns null when the sys_id is malformed or not found.
 */
export async function getInstanceRecord(sysId: string): Promise<InstanceRecord | null> {
  if (!isValidSysId(sysId)) return null;

  const script = await loadScript();
  const wrapped = `${script}\n\nfindSysID('${sysId.replace(/[^0-9a-f]/gi, '')}');`;

  const res = await snRunScript(wrapped);
  if (!res.ok) return null;

  const regex = /sn-launcher-start:(.*):sn-launcher-end/;
  const match = regex.exec(res.value);
  if (!match?.[1]) return null;

  const [type, name, , link] = match[1].split('///');
  if (!link) return null;

  return {
    key: `record:${sysId}`,
    fullLabel: `${type} / ${name}`,
    target: link,
  };
}

export async function openInstanceRecord(sysId: string): Promise<void> {
  const record = await getInstanceRecord(sysId);
  if (record?.target) {
    gotoTab(record.target);
  }
}
