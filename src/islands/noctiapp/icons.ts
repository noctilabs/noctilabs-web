// Íconos de la app (App L420–422, L470) y los 6 logos de simple-icons (CC0), con imports estáticos (spec 003 §3.1).
import { siGmail, siGoogledrive, siGooglesheets, siHubspot, siSap, siWhatsapp } from 'simple-icons';
import type { CardIcon, Logo, SourceId, ViewKey } from './data/types';

export const ICONS: Record<ViewKey, string> = {
  inicio: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  cerebro: 'M4 5h16v11H9l-5 4z',
  inteligencia: 'M3 3v16a2 2 0 0 0 2 2h16m-2-12-5 5-4-4-3 3',
  agentes: 'M3.5 9h3A1.5 1.5 0 0 1 8 10.5v3A1.5 1.5 0 0 1 6.5 15h-3A1.5 1.5 0 0 1 2 13.5v-3A1.5 1.5 0 0 1 3.5 9zM17.5 3h3A1.5 1.5 0 0 1 22 4.5v3A1.5 1.5 0 0 1 20.5 9h-3A1.5 1.5 0 0 1 16 7.5v-3A1.5 1.5 0 0 1 17.5 3zM17.5 15h3A1.5 1.5 0 0 1 22 16.5v3A1.5 1.5 0 0 1 20.5 21h-3A1.5 1.5 0 0 1 16 19.5v-3A1.5 1.5 0 0 1 17.5 15zM8 12h2a2 2 0 0 0 2-2V8a2 2 0 0 1 2-2h2M10 12a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h2',
  control: 'M4 6h16M4 12h10M4 18h6',
  fuentes: 'M12 22v-5M9 8V2M15 8V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z',
  permisos: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
};

const SYS = {
  erp: 'M12 3c4.97 0 9 1.34 9 3s-4.03 3-9 3-9-1.34-9-3 4.03-3 9-3zM3 6v6c0 1.66 4 3 9 3s9-1.34 9-3V6M3 12v6c0 1.66 4 3 9 3s9-1.34 9-3v-6',
  crm: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  drive: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z',
  whatsapp: 'M7.9 20A9 9 0 1 0 4 16.1L2 22Z',
  planillas: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 9h18M3 15h18M9 9v12',
  entrevistas: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v3',
};
/** Ícono por fuente del catálogo (equivale a `sysIcon` de App L422 sobre los nombres del catálogo). */
export const SOURCE_ICON: Record<SourceId, string> = {
  erp: SYS.erp,
  crm: SYS.crm,
  drive: SYS.drive,
  planillas: SYS.planillas,
  whatsapp: SYS.whatsapp,
  correo: SYS.whatsapp,
  documentos: SYS.drive,
  conocimiento: SYS.entrevistas,
};

export const FICON: Record<CardIcon, string> = {
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  comp: 'M4 6h16M4 12h16M4 18h10',
  bot: 'M12 8V4H8M6 8h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2zM9 13v2M15 13v2',
};

export const BOT = 'M12 8V4H8M6 8h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2zM2 14h2M20 14h2M9 13v2M15 13v2';

export const LOGOS: Record<Logo, { path: string; hex: string }> = {
  sap: siSap,
  hubspot: siHubspot,
  whatsapp: siWhatsapp,
  gmail: siGmail,
  googlesheets: siGooglesheets,
  googledrive: siGoogledrive,
};
