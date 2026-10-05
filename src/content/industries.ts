import type { ImageMetadata } from 'astro';
import type { IndustryId, Locale } from '../i18n/routes';
import type { Localized, Photo } from './types';
import retailImg from '../assets/industries/retail.png';
import manufacturaImg from '../assets/industries/manufactura.png';
import consumoImg from '../assets/industries/consumo.png';
import saludImg from '../assets/industries/salud.png';
import serviciosImg from '../assets/industries/servicios.png';

export interface Item { title: string; text: string }
export interface Question { q: string; area: string }
export interface Why { strong: string; rest: string }

/** Copy visible y metadatos de cada industria (spec 002 §3.3). */
export interface Industry {
  label: string;
  short: string;
  blurb: string;
  hero: { h1: string; lead: string };
  /** Complemento de «Por qué Nocti para …» (en minúscula, como en el diseño). */
  whyFor: string;
  processes: [Item, Item, Item, Item];
  questions: [Question, Question, Question, Question];
  agents: [Item, Item, Item, Item];
  why: [Why, Why, Why, Why];
  /** true = copy redactado sin diseño fuente, pendiente de aprobación del dueño. */
  draft: boolean;
}

const WHY: Localized<Industry['why']> = {
  es: [
    { strong: 'Una misma capa', rest: 'para toda la operación.' },
    { strong: 'Contexto real del negocio:', rest: 'procesos, reglas, excepciones y conocimiento.' },
    { strong: 'Control y trazabilidad', rest: 'sobre cada acción.' },
    { strong: 'Servicio + plataforma:', rest: 'NoctiLabs implementa y la organización sigue construyendo sobre Nocti.' },
  ],
  en: [
    { strong: 'One layer', rest: 'for the whole operation.' },
    { strong: 'Real business context:', rest: 'processes, rules, exceptions and knowledge.' },
    { strong: 'Control and traceability', rest: 'over every action.' },
    { strong: 'Service + platform:', rest: 'NoctiLabs implements and your organization keeps building on Nocti.' },
  ],
};

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
  servicios: photo(serviciosImg,
    'Equipo trabajando en una oficina vidriada, con personas conversando entre escritorios.',
    'Team working in a glass-walled office, with people talking between desks.'),
};

