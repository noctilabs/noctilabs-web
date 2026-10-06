// Origen canónico del sitio (spec 004 §2.1): fuente única para `site` de Astro y para las URLs absolutas.
export const ORIGIN = 'https://www.noctilabs.io';

// Dueño, 2026-10-06: se lanza sin la clave de Web3Forms ni los datos legales del responsable. Con `true`, el build de
// publicación no exige la clave (Hablemos muestra el contacto por mail en lugar del formulario) y la política nombra
// al responsable como «NoctiLabs», sin RUT ni domicilio. Volver a `false` cuando estén la clave y los datos.
export const ALLOW_PENDING_LAUNCH = true;
