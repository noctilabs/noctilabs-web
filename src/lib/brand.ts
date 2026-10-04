// Marcas y nombres de sistemas que no se traducen automáticamente (spec 002 §4.7, translate="no").
// Bordes por letra o número Unicode, no \b, que no ve el límite tras una vocal acentuada.
export const BRAND_SPLIT = /(?<![\p{L}\p{N}])(NoctiLabs|Nocti|WhatsApp|HubSpot|SAP|Gmail)(?![\p{L}\p{N}])/u;
