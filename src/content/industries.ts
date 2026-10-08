import type { ImageMetadata } from 'astro';
import type { IndustryId, Locale } from '../i18n/routes';
import type { Localized, Photo } from './types';
import retailImg from '../assets/industries/retail.png';
import manufacturaImg from '../assets/industries/manufactura.png';
import consumoImg from '../assets/industries/consumo.png';
import saludImg from '../assets/industries/salud.png';

export interface Item { title: string; text: string }

/** Bloques de una respuesta del chat (spec 009 §3.E). Los textos marcan las negritas con `**`. */
export type ChatBlock =
  | { type: 'p'; t: string }
  | { type: 'list'; items: string[] }
  /** Lista numerada con título: [título, texto]. */
  | { type: 'num'; items: [string, string][] }
  /** Filas clave-valor; la tercera posición marca la fila de referencia (en gris, filete punteado). */
  | { type: 'rows'; h: string; rows: [string, string, true?][] }
  | { type: 'call'; k: string; t: string };

export interface ChatTurn {
  /** Pregunta. */
  u: string;
  blocks: ChatBlock[];
  /** Fuentes consultadas ('' = sin fuentes). */
  src: string;
  /** Acciones que se muestran al pie de la respuesta (etiquetas, spec 009 G7). */
  acts: string[];
  /** Seguimientos sugeridos: se ofrecen al terminar el turno. */
  sugg: ChatTurn[];
}

/** Copy visible y metadatos de cada industria (spec 009 §3.D). */
export interface Industry {
  label: string;
  short: string;
  /** Tarjeta de la Home y descripción SEO de la página. */
  blurb: string;
  /** Empresa ficticia del chat. */
  company: string;
  hero: { h1: string; lead: string };
  ops: [Item, Item, Item, Item, Item];
  /** Conversaciones del chat, en el orden en que rotan. */
  convs: ChatTurn[][];
  vals: [Item, Item, Item];
}

const P = (t: string): ChatBlock => ({ type: 'p', t });
const L = (...items: string[]): ChatBlock => ({ type: 'list', items });
const N = (...items: [string, string][]): ChatBlock => ({ type: 'num', items });
const RW = (h: string, rows: [string, string, true?][]): ChatBlock => ({ type: 'rows', h, rows });
const C = (k: string, t: string): ChatBlock => ({ type: 'call', k, t });
const T = (u: string, blocks: ChatBlock[], src = '', acts: string[] = [], sugg: ChatTurn[] = []): ChatTurn => ({ u, blocks, src, acts, sugg });
const I = (title: string, text: string): Item => ({ title, text });

const photo = (src: ImageMetadata, es: string, en: string): Photo => ({ src, alt: { es, en } });

export const industryPhotos: Record<IndustryId, Photo> = {
  retail: photo(retailImg,
    'Depósito de distribución con estanterías de pallets, un autoelevador y operarios con chaleco preparando pedidos.',
    'Distribution warehouse with pallet racks, a forklift and workers in vests preparing orders.'),
  manufactura: photo(manufacturaImg,
    'Dos operarios trabajando en una línea de producción de una planta industrial con luz cálida.',
    'Two workers on a production line in an industrial plant with warm light.'),
  consumo: photo(consumoImg,
    'Cajera de supermercado sonriendo mientras pasa frutas y verduras por la caja.',
    'Supermarket cashier smiling while scanning fruit and vegetables at the checkout.'),
  salud: photo(saludImg,
    'Personas corriendo en cintas en un gimnasio con grandes ventanales.',
    'People running on treadmills in a gym with large windows.'),
};

