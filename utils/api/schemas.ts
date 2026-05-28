import { z } from 'zod';

/**
 * Runtime-validated shapes of the ServiceNow API responses the extension consumes.
 * Keep these permissive enough to survive non-breaking schema additions
 * (`.passthrough()` on objects, `.optional()` on fields whose absence we tolerate)
 * but strict enough to catch when a field we depend on disappears.
 */

/**
 * NOTE on permissiveness: ServiceNow's response shapes vary across versions and
 * customizations. These schemas validate the *envelope* (top-level `result` /
 * `list`), but the individual records are kept loose so a single odd item
 * doesn't blank out the whole list. Per-item normalization happens in service.ts.
 */

export const ScopeRecordSchema = z
  .object({
    sys_id: z.string().optional(),
    scope: z.string().optional(),
    name: z.string().optional(),
  })
  .passthrough();

export const TableRecordSchema = z
  .object({
    sys_id: z.string().optional(),
    name: z.string().optional(),
    label: z.string().optional(),
  })
  .passthrough();

export const HistoryItemSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    prettyTitle: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    url: z.string().optional(),
    timestamp: z.number().optional(),
  })
  .passthrough();

export const HistoryResponseSchema = z
  .object({
    list: z.array(HistoryItemSchema).optional(),
  })
  .passthrough();

interface MenuItemShape {
  label?: string;
  route?: { params?: { target?: string }; url?: string; external?: { url: string } };
  subItems?: MenuItemShape[];
}

export const MenuItemSchema: z.ZodType<MenuItemShape> = z.lazy(() =>
  z
    .object({
      label: z.string().optional(),
      route: z
        .object({
          params: z.object({ target: z.string().optional() }).optional(),
          url: z.string().optional(),
          external: z.object({ url: z.string() }).optional(),
        })
        .partial()
        .optional(),
      subItems: z.array(MenuItemSchema).optional(),
    })
    .passthrough()
);

export const SwitchAppResultSchema = z
  .object({
    error: z.unknown().optional(),
  })
  .passthrough();

export type ScopeRecord = z.infer<typeof ScopeRecordSchema>;
export type TableRecord = z.infer<typeof TableRecordSchema>;
export type HistoryItem = z.infer<typeof HistoryItemSchema>;
export type MenuItem = z.infer<typeof MenuItemSchema>;