export const industries: Record<IndustryId, Localized<Industry>> = {
  retail: {
    es: {
      label: 'Retail y distribución', short: 'Retail',
      blurb: 'Ventas, pedidos, stock, compras y cobranzas conectados para operar con mayor visibilidad y prioridad.',
      hero: {
        h1: 'Cada cliente, pedido y proveedor en un mismo contexto.',
        lead: 'Nocti conecta ventas, stock, compras y cobranzas para que tu equipo sepa qué priorizar cada día y tus agentes trabajen con las mismas reglas.',
      },
      whyFor: 'retail y distribución',
      processes: [
        { title: 'Ventas y clientes', text: 'Cartera, frecuencia de compra y oportunidades.' },
        { title: 'Pedidos e inventario', text: 'Stock, quiebres y prioridades de despacho.' },
        { title: 'Compras y proveedores', text: 'Órdenes, plazos y condiciones.' },
        { title: 'Finanzas y cobranzas', text: 'Facturas, vencimientos y planes de pago.' },
      ],
      questions: [
        { q: '¿Qué clientes están comprando menos que hace tres meses?', area: 'Ventas' },
        { q: '¿Qué productos tienen riesgo de quiebre esta semana?', area: 'Inventario' },
        { q: '¿Qué pedidos deberían priorizarse hoy?', area: 'Pedidos' },
        { q: '¿Qué facturas vencidas requieren seguimiento?', area: 'Cobranzas' },
      ],
      agents: [
        { title: 'Agente comercial', text: 'Prepara seguimientos para clientes que compran menos.' },
        { title: 'Agente de cobranzas', text: 'Envía recordatorios y propone planes de pago dentro de las reglas.' },
        { title: 'Agente de compras', text: 'Prepara reposiciones y pide aprobación por encima del límite.' },
        { title: 'Agente operativo', text: 'Prioriza pedidos según stock, cliente y fecha comprometida.' },
      ],
      why: WHY.es,
      draft: false,
    },
    en: {
      label: 'Retail and distribution', short: 'Retail',
      blurb: 'Sales, orders, stock, purchasing and collections connected, so you operate with more visibility and clearer priorities.',
      hero: {
        h1: 'Every customer, order and supplier in one context.',
        lead: 'Nocti connects sales, stock, purchasing and collections so your team knows what to prioritize each day and your agents work by the same rules.',
      },
      whyFor: 'retail and distribution',
      processes: [
        { title: 'Sales and customers', text: 'Portfolio, purchase frequency and opportunities.' },
        { title: 'Orders and inventory', text: 'Stock, stockouts and dispatch priorities.' },
        { title: 'Purchasing and suppliers', text: 'Orders, lead times and terms.' },
        { title: 'Finance and collections', text: 'Invoices, due dates and payment plans.' },
      ],
      questions: [
        { q: 'Which customers are buying less than three months ago?', area: 'Sales' },
        { q: 'Which products are at risk of stocking out this week?', area: 'Inventory' },
        { q: 'Which orders should be prioritized today?', area: 'Orders' },
        { q: 'Which overdue invoices need follow-up?', area: 'Collections' },
      ],
      agents: [
        { title: 'Sales agent', text: 'Prepares follow-ups for customers who are buying less.' },
        { title: 'Collections agent', text: 'Sends reminders and proposes payment plans within the rules.' },
        { title: 'Purchasing agent', text: 'Prepares restocking and asks for approval above the limit.' },
        { title: 'Operations agent', text: 'Prioritizes orders by stock, customer and committed date.' },
      ],
      why: WHY.en,
      draft: false,
    },
  },
  manufactura: {
    es: {
      label: 'Manufactura', short: 'Manufactura',
      blurb: 'Producción, mantenimiento, calidad y abastecimiento conectados con los sistemas que la planta ya utiliza.',
      hero: {
        h1: 'Cada orden, insumo y línea de producción en un mismo contexto.',
        lead: 'Nocti conecta producción, compras, calidad y mantenimiento para que la planta sepa qué priorizar en cada turno y tus agentes trabajen con las mismas reglas.',
      },
      whyFor: 'manufactura',
      processes: [
        { title: 'Planificación y producción', text: 'Órdenes, capacidad y avance por línea.' },
        { title: 'Compras e insumos', text: 'Stock de materias primas, proveedores y plazos.' },
        { title: 'Calidad', text: 'Controles, desvíos y no conformidades.' },
        { title: 'Mantenimiento', text: 'Paradas, repuestos y planes preventivos.' },
      ],
      questions: [
        { q: '¿Qué órdenes están en riesgo de no cumplir la fecha comprometida?', area: 'Producción' },
        { q: '¿Qué insumos se van a quedar cortos para el plan de la semana?', area: 'Compras' },
        { q: '¿Qué línea acumula más desvíos de calidad este mes?', area: 'Calidad' },
        { q: '¿Qué paradas no planificadas se repitieron en el último trimestre?', area: 'Mantenimiento' },
      ],
      agents: [
        { title: 'Agente de planificación', text: 'Reordena la producción cuando falta un insumo o se detiene una línea.' },
        { title: 'Agente de compras', text: 'Prepara reposiciones de insumos y pide aprobación por encima del límite.' },
        { title: 'Agente de calidad', text: 'Registra desvíos y avisa al responsable con el contexto del lote.' },
        { title: 'Agente de mantenimiento', text: 'Agenda preventivos según las horas de uso y avisa antes de cada parada.' },
      ],
      why: WHY.es,
      draft: true,
    },
    en: {
      label: 'Manufacturing', short: 'Manufacturing',
      blurb: 'Production, maintenance, quality and supply connected to the systems the plant already uses.',
      hero: {
        h1: 'Every order, input and production line in one context.',
        lead: 'Nocti connects production, purchasing, quality and maintenance so the plant knows what to prioritize each shift and your agents work by the same rules.',
      },
      whyFor: 'manufacturing',
      processes: [
        { title: 'Planning and production', text: 'Orders, capacity and progress by line.' },
        { title: 'Purchasing and inputs', text: 'Raw material stock, suppliers and lead times.' },
        { title: 'Quality', text: 'Checks, deviations and non-conformities.' },
        { title: 'Maintenance', text: 'Downtime, spare parts and preventive plans.' },
      ],
      questions: [
        { q: 'Which orders are at risk of missing their committed date?', area: 'Production' },
        { q: 'Which inputs will run short for this week’s plan?', area: 'Purchasing' },
        { q: 'Which line has the most quality deviations this month?', area: 'Quality' },
        { q: 'Which unplanned stops repeated in the last quarter?', area: 'Maintenance' },
      ],
      agents: [
        { title: 'Planning agent', text: 'Reschedules production when an input is missing or a line stops.' },
        { title: 'Purchasing agent', text: 'Prepares input restocking and asks for approval above the limit.' },
        { title: 'Quality agent', text: 'Logs deviations and alerts the owner with the batch context.' },
        { title: 'Maintenance agent', text: 'Schedules preventive work by hours of use and warns before each stop.' },
      ],
      why: WHY.en,
      draft: true,
    },
  },
  consumo: {
    es: {
      label: 'Alimentos y bienes de consumo', short: 'Consumo masivo',
      blurb: 'Ventas, lotes, inventario, vencimientos y distribución conectados en una misma operación.',
      hero: {
        h1: 'Cada lote, canal y cliente en un mismo contexto.',
        lead: 'Nocti conecta producción, lotes, vencimientos y canales de venta para que tu equipo cuide el margen todos los días y tus agentes trabajen con las mismas reglas.',
      },
      whyFor: 'alimentos y bienes de consumo',
      processes: [
        { title: 'Lotes y vencimientos', text: 'Trazabilidad, fechas y rotación de stock.' },
        { title: 'Canales y clientes', text: 'Supermercados, mayoristas y venta directa.' },
        { title: 'Precios y márgenes', text: 'Listas, promociones y rentabilidad por producto.' },
        { title: 'Distribución', text: 'Pedidos, rutas y entregas.' },
      ],
      questions: [
        { q: '¿Qué lotes vencen en los próximos 30 días y dónde están?', area: 'Lotes' },
        { q: '¿Qué canal perdió margen este mes y por qué?', area: 'Márgenes' },
        { q: '¿Qué promociones aumentaron el volumen sin bajar la rentabilidad?', area: 'Comercial' },
        { q: '¿Qué clientes tienen entregas atrasadas esta semana?', area: 'Distribución' },
      ],
      agents: [
        { title: 'Agente de vencimientos', text: 'Detecta lotes próximos a vencer y propone acciones de rotación.' },
        { title: 'Agente comercial', text: 'Prepara seguimientos para cuentas que bajaron su volumen.' },
        { title: 'Agente de precios', text: 'Señala productos con margen por debajo de lo definido.' },
        { title: 'Agente de distribución', text: 'Prioriza pedidos según cliente, fecha y disponibilidad.' },
      ],
      why: WHY.es,
      draft: true,
    },
    en: {
      label: 'Food and consumer goods', short: 'Consumer goods',
      blurb: 'Sales, batches, inventory, expiry dates and distribution connected in a single operation.',
      hero: {
        h1: 'Every batch, channel and customer in one context.',
        lead: 'Nocti connects production, batches, expiry dates and sales channels so your team protects margin every day and your agents work by the same rules.',
      },
      whyFor: 'food and consumer goods',
      processes: [
        { title: 'Batches and expiry', text: 'Traceability, dates and stock rotation.' },
        { title: 'Channels and customers', text: 'Supermarkets, wholesalers and direct sales.' },
        { title: 'Pricing and margins', text: 'Price lists, promotions and profitability by product.' },
        { title: 'Distribution', text: 'Orders, routes and deliveries.' },
      ],
      questions: [
        { q: 'Which batches expire in the next 30 days and where are they?', area: 'Batches' },
        { q: 'Which channel lost margin this month, and why?', area: 'Margins' },
        { q: 'Which promotions grew volume without hurting profitability?', area: 'Sales' },
        { q: 'Which customers have late deliveries this week?', area: 'Distribution' },
      ],
      agents: [
        { title: 'Expiry agent', text: 'Spots batches close to expiry and proposes rotation actions.' },
        { title: 'Sales agent', text: 'Prepares follow-ups for accounts whose volume dropped.' },
        { title: 'Pricing agent', text: 'Flags products with margins below target.' },
        { title: 'Distribution agent', text: 'Prioritizes orders by customer, date and availability.' },
      ],
      why: WHY.en,
      draft: true,
    },
  },
  salud: {
    es: {
      label: 'Salud y actividad física', short: 'Salud y fitness',
      blurb: 'Pacientes o socios, sedes, agenda, atención y administración conectados con permisos por rol.',
      hero: {
        h1: 'Cada socio, sede y agenda en un mismo contexto.',
        lead: 'Nocti conecta socios, sedes, agenda y cobranzas para que cada equipo vea lo que necesita y tus agentes trabajen con permisos claros por rol.',
      },
      whyFor: 'salud y actividad física',
      processes: [
        { title: 'Socios y membresías', text: 'Altas, bajas, planes y renovaciones.' },
        { title: 'Agenda y sedes', text: 'Turnos, clases y ocupación por sede.' },
        { title: 'Cobranzas', text: 'Cuotas, débitos y morosidad.' },
        { title: 'Atención', text: 'Consultas, reclamos y seguimiento.' },
      ],
      questions: [
        { q: '¿Qué socios tienen riesgo de darse de baja este mes?', area: 'Socios' },
        { q: '¿Qué sedes tienen horarios con poca ocupación?', area: 'Agenda' },
        { q: '¿Qué cuotas vencidas conviene gestionar hoy?', area: 'Cobranzas' },
        { q: '¿Qué reclamos se repiten más en cada sede?', area: 'Atención' },
      ],
      agents: [
        { title: 'Agente de retención', text: 'Detecta socios con baja asistencia y propone un contacto.' },
        { title: 'Agente de cobranzas', text: 'Envía recordatorios y propone planes de pago dentro de las reglas.' },
        { title: 'Agente de agenda', text: 'Sugiere ajustes de horarios según la ocupación real.' },
        { title: 'Agente de atención', text: 'Responde consultas frecuentes con la información de cada sede.' },
      ],
      why: WHY.es,
      draft: true,
    },
    en: {
      label: 'Health and fitness', short: 'Health & fitness',
      blurb: 'Patients or members, locations, scheduling, service and administration connected, with role-based permissions.',
      hero: {
        h1: 'Every member, location and schedule in one context.',
        lead: 'Nocti connects members, locations, schedules and collections so each team sees what it needs and your agents work with clear permissions by role.',
      },
      whyFor: 'health and fitness',
      processes: [
        { title: 'Members and memberships', text: 'Sign-ups, cancellations, plans and renewals.' },
        { title: 'Schedules and locations', text: 'Bookings, classes and occupancy by location.' },
        { title: 'Collections', text: 'Fees, direct debits and arrears.' },
        { title: 'Member service', text: 'Questions, complaints and follow-up.' },
      ],
      questions: [
        { q: 'Which members are at risk of cancelling this month?', area: 'Members' },
        { q: 'Which locations have time slots with low occupancy?', area: 'Schedules' },
        { q: 'Which overdue fees should be handled today?', area: 'Collections' },
        { q: 'Which complaints repeat most at each location?', area: 'Service' },
      ],
      agents: [
        { title: 'Retention agent', text: 'Spots members with low attendance and proposes outreach.' },
        { title: 'Collections agent', text: 'Sends reminders and proposes payment plans within the rules.' },
        { title: 'Scheduling agent', text: 'Suggests schedule changes based on real occupancy.' },
        { title: 'Service agent', text: 'Answers frequent questions with each location’s information.' },
      ],
      why: WHY.en,
      draft: true,
    },
  },
  servicios: {
    es: {
      label: 'Servicios profesionales y empresariales', short: 'Servicios',
      blurb: 'Clientes, proyectos, conocimiento, entregables y facturación conectados en un mismo contexto.',
      hero: {
        h1: 'Cada cliente, proyecto y hora en un mismo contexto.',
        lead: 'Nocti conecta clientes, proyectos, horas y facturación para que tu equipo sepa dónde está la rentabilidad y tus agentes trabajen con las mismas reglas.',
      },
      whyFor: 'servicios profesionales y empresariales',
      processes: [
        { title: 'Clientes y propuestas', text: 'Oportunidades, propuestas y renovaciones.' },
        { title: 'Proyectos', text: 'Alcance, avance y entregables.' },
        { title: 'Horas y equipo', text: 'Carga, asignación y disponibilidad.' },
        { title: 'Facturación y cobranzas', text: 'Facturas, vencimientos y cobros.' },
      ],
      questions: [
        { q: '¿Qué proyectos están consumiendo más horas de las presupuestadas?', area: 'Proyectos' },
        { q: '¿Qué clientes tienen facturas vencidas hace más de 30 días?', area: 'Cobranzas' },
        { q: '¿Quién del equipo tiene disponibilidad el mes que viene?', area: 'Equipo' },
        { q: '¿Qué propuestas están por vencer sin respuesta?', area: 'Comercial' },
      ],
      agents: [
        { title: 'Agente de proyectos', text: 'Avisa cuando un proyecto se desvía de las horas presupuestadas.' },
        { title: 'Agente de cobranzas', text: 'Envía recordatorios y propone planes de pago dentro de las reglas.' },
        { title: 'Agente comercial', text: 'Hace seguimiento de propuestas abiertas y renovaciones.' },
        { title: 'Agente de recursos', text: 'Sugiere asignaciones según disponibilidad y experiencia.' },
      ],
      why: WHY.es,
      draft: true,
    },
    en: {
      label: 'Professional and business services', short: 'Services',
      blurb: 'Clients, projects, knowledge, deliverables and billing connected in a single context.',
      hero: {
        h1: 'Every client, project and hour in one context.',
        lead: 'Nocti connects clients, projects, hours and billing so your team knows where profitability is and your agents work by the same rules.',
      },
      whyFor: 'professional and business services',
      processes: [
        { title: 'Clients and proposals', text: 'Opportunities, proposals and renewals.' },
        { title: 'Projects', text: 'Scope, progress and deliverables.' },
        { title: 'Hours and team', text: 'Workload, allocation and availability.' },
        { title: 'Billing and collections', text: 'Invoices, due dates and payments.' },
      ],
      questions: [
        { q: 'Which projects are using more hours than budgeted?', area: 'Projects' },
        { q: 'Which clients have invoices overdue by more than 30 days?', area: 'Collections' },
        { q: 'Who on the team has availability next month?', area: 'Team' },
        { q: 'Which proposals are about to expire without a reply?', area: 'Sales' },
      ],
      agents: [
        { title: 'Projects agent', text: 'Warns when a project drifts from its budgeted hours.' },
        { title: 'Collections agent', text: 'Sends reminders and proposes payment plans within the rules.' },
        { title: 'Sales agent', text: 'Follows up on open proposals and renewals.' },
        { title: 'Resourcing agent', text: 'Suggests assignments by availability and experience.' },
      ],
      why: WHY.en,
      draft: true,
    },
  },
};

export const industry = (id: IndustryId, locale: Locale): Industry => industries[id][locale];