// Spec 009: castellano del v6 tal cual (G2); inglés de Claude (G4).
export const industries: Record<IndustryId, Localized<Industry>> = {
  retail: {
    es: {
      label: 'Retail y distribución', short: 'Retail',
      blurb: 'Ventas, pedidos, stock, compras y cobranzas conectados para operar con mayor visibilidad y prioridad.',
      company: 'Distribuidora Andes',
      hero: {
        h1: 'Convertí ventas, stock y operación en una sola visión del negocio.',
        lead: 'Conectá clientes, pedidos, inventario, compras y cobranzas para detectar oportunidades antes, reducir fricción operativa y proteger margen.',
      },
      ops: [
        I('Clientes y ventas', 'Comportamiento de compra, oportunidades, pricing y cartera.'),
        I('Inventario', 'Disponibilidad, rotación, quiebres y sobrestock.'),
        I('Pedidos', 'Prioridad, preparación, despacho y excepciones.'),
        I('Compras', 'Disponibilidad, costos y proveedores.'),
        I('Finanzas', 'Crédito, cobranzas y rentabilidad.'),
      ],
      convs: [
        [
          T('¿Qué clientes debería priorizar hoy?', [
            P('Hay **12 clientes prioritarios**.'),
            L('**5** están comprando más de **20% menos** que su promedio de los últimos 90 días.',
              '**4** tienen cotizaciones abiertas sin seguimiento hace más de **7 días**.',
              '**3** muestran oportunidades claras de cross-sell según su historial de compra.'),
            P('Los clientes con caída representan aproximadamente **$18,6 M** en ventas mensuales históricas.'),
          ], 'CRM · ERP Ventas · Cotizaciones', ['Ver clientes', 'Preparar seguimiento', 'Crear tareas']),
          T('¿Cuáles de esos también tienen margen por encima del promedio?', [
            P('De los 12 clientes prioritarios, **4** tienen un margen bruto superior al promedio del canal.'),
            RW('Margen bruto', [['Cliente A', '32,8%'], ['Cliente B', '31,4%'], ['Cliente C', '30,9%'], ['Cliente D', '29,7%'], ['Promedio del canal mayorista', '26,1%', true]]),
            C('Insight', 'Priorizar estos cuatro clientes permitiría recuperar volumen manteniendo una rentabilidad superior al promedio.'),
          ], 'ERP Ventas · ERP Costos · CRM Clientes'),
          T('Preparame el seguimiento para los tres con mayor potencial.', [
            P('Preparé **tres seguimientos** utilizando el historial comercial, última compra, productos habituales y oportunidades detectadas.'),
          ], '', ['Revisar mensajes', 'Enviar', 'Asignar a vendedor']),
        ],
        [
          T('¿Qué productos pueden quebrar stock en las próximas dos semanas?', [
            P('Hay **14 SKUs** en stock crítico. Cinco tienen menos de **10 días** de cobertura y concentran **$12,8 M** en pedidos comprometidos.'),
          ], 'ERP Inventario · WMS Stock · ERP Pedidos', [], [
            T('¿Qué clientes están afectados?', [
              P('Los 5 SKUs críticos están comprometidos en pedidos de **7 clientes**.'),
              RW('Pedidos en riesgo', [['Cliente A', '$4,2 M'], ['Cliente B', '$3,1 M'], ['Cliente C', '$2,6 M']]),
              P('Los tres concentran **77%** de los pedidos en riesgo.'),
            ], 'ERP Pedidos · CRM Clientes', ['Ver pedidos', 'Avisar a vendedores']),
            T('¿Qué proveedores pueden reponerlos a tiempo?', [
              P('**2 proveedores** pueden entregar en menos de **7 días** para 4 de los 5 SKUs críticos.'),
              P('El quinto depende de un proveedor con un lead time de **12 días**.'),
            ], 'ERP Compras · Proveedores', ['Solicitar cotizaciones', 'Crear orden de compra']),
            T('¿Cuánto capital necesito para cubrirlos?', [
              RW('Cobertura de 30 días', [['14 SKUs en stock crítico', '$5,3 M'], ['Solo los 5 de menor cobertura', '$2,1 M']]),
            ], 'ERP Inventario · ERP Costos', ['Simular compra', 'Enviar a aprobación']),
          ]),
        ],
      ],
      vals: [
        I('Más ventas', 'Detectá clientes en caída y oportunidades antes de perderlas.'),
        I('Menos capital inmovilizado', 'Entendé dónde sobra stock y dónde puede faltar.'),
        I('Más margen', 'Entendé qué clientes, productos y decisiones están afectando la rentabilidad.'),
      ],
    },
    en: {
      label: 'Retail and distribution', short: 'Retail',
      blurb: 'Sales, orders, stock, purchasing and collections connected, so you operate with more visibility and clearer priorities.',
      company: 'Distribuidora Andes',
      hero: {
        h1: 'Turn sales, stock and operations into a single view of the business.',
        lead: 'Connect customers, orders, inventory, purchasing and collections to spot opportunities sooner, reduce operational friction and protect margin.',
      },
      ops: [
        I('Customers and sales', 'Buying behavior, opportunities, pricing and portfolio.'),
        I('Inventory', 'Availability, turnover, stockouts and overstock.'),
        I('Orders', 'Priority, picking, dispatch and exceptions.'),
        I('Purchasing', 'Availability, costs and suppliers.'),
        I('Finance', 'Credit, collections and profitability.'),
      ],
      convs: [
        [
          T('Which customers should I prioritize today?', [
            P('There are **12 priority customers**.'),
            L('**5** are buying more than **20% less** than their 90-day average.',
              '**4** have open quotes with no follow-up for more than **7 days**.',
              '**3** show clear cross-sell opportunities based on their purchase history.'),
            P('The declining customers account for roughly **$18.6M** in historical monthly sales.'),
          ], 'CRM · ERP Sales · Quotes', ['View customers', 'Prepare follow-up', 'Create tasks']),
          T('Which of those also have above-average margins?', [
            P('Of the 12 priority customers, **4** have a gross margin above the channel average.'),
            RW('Gross margin', [['Customer A', '32.8%'], ['Customer B', '31.4%'], ['Customer C', '30.9%'], ['Customer D', '29.7%'], ['Wholesale channel average', '26.1%', true]]),
            C('Insight', 'Prioritizing these four customers would recover volume while keeping profitability above average.'),
          ], 'ERP Sales · ERP Costs · CRM Customers'),
          T('Prepare the follow-up for the three with the most potential.', [
            P('I prepared **three follow-ups** using each customer’s sales history, last purchase, usual products and the opportunities detected.'),
          ], '', ['Review messages', 'Send', 'Assign to sales rep']),
        ],
        [
          T('Which products could run out of stock in the next two weeks?', [
            P('**14 SKUs** are at critical stock. Five have less than **10 days** of coverage and account for **$12.8M** in committed orders.'),
          ], 'ERP Inventory · WMS Stock · ERP Orders', [], [
            T('Which customers are affected?', [
              P('The 5 critical SKUs are committed in orders from **7 customers**.'),
              RW('Orders at risk', [['Customer A', '$4.2M'], ['Customer B', '$3.1M'], ['Customer C', '$2.6M']]),
              P('These three account for **77%** of the orders at risk.'),
            ], 'ERP Orders · CRM Customers', ['View orders', 'Notify sales reps']),
            T('Which suppliers can restock them in time?', [
              P('**2 suppliers** can deliver in under **7 days** for 4 of the 5 critical SKUs.'),
              P('The fifth depends on a supplier with a **12-day** lead time.'),
            ], 'ERP Purchasing · Suppliers', ['Request quotes', 'Create purchase order']),
            T('How much capital do I need to cover them?', [
              RW('30-day coverage', [['14 SKUs at critical stock', '$5.3M'], ['Only the 5 with the lowest coverage', '$2.1M']]),
            ], 'ERP Inventory · ERP Costs', ['Simulate purchase', 'Send for approval']),
          ]),
        ],
      ],
      vals: [
        I('More sales', 'Spot declining customers and opportunities before you lose them.'),
        I('Less tied-up capital', 'See where you have too much stock and where you could run short.'),
        I('More margin', 'Understand which customers, products and decisions are affecting profitability.'),
      ],
    },
  },
  manufactura: {
    es: {
      label: 'Manufactura', short: 'Manufactura',
      blurb: 'Producción, mantenimiento, calidad y abastecimiento conectados con los sistemas que la planta ya utiliza.',
      company: 'Fábrica Litoral',
      hero: {
        h1: 'Conectá lo que pasa en planta con las decisiones del negocio.',
        lead: 'Producción, materiales, mantenimiento, calidad y demanda trabajando sobre una misma realidad operativa.',
      },
      ops: [
        I('Producción', 'Órdenes, capacidad, rendimiento y desvíos.'),
        I('Materiales', 'Inventario, consumo, disponibilidad y proveedores.'),
        I('Mantenimiento', 'Equipos, fallas y órdenes de trabajo.'),
        I('Calidad', 'Controles, incidencias y no conformidades.'),
        I('Planificación', 'Demanda, producción y fechas comprometidas.'),
      ],
      convs: [
        [
          T('¿Qué está frenando la producción hoy?', [
            P('Detecté **3 bloqueos principales**:'),
            N(['Componente RM-218', 'Falta de stock en Línea 2. Afecta **6 órdenes** de producción.'],
              ['Prensa 04', 'Mantenimiento pendiente. Está operando **18% por debajo** de su rendimiento promedio.'],
              ['Lote 4812', 'Inspección de calidad pendiente. Mantiene bloqueadas **2.400 unidades**.']),
            P('En conjunto, estos eventos ponen en riesgo **9 órdenes** de producción y aproximadamente **$7,8 M** en pedidos comprometidos.'),
          ], 'ERP Producción · WMS · Mantenimiento · Calidad', ['Ver órdenes afectadas', 'Revisar materiales', 'Escalar mantenimiento']),
          T('¿Cuál de esos problemas tiene mayor impacto sobre pedidos comprometidos?', [
            P('La falta del componente **RM-218** representa el mayor riesgo.'),
            RW('Afecta', [['Órdenes', '6'], ['Clientes', '3'], ['Pedidos comprometidos', '$4,9 M'], ['Fecha promedio prometida', '48 horas']]),
            P('El proveedor habitual tiene un lead time estimado de **5 días**. Con el abastecimiento actual, **4 de las 6 órdenes** incumplirían su fecha prometida.'),
          ]),
          T('¿Qué podemos resolver hoy?', [
            P('Encontré **dos alternativas** disponibles:'),
            L('Transferir **1.180 unidades** desde Planta Norte.',
              'Emitir una compra urgente por **700 unidades** al proveedor secundario.'),
            P('Combinadas permitirían cubrir aproximadamente **82%** de la necesidad inmediata.'),
          ], '', ['Crear transferencia', 'Solicitar cotización', 'Enviar compra a aprobación']),
        ],
      ],
      vals: [
        I('Menos paradas', 'Detectá riesgos antes de que se transformen en producción perdida.'),
        I('Más capacidad aprovechada', 'Identificá dónde se están generando los cuellos de botella.'),
        I('Menor costo operativo', 'Reducí urgencias, retrabajos y decisiones tardías.'),
      ],
    },
    en: {
      label: 'Manufacturing', short: 'Manufacturing',
      blurb: 'Production, maintenance, quality and supply connected to the systems the plant already uses.',
      company: 'Fábrica Litoral',
      hero: {
        h1: 'Connect what happens on the plant floor with business decisions.',
        lead: 'Production, materials, maintenance, quality and demand working from the same operational reality.',
      },
      ops: [
        I('Production', 'Orders, capacity, yield and deviations.'),
        I('Materials', 'Inventory, consumption, availability and suppliers.'),
        I('Maintenance', 'Equipment, failures and work orders.'),
        I('Quality', 'Inspections, incidents and non-conformities.'),
        I('Planning', 'Demand, production and committed dates.'),
      ],
      convs: [
        [
          T('What is holding up production today?', [
            P('I found **3 main blockers**:'),
            N(['Component RM-218', 'Out of stock on Line 2. It affects **6 production orders**.'],
              ['Press 04', 'Maintenance pending. It is running **18% below** its average yield.'],
              ['Batch 4812', 'Quality inspection pending. **2,400 units** are on hold.']),
            P('Together, these events put **9 production orders** and about **$7.8M** in committed orders at risk.'),
          ], 'ERP Production · WMS · Maintenance · Quality', ['View affected orders', 'Review materials', 'Escalate maintenance']),
          T('Which of those problems has the biggest impact on committed orders?', [
            P('The shortage of component **RM-218** is the biggest risk.'),
            RW('It affects', [['Orders', '6'], ['Customers', '3'], ['Committed orders', '$4.9M'], ['Average promised date', 'In 48 hours']]),
            P('The usual supplier has an estimated lead time of **5 days**. With current supply, **4 of the 6 orders** would miss their promised date.'),
          ]),
          T('What can we solve today?', [
            P('I found **two available alternatives**:'),
            L('Transfer **1,180 units** from Planta Norte.',
              'Place an urgent order for **700 units** with the secondary supplier.'),
            P('Combined, they would cover about **82%** of the immediate need.'),
          ], '', ['Create transfer', 'Request quote', 'Send purchase for approval']),
        ],
      ],
      vals: [
        I('Less downtime', 'Spot risks before they turn into lost production.'),
        I('More capacity used', 'Pinpoint where bottlenecks are forming.'),
        I('Lower operating costs', 'Cut rush jobs, rework and late decisions.'),
      ],
    },
  },
  consumo: {
    es: {
      label: 'Alimentos y bienes de consumo', short: 'Consumo masivo',
      blurb: 'Ventas, inventario, lotes, distribución y margen conectados para responder mejor a la demanda y proteger rentabilidad.',
      company: 'Lácteos Serranos',
      hero: {
        h1: 'Entendé la operación desde la demanda hasta la entrega.',
        lead: 'Conectá ventas, lotes, inventario, distribución y margen para reaccionar antes a cambios en demanda, costos y disponibilidad.',
      },
      ops: [
        I('Demanda y ventas', 'Clientes, distribuidores, productos y canales.'),
        I('Inventario y lotes', 'Stock, rotación, vencimientos y trazabilidad.'),
        I('Abastecimiento', 'Materiales, proveedores y disponibilidad.'),
        I('Distribución', 'Pedidos, preparación, rutas y entregas.'),
        I('Rentabilidad', 'Costos, promociones, descuentos y mix.'),
      ],
      convs: [
        [
          T('¿Qué productos tienen riesgo de vencimiento este mes?', [
            P('Hay **18 lotes** con riesgo alto de vencimiento.'),
            RW('', [['Valor total del inventario afectado', '$6,4 M']]),
            L('**11** corresponden a productos de baja rotación.',
              '**7** tienen menos de **21 días** de vida útil restante.'),
            P('Los cuatro lotes de mayor valor concentran **61%** del riesgo total.'),
          ], 'ERP Inventario · Lotes · Ventas históricas', ['Ver lotes', 'Analizar rotación', 'Revisar clientes potenciales']),
          T('¿Cuáles tienen además baja rotación?', [
            P('De los 18 lotes, **11** están por debajo del **50%** de su velocidad normal de salida. Tres productos concentran **$3,1 M** del inventario en riesgo.'),
            RW('Cobertura', [['Producto A', '47 días'], ['Producto B', '39 días'], ['Producto C', '42 días'], ['Promedio de la categoría', '19 días', true]]),
          ]),
          T('¿Dónde podemos mover ese stock antes de perderlo?', [
            P('Detecté **9 clientes** con historial de compra de esos productos y capacidad de absorción superior al promedio. También hay **2 canales** donde el margen seguiría siendo positivo aplicando descuentos de hasta **8%**.'),
            C('Impacto potencial', 'Hasta **$2,4 M** de inventario en riesgo podría ser redistribuido.'),
          ], '', ['Ver clientes', 'Simular descuento', 'Preparar propuesta']),
        ],
      ],
      vals: [
        I('Menos merma', 'Detectá sobrestock, vencimientos y baja rotación antes.'),
        I('Más disponibilidad', 'Anticipá quiebres que pueden terminar en ventas perdidas.'),
        I('Más rentabilidad', 'Entendé el efecto real de costos, promociones, descuentos y mix.'),
      ],
    },
    en: {
      label: 'Food and consumer goods', short: 'Consumer goods',
      blurb: 'Sales, inventory, batches, distribution and margin connected, so you respond better to demand and protect profitability.',
      company: 'Lácteos Serranos',
      hero: {
        h1: 'Understand the operation from demand to delivery.',
        lead: 'Connect sales, batches, inventory, distribution and margin to react sooner to changes in demand, costs and availability.',
      },
      ops: [
        I('Demand and sales', 'Customers, distributors, products and channels.'),
        I('Inventory and batches', 'Stock, turnover, expiry dates and traceability.'),
        I('Supply', 'Materials, suppliers and availability.'),
        I('Distribution', 'Orders, picking, routes and deliveries.'),
        I('Profitability', 'Costs, promotions, discounts and mix.'),
      ],
      convs: [
        [
          T('Which products are at risk of expiring this month?', [
            P('**18 batches** are at high risk of expiring.'),
            RW('', [['Total value of affected inventory', '$6.4M']]),
            L('**11** are slow-moving products.',
              '**7** have less than **21 days** of shelf life left.'),
            P('The four highest-value batches account for **61%** of the total risk.'),
          ], 'ERP Inventory · Batches · Sales history', ['View batches', 'Analyze turnover', 'Review potential customers']),
          T('Which of them are also slow-moving?', [
            P('Of the 18 batches, **11** are selling at less than **50%** of their normal rate. Three products account for **$3.1M** of the inventory at risk.'),
            RW('Coverage', [['Product A', '47 days'], ['Product B', '39 days'], ['Product C', '42 days'], ['Category average', '19 days', true]]),
          ]),
          T('Where can we move that stock before we lose it?', [
            P('I found **9 customers** who have bought these products before and can absorb more than average. There are also **2 channels** where margin would stay positive with discounts of up to **8%**.'),
            C('Potential impact', 'Up to **$2.4M** of inventory at risk could be redistributed.'),
          ], '', ['View customers', 'Simulate discount', 'Prepare proposal']),
        ],
      ],
      vals: [
        I('Less waste', 'Spot overstock, expiring stock and slow movers sooner.'),
        I('Better availability', 'Anticipate stockouts that could turn into lost sales.'),
        I('More profitability', 'Understand the real effect of costs, promotions, discounts and mix.'),
      ],
    },
  },
  salud: {
    es: {
      label: 'Salud y actividad física', short: 'Salud y fitness',
      blurb: 'Sedes, agenda, atención y administración conectadas para mejorar la experiencia y operar con mayor eficiencia.',
      company: 'Red Activa',
      hero: {
        h1: 'Una operación conectada entre personas, sedes y servicios.',
        lead: 'Conectá agenda, atención, capacidad y administración para entender qué pasa en cada sede y mejorar la experiencia.',
      },
      ops: [
        I('Agenda', 'Disponibilidad, reservas, cambios y ausencias.'),
        I('Atención', 'Consultas, solicitudes y seguimiento.'),
        I('Pacientes o socios', 'Altas, actividad, renovaciones y relación con la organización.'),
        I('Sedes', 'Capacidad, equipos, incidencias y operación.'),
        I('Administración', 'Pagos, contratos, facturación y documentación.'),
      ],
      convs: [
        [
          T('¿Qué sedes tuvieron más cancelaciones este mes?', [
            P('Tres sedes concentran **57%** de las cancelaciones.'),
            RW('Tasa de cancelación', [['Pocitos', '14,8%'], ['Carrasco', '12,9%'], ['Centro', '11,7%'], ['Promedio general de la red', '8,4%', true]]),
            P('El incremento se concentra principalmente entre las **18:00 y las 21:00**.'),
          ], 'Agenda · CRM · Operación de sedes', ['Ver horarios', 'Analizar cancelaciones', 'Comparar sedes']),
          T('¿En qué horarios se concentra el problema?', [
            P('El mayor desvío aparece entre **19:00 y 20:30**. En ese bloque:'),
            RW('', [['Cancelaciones', '17,2%'], ['Promedio histórico', '9,1%', true], ['Capacidad no utilizada estimada', '126 turnos por mes']]),
          ]),
          T('¿Qué capacidad podríamos recuperar si volvemos al promedio del trimestre?', [
            P('Si estas tres sedes regresaran a su tasa histórica de cancelación se recuperarían aproximadamente:'),
            RW('', [['Turnos por mes', '74'], ['Utilización en esas franjas', '+6,8%'], ['Ingreso potencial adicional estimado', '$1,9 M por mes']]),
          ], '', ['Crear alerta', 'Revisar confirmaciones', 'Analizar lista de espera']),
        ],
      ],
      vals: [
        I('Mejor experiencia', 'Menos fricción entre agenda, atención y seguimiento.'),
        I('Mayor utilización', 'Entendé dónde existe capacidad ociosa y demanda que no está siendo atendida.'),
        I('Operación más eficiente', 'Detectá problemas entre sedes antes de que se repitan.'),
      ],
    },
    en: {
      label: 'Health and fitness', short: 'Health & fitness',
      blurb: 'Locations, scheduling, service and administration connected to improve the experience and operate more efficiently.',
      company: 'Red Activa',
      hero: {
        h1: 'One connected operation across people, locations and services.',
        lead: 'Connect scheduling, service, capacity and administration to understand what happens at each location and improve the experience.',
      },
      ops: [
        I('Scheduling', 'Availability, bookings, changes and no-shows.'),
        I('Service', 'Inquiries, requests and follow-up.'),
        I('Patients or members', 'Sign-ups, activity, renewals and their relationship with the organization.'),
        I('Locations', 'Capacity, equipment, incidents and operations.'),
        I('Administration', 'Payments, contracts, billing and paperwork.'),
      ],
      convs: [
        [
          T('Which locations had the most cancellations this month?', [
            P('Three locations account for **57%** of cancellations.'),
            RW('Cancellation rate', [['Pocitos', '14.8%'], ['Carrasco', '12.9%'], ['Centro', '11.7%'], ['Network-wide average', '8.4%', true]]),
            P('The increase is concentrated mainly between **6:00 and 9:00 p.m.**'),
          ], 'Scheduling · CRM · Location operations', ['View time slots', 'Analyze cancellations', 'Compare locations']),
          T('Which time slots are driving the problem?', [
            P('The biggest deviation is between **7:00 and 8:30 p.m.** In that block:'),
            RW('', [['Cancellations', '17.2%'], ['Historical average', '9.1%', true], ['Estimated unused capacity', '126 slots per month']]),
          ]),
          T('How much capacity could we recover if we got back to the quarterly average?', [
            P('If these three locations returned to their historical cancellation rate, they would recover approximately:'),
            RW('', [['Slots per month', '74'], ['Utilization in those time slots', '+6.8%'], ['Estimated additional potential revenue', '$1.9M per month']]),
          ], '', ['Create alert', 'Review confirmations', 'Analyze waitlist']),
        ],
      ],
      vals: [
        I('Better experience', 'Less friction between scheduling, service and follow-up.'),
        I('Higher utilization', 'See where there is idle capacity and demand that isn’t being met.'),
        I('More efficient operations', 'Spot problems across locations before they happen again.'),
      ],
    },
  },
};

export const industry = (id: IndustryId, locale: Locale): Industry => industries[id][locale];
