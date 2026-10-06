// «Preguntá. Entendé. Actuá.» de Producto: los 7 roles de la v4 (Nocti App v2 de la raíz, ROLES), con dos preguntas cada uno.
// ES literal de la v4, salvo las cobranzas vencidas, que salen de facts.ts (datos coherentes, spec 007 F3).
// EN provisorio (spec 007 F4): i18n-en.js no trae estas claves; pendiente de revisión del dueño.
import { OVER_30 } from '../noctiapp/data/facts';
import { makeFmt } from '../noctiapp/data/format';
import type { Locale, Person } from '../noctiapp/data/types';
import { esPct } from './shared';

export type Role4 = 'ceo' | 'comercial' | 'operaciones' | 'finanzas' | 'marketing' | 'rrhh' | 'agentes';
export const ROLE4_ORDER: Role4[] = ['ceo', 'comercial', 'operaciones', 'finanzas', 'marketing', 'rrhh', 'agentes'];

export interface RoleQ {
  q: string;
  lead: string;
  /** [título, texto]; sin título, el ítem es solo el texto. */
  items: [string, string][];
  note?: string;
  figs?: [string, string][];
  diff?: string;
  actions: [string, string, string];
}
export interface RoleData {
  tab: string;
  /** Etiqueta de «Consultando contexto · …». */
  label: string;
  /** Píldora de arriba y «Qué puede ver» en mobile. */
  who: string;
  /** Nombre sobre la burbuja de la pregunta. */
  chatName: string;
  person: Person;
  perms: [0 | 1, string][];
  ctx: [string, string][];
  sources: string[];
  qs: [RoleQ, RoleQ];
}
export interface RolesCopy {
  roles: Record<Role4, RoleData>;
  permsTitle: string;
  permsTitleAgents: string;
  canSee: string;
  diff: string;
  sees: string;
  hidden: string;
}

const es = makeFmt('es');
const en = makeFmt('en');

const ES: RolesCopy = esPct({
  permsTitle: 'Permisos de este rol',
  permsTitleAgents: 'Permisos de los agentes',
  canSee: 'Qué puede ver',
  diff: 'Diferencia',
  sees: 'Puede ver',
  hidden: 'No ve',
  roles: {
    ceo: {
      tab: 'CEO', label: 'CEO', who: 'Laura Méndez · CEO', chatName: 'Laura Méndez',
      person: { name: 'Laura Méndez', first: 'Laura', initials: 'LM', puesto: 'CEO', bg: '#0038CC' },
      perms: [[1, 'Toda la empresa, en datos agregados y en detalle.'], [0, 'Legajos y datos personales sensibles de RRHH.']],
      ctx: [['Sistemas', 'ERP · CRM · Drive · WhatsApp'], ['Entidades', 'Clientes · Pedidos · Productos · Proveedores'], ['Procesos', 'Ventas · Cobranzas · Compras · Operaciones'], ['Reglas', 'Crédito · Descuentos · Compras'], ['Personas', '4 equipos · 38 personas']],
      sources: ['ERP · Ventas', 'ERP · Costos', 'CRM · Cuentas'],
      qs: [
        { q: '¿Cómo viene el negocio hoy y qué debería mirar?', lead: 'Ventas del mes al 62% del objetivo, con 58% del período transcurrido. Hay tres temas para mirar:',
          items: [['Margen', 'Bajó 3,2 pp esta semana, principalmente por aumento del costo de insumos.'], ['Clientes', '4 cuentas mayoristas están comprando menos que hace tres meses.'], ['Cobranzas', `${es.mill(OVER_30)} vencidos a más de 30 días, concentrados en 6 clientes.`]],
          actions: ['Ver análisis de margen', 'Revisar clientes en riesgo', 'Ver cobranzas'] },
        { q: '¿Qué cambió esta semana que debería saber?', lead: 'Hay tres cambios relevantes respecto a la semana anterior:',
          items: [['Ventas', 'Las ventas semanales crecieron 8% y tres clientes retomaron niveles de compra habituales.'], ['Margen', 'El margen bruto cayó 1,4 pp por aumento de costos en materias primas.'], ['Operación', 'Los pedidos demorados aumentaron de 4 a 9 por faltantes de stock.']],
          actions: ['Ver crecimiento de ventas', 'Analizar margen', 'Revisar pedidos demorados'] },
      ],
    },
    comercial: {
      tab: 'Comercial', label: 'Comercial', who: 'Jorge Rodríguez · Comercial', chatName: 'Jorge Rodríguez',
      person: { name: 'Jorge Rodríguez', first: 'Jorge', initials: 'JR', puesto: 'Comercial', bg: '#24613F' },
      perms: [[1, 'Sus cuentas, pedidos, oportunidades e historial de contacto.'], [0, 'Costos, márgenes globales y cuentas de otros vendedores.']],
      ctx: [['Sistemas', 'CRM · ERP Ventas · WhatsApp · Correo'], ['Entidades', 'Clientes · Pedidos · Productos · Oportunidades'], ['Procesos', 'Venta · Seguimiento · Cotización · Cobranzas'], ['Reglas', 'Descuentos · Crédito · Frecuencia de contacto'], ['Personas', 'Equipo Comercial']],
      sources: ['CRM · Cartera', 'ERP · Ventas', 'CRM · Cotizaciones'],
      qs: [
        { q: '¿Qué clientes debería contactar hoy y por qué?', lead: 'Hay 12 clientes prioritarios para hoy:',
          items: [['', '5 clientes compraron más de 20% menos que su promedio de los últimos 90 días.'], ['', '4 clientes tienen cotizaciones abiertas sin seguimiento hace más de 7 días.'], ['', '3 clientes compraron una categoría con oportunidad clara de venta cruzada.']],
          actions: ['Ver lista de clientes', 'Preparar seguimientos', 'Crear tareas'] },
        { q: '¿Dónde tengo oportunidades de venta que todavía no estamos aprovechando?', lead: 'Detecté 8 oportunidades con mayor potencial:',
          items: [['', '3 clientes compran regularmente la línea A pero nunca compraron la línea B.'], ['', '2 cuentas aumentaron volumen más de 30% en los últimos dos meses.'], ['', '3 clientes inactivos tienen historial de compra alto y no reciben contacto hace más de 45 días.']],
          actions: ['Ver oportunidades', 'Preparar propuesta', 'Generar seguimiento'] },
      ],
    },
    operaciones: {
      tab: 'Operaciones', label: 'Operaciones', who: 'Silvana Pérez · Operaciones', chatName: 'Silvana Pérez',
      person: { name: 'Silvana Pérez', first: 'Silvana', initials: 'SP', puesto: 'Operaciones', bg: '#7A5208' },
      perms: [[1, 'Pedidos, stock, proveedores y logística.'], [0, 'Rentabilidad por cliente y datos financieros sensibles.']],
      ctx: [['Sistemas', 'ERP · WMS · Drive · Logística'], ['Entidades', 'Pedidos · Productos · Stock · Proveedores'], ['Procesos', 'Preparación · Compras · Despacho · Entrega'], ['Reglas', 'Prioridad · Stock mínimo · SLA · Compras'], ['Personas', 'Operaciones · Depósito · Compras']],
      sources: ['ERP · Pedidos', 'WMS · Stock', 'Logística · Entregas'],
      qs: [
        { q: '¿Qué está frenando la operación hoy?', lead: 'Hay 7 pedidos con riesgo operativo:',
          items: [['', '4 pedidos esperan reposición de stock.'], ['', '2 pedidos están bloqueados por aprobación comercial.'], ['', '1 pedido tiene una incidencia logística pendiente.']],
          note: 'Los dos casos con mayor impacto corresponden a clientes mayoristas con entrega comprometida hoy.',
          actions: ['Ver pedidos afectados', 'Priorizar reposición', 'Escalar bloqueos'] },
        { q: '¿Qué pedidos o procesos tienen mayor riesgo de demorarse?', lead: 'Hay 11 pedidos con riesgo superior al normal:',
          items: [['', '6 dependen de productos con stock crítico.'], ['', '3 tienen proveedor fuera del plazo habitual.'], ['', '2 están esperando una aprobación interna.']],
          note: 'Si no se actúa hoy, 5 pedidos podrían incumplir la fecha prometida.',
          actions: ['Ver pedidos en riesgo', 'Revisar stock', 'Contactar proveedores'] },
      ],
    },
    finanzas: {
      tab: 'Finanzas', label: 'Finanzas', who: 'Martín López · Finanzas', chatName: 'Martín López',
      person: { name: 'Martín López', first: 'Martín', initials: 'ML', puesto: 'Finanzas', bg: '#3A3A38' },
      perms: [[1, 'Costos, margen, cobranzas, pagos y flujo de caja.'], [0, 'Legajos personales y contenido comercial no financiero.']],
      ctx: [['Sistemas', 'ERP Finanzas · Bancos · CRM · Compras'], ['Entidades', 'Facturas · Clientes · Proveedores · Productos'], ['Procesos', 'Cobranza · Pago · Compra · Facturación'], ['Reglas', 'Crédito · Vencimientos · Límites · Descuentos'], ['Personas', 'Finanzas · Administración']],
      sources: ['ERP · Costos', 'ERP · Ventas', 'CRM · Descuentos', 'Logística · Costos'],
      qs: [
        { q: '¿Dónde estamos perdiendo margen este mes?', lead: 'El margen bruto cayó 2,7 pp frente al promedio de los últimos tres meses:',
          items: [['Insumos', 'Tres líneas concentran 54% del impacto por aumento de costos.'], ['Descuentos', 'Dos cuentas están operando por encima de la política habitual.'], ['Logística', 'La zona norte tuvo un aumento de 18% en costo por entrega.']],
          actions: ['Ver productos afectados', 'Revisar descuentos', 'Analizar costo logístico'] },
        { q: '¿Qué debería preocuparme de caja esta semana?', figs: [['Cobros proyectados', '$18,4 M'], ['Pagos previstos', '$22,1 M']], diff: '−$3,7 M', lead: 'La diferencia está concentrada en:',
          items: [['', '6 clientes con facturas vencidas.'], ['', '2 órdenes de compra extraordinarias.'], ['', '1 pago importante previsto antes del ingreso principal de la semana.']],
          actions: ['Ver flujo de caja', 'Priorizar cobranzas', 'Revisar pagos'] },
      ],
    },
    marketing: {
      tab: 'Marketing', label: 'Marketing', who: 'Sofía Fernández · Marketing', chatName: 'Sofía Fernández',
      person: { name: 'Sofía Fernández', first: 'Sofía', initials: 'SF', puesto: 'Marketing', bg: '#8A3A2F' },
      perms: [[1, 'Campañas, audiencias, productos, leads y ventas atribuidas.'], [0, 'Costos financieros, márgenes completos y datos personales sensibles.']],
      ctx: [['Sistemas', 'Meta Ads · Google Ads · CRM · Analytics · ERP'], ['Entidades', 'Campañas · Leads · Clientes · Productos'], ['Procesos', 'Campañas · Captación · Conversión · Retención'], ['Reglas', 'Presupuesto · Segmentación · Atribución'], ['Personas', 'Marketing · Comercial']],
      sources: ['Meta Ads', 'Google Ads', 'CRM', 'ERP Ventas'],
      qs: [
        { q: '¿Qué campañas están generando ventas reales?', lead: 'Tres campañas concentran 72% de las ventas atribuidas este mes:',
          items: [['Remarketing', 'ROAS 4,8x y mayor tasa de conversión.'], ['Search de marca', 'ROAS 3,9x y menor costo de adquisición.'], ['Awareness', 'Alto volumen de tráfico, pero baja contribución directa a ventas.']],
          actions: ['Ver campañas', 'Reasignar presupuesto', 'Explorar segmentos'] },
        { q: '¿Qué segmentos o productos están respondiendo mejor y dónde conviene invertir más?', lead: 'Tres segmentos muestran mejor desempeño:',
          items: [['Clientes recurrentes', 'Conversión 34% superior al promedio.'], ['Mayoristas medianos', 'Ticket promedio 22% más alto.'], ['Línea industrial', 'Mayor crecimiento en ventas provenientes de campañas.']],
          actions: ['Ver segmentos', 'Simular reasignación', 'Crear audiencia'] },
      ],
    },
    rrhh: {
      tab: 'RRHH', label: 'RRHH', who: 'Ana Martínez · RRHH', chatName: 'Ana Martínez',
      person: { name: 'Ana Martínez', first: 'Ana', initials: 'AM', puesto: 'RRHH', bg: '#5B3E8A' },
      perms: [[1, 'Equipos, carga de trabajo, procesos internos y datos organizacionales autorizados.'], [0, 'Información comercial o financiera fuera de su función.']],
      ctx: [['Sistemas', 'HRIS · ERP · Gestión de tareas · Drive'], ['Entidades', 'Equipos · Roles · Tareas · Procesos'], ['Procesos', 'Administración · Onboarding · Aprobaciones · Gestión interna'], ['Reglas', 'Roles · Responsabilidades · Políticas internas'], ['Personas', 'Toda la organización según permisos']],
      sources: ['HRIS', 'ERP', 'Gestión de tareas'],
      qs: [
        { q: '¿Dónde tenemos mayor presión de capacidad en los equipos?', lead: 'Operaciones concentra la mayor presión esta semana:',
          items: [['Operaciones', '18% más tareas abiertas que su promedio trimestral.'], ['Compras', 'Aumentó el tiempo promedio de resolución en 21%.'], ['Administración', 'Tres procesos manuales explican gran parte de la carga repetitiva.']],
          actions: ['Ver carga por equipo', 'Revisar procesos', 'Identificar tareas automatizables'] },
        { q: '¿Qué procesos internos están consumiendo más tiempo del equipo?', lead: 'Tres procesos concentran aproximadamente 27% del trabajo administrativo repetitivo:',
          items: [['Alta de proveedores', 'Validación manual de documentos y datos.'], ['Conciliación de facturas', 'Cruce entre ERP, correo y comprobantes.'], ['Seguimiento de aprobaciones', 'Recordatorios y coordinación entre áreas.']],
          actions: ['Ver procesos', 'Analizar tiempos', 'Evaluar automatización'] },
      ],
    },
    agentes: {
      tab: 'Agentes', label: 'Agentes', who: 'Agentes · 3 activos', chatName: 'Supervisión de agentes',
      person: { name: 'Agentes', first: '', initials: '', puesto: '3 activos', bg: '#0047FF', bot: true },
      perms: [[1, 'Acceden solo a los sistemas y datos asignados a cada agente.'], [1, 'Ejecutan tareas dentro de las reglas y límites definidos.'], [0, 'No modifican condiciones comerciales ni precios.'], [0, 'No ejecutan acciones fuera de límite sin aprobación humana.']],
      ctx: [['Sistemas', 'ERP · CRM · Correo · WhatsApp'], ['Entidades', 'Tareas · Acciones · Aprobaciones · Excepciones'], ['Procesos', 'Ejecución · Aprobación · Seguimiento'], ['Reglas', 'Permisos · Límites · Excepciones · Aprobaciones']],
      sources: ['Actividad de agentes', 'Aprobaciones', 'ERP'],
      qs: [
        { q: '¿Qué están haciendo mis agentes ahora?', lead: '3 agentes activos, 42 tareas ejecutadas hoy:',
          items: [['', '31 tareas completadas automáticamente dentro de las reglas.'], ['', '8 tareas en curso, sin incidencias.'], ['', '3 acciones esperan aprobación humana antes de ejecutarse.']],
          actions: ['Revisar aprobaciones', 'Ver actividad', 'Ver agentes'] },
        { q: '¿Qué tareas o excepciones requieren mi atención antes de seguir ejecutando?', lead: 'Hay 4 casos que requieren intervención:',
          items: [['', '2 acciones superan los límites definidos y esperan aprobación.'], ['', '1 dato no coincide entre dos sistemas y frenó una tarea.'], ['', '1 solicitud de un cliente quedó fuera de política.']],
          note: 'El resto de las tareas puede continuar automáticamente.',
          actions: ['Solicitar aprobación', 'Revisar diferencia', 'Pausar tarea'] },
      ],
    },
  },
});

const EN: RolesCopy = {
  permsTitle: 'Permissions for this role',
  permsTitleAgents: 'Agent permissions',
  canSee: 'What they can see',
  diff: 'Difference',
  sees: 'Can see',
  hidden: 'Can’t see',
  roles: {
    ceo: {
      tab: 'CEO', label: 'CEO', who: 'Laura Méndez · CEO', chatName: 'Laura Méndez',
      person: { name: 'Laura Méndez', first: 'Laura', initials: 'LM', puesto: 'CEO', bg: '#0038CC' },
      perms: [[1, 'The whole company, aggregated and in detail.'], [0, 'HR files and sensitive personal data.']],
      ctx: [['Systems', 'ERP · CRM · Drive · WhatsApp'], ['Entities', 'Customers · Orders · Products · Suppliers'], ['Processes', 'Sales · Collections · Purchasing · Operations'], ['Rules', 'Credit · Discounts · Purchasing'], ['People', '4 teams · 38 people']],
      sources: ['ERP · Sales', 'ERP · Costs', 'CRM · Accounts'],
      qs: [
        { q: 'How is the business doing today and what should I look at?', lead: 'Sales for the month are at 62% of target, with 58% of the period gone. Three things to look at:',
          items: [['Margin', 'Down 3.2 pp this week, mainly because of higher input costs.'], ['Customers', '4 wholesale accounts are buying less than three months ago.'], ['Collections', `${en.mill(OVER_30)} overdue by more than 30 days, concentrated in 6 customers.`]],
          actions: ['See margin analysis', 'Review at-risk customers', 'See collections'] },
        { q: 'What changed this week that I should know about?', lead: 'There are three relevant changes versus last week:',
          items: [['Sales', 'Weekly sales grew 8% and three customers returned to their usual buying levels.'], ['Margin', 'Gross margin fell 1.4 pp because of higher raw material costs.'], ['Operations', 'Delayed orders went from 4 to 9 because of stockouts.']],
          actions: ['See sales growth', 'Analyze margin', 'Review delayed orders'] },
      ],
    },
    comercial: {
      tab: 'Sales', label: 'Sales', who: 'Jorge Rodríguez · Sales', chatName: 'Jorge Rodríguez',
      person: { name: 'Jorge Rodríguez', first: 'Jorge', initials: 'JR', puesto: 'Sales', bg: '#24613F' },
      perms: [[1, 'Their accounts, orders, opportunities and contact history.'], [0, 'Costs, overall margins and other reps’ accounts.']],
      ctx: [['Systems', 'CRM · ERP Sales · WhatsApp · Email'], ['Entities', 'Customers · Orders · Products · Opportunities'], ['Processes', 'Sales · Follow-up · Quoting · Collections'], ['Rules', 'Discounts · Credit · Contact frequency'], ['People', 'Sales team']],
      sources: ['CRM · Accounts', 'ERP · Sales', 'CRM · Quotes'],
      qs: [
        { q: 'Which customers should I contact today, and why?', lead: 'There are 12 priority customers for today:',
          items: [['', '5 customers bought more than 20% below their 90-day average.'], ['', '4 customers have open quotes with no follow-up for over 7 days.'], ['', '3 customers bought a category with a clear cross-sell opportunity.']],
          actions: ['See customer list', 'Prepare follow-ups', 'Create tasks'] },
        { q: 'Where do I have sales opportunities we’re not taking yet?', lead: 'I found 8 opportunities with the most potential:',
          items: [['', '3 customers regularly buy line A but have never bought line B.'], ['', '2 accounts grew volume by more than 30% in the last two months.'], ['', '3 inactive customers have a strong purchase history and haven’t been contacted in over 45 days.']],
          actions: ['See opportunities', 'Prepare proposal', 'Create follow-up'] },
      ],
    },
    operaciones: {
      tab: 'Operations', label: 'Operations', who: 'Silvana Pérez · Operations', chatName: 'Silvana Pérez',
      person: { name: 'Silvana Pérez', first: 'Silvana', initials: 'SP', puesto: 'Operations', bg: '#7A5208' },
      perms: [[1, 'Orders, stock, suppliers and logistics.'], [0, 'Customer profitability and sensitive financial data.']],
      ctx: [['Systems', 'ERP · WMS · Drive · Logistics'], ['Entities', 'Orders · Products · Stock · Suppliers'], ['Processes', 'Picking · Purchasing · Dispatch · Delivery'], ['Rules', 'Priority · Minimum stock · SLA · Purchasing'], ['People', 'Operations · Warehouse · Purchasing']],
      sources: ['ERP · Orders', 'WMS · Stock', 'Logistics · Deliveries'],
      qs: [
        { q: 'What is holding operations back today?', lead: 'There are 7 orders at operational risk:',
          items: [['', '4 orders are waiting for restocking.'], ['', '2 orders are blocked pending sales approval.'], ['', '1 order has an open logistics issue.']],
          note: 'The two highest-impact cases are wholesale customers with delivery promised for today.',
          actions: ['See affected orders', 'Prioritize restocking', 'Escalate blockers'] },
        { q: 'Which orders or processes are most at risk of delay?', lead: 'There are 11 orders with higher-than-normal risk:',
          items: [['', '6 depend on products with critical stock.'], ['', '3 have a supplier outside its usual lead time.'], ['', '2 are waiting for an internal approval.']],
          note: 'Without action today, 5 orders could miss their promised date.',
          actions: ['See orders at risk', 'Review stock', 'Contact suppliers'] },
      ],
    },
    finanzas: {
      tab: 'Finance', label: 'Finance', who: 'Martín López · Finance', chatName: 'Martín López',
      person: { name: 'Martín López', first: 'Martín', initials: 'ML', puesto: 'Finance', bg: '#3A3A38' },
      perms: [[1, 'Costs, margin, collections, payments and cash flow.'], [0, 'Personal files and non-financial sales content.']],
      ctx: [['Systems', 'ERP Finance · Banks · CRM · Purchasing'], ['Entities', 'Invoices · Customers · Suppliers · Products'], ['Processes', 'Collections · Payments · Purchasing · Invoicing'], ['Rules', 'Credit · Due dates · Limits · Discounts'], ['People', 'Finance · Administration']],
      sources: ['ERP · Costs', 'ERP · Sales', 'CRM · Discounts', 'Logistics · Costs'],
      qs: [
        { q: 'Where are we losing margin this month?', lead: 'Gross margin fell 2.7 pp versus the average of the last three months:',
          items: [['Inputs', 'Three lines account for 54% of the impact from higher costs.'], ['Discounts', 'Two accounts are operating above the usual policy.'], ['Logistics', 'The north zone saw an 18% increase in cost per delivery.']],
          actions: ['See affected products', 'Review discounts', 'Analyze logistics cost'] },
        { q: 'What should worry me about cash this week?', figs: [['Projected collections', '$18.4M'], ['Planned payments', '$22.1M']], diff: '−$3.7M', lead: 'The gap is concentrated in:',
          items: [['', '6 customers with overdue invoices.'], ['', '2 one-off purchase orders.'], ['', '1 large payment due before the week’s main inflow.']],
          actions: ['See cash flow', 'Prioritize collections', 'Review payments'] },
      ],
    },
    marketing: {
      tab: 'Marketing', label: 'Marketing', who: 'Sofía Fernández · Marketing', chatName: 'Sofía Fernández',
      person: { name: 'Sofía Fernández', first: 'Sofía', initials: 'SF', puesto: 'Marketing', bg: '#8A3A2F' },
      perms: [[1, 'Campaigns, audiences, products, leads and attributed sales.'], [0, 'Financial costs, full margins and sensitive personal data.']],
      ctx: [['Systems', 'Meta Ads · Google Ads · CRM · Analytics · ERP'], ['Entities', 'Campaigns · Leads · Customers · Products'], ['Processes', 'Campaigns · Acquisition · Conversion · Retention'], ['Rules', 'Budget · Targeting · Attribution'], ['People', 'Marketing · Sales']],
      sources: ['Meta Ads', 'Google Ads', 'CRM', 'ERP Sales'],
      qs: [
        { q: 'Which campaigns are driving real sales?', lead: 'Three campaigns account for 72% of attributed sales this month:',
          items: [['Remarketing', 'ROAS 4.8x and the highest conversion rate.'], ['Brand search', 'ROAS 3.9x and the lowest acquisition cost.'], ['Awareness', 'High traffic volume, but a low direct contribution to sales.']],
          actions: ['See campaigns', 'Reallocate budget', 'Explore segments'] },
        { q: 'Which segments or products are responding best, and where should we invest more?', lead: 'Three segments are performing best:',
          items: [['Repeat customers', 'Conversion 34% above average.'], ['Mid-size wholesalers', 'Average ticket 22% higher.'], ['Industrial line', 'Fastest growth in campaign-driven sales.']],
          actions: ['See segments', 'Simulate reallocation', 'Create audience'] },
      ],
    },
    rrhh: {
      tab: 'HR', label: 'HR', who: 'Ana Martínez · HR', chatName: 'Ana Martínez',
      person: { name: 'Ana Martínez', first: 'Ana', initials: 'AM', puesto: 'HR', bg: '#5B3E8A' },
      perms: [[1, 'Teams, workload, internal processes and authorized organizational data.'], [0, 'Sales or financial information outside their role.']],
      ctx: [['Systems', 'HRIS · ERP · Task management · Drive'], ['Entities', 'Teams · Roles · Tasks · Processes'], ['Processes', 'Administration · Onboarding · Approvals · Internal management'], ['Rules', 'Roles · Responsibilities · Internal policies'], ['People', 'The whole organization, per permissions']],
      sources: ['HRIS', 'ERP', 'Task management'],
      qs: [
        { q: 'Where are teams under the most capacity pressure?', lead: 'Operations is under the most pressure this week:',
          items: [['Operations', '18% more open tasks than its quarterly average.'], ['Purchasing', 'Average resolution time rose 21%.'], ['Administration', 'Three manual processes explain much of the repetitive workload.']],
          actions: ['See workload by team', 'Review processes', 'Find tasks to automate'] },
        { q: 'Which internal processes are taking up the most team time?', lead: 'Three processes account for roughly 27% of repetitive administrative work:',
          items: [['Supplier onboarding', 'Manual validation of documents and data.'], ['Invoice reconciliation', 'Cross-checking ERP, email and receipts.'], ['Approval follow-up', 'Reminders and coordination across areas.']],
          actions: ['See processes', 'Analyze times', 'Evaluate automation'] },
      ],
    },
    agentes: {
      tab: 'Agents', label: 'Agents', who: 'Agents · 3 active', chatName: 'Agent supervision',
      person: { name: 'Agents', first: '', initials: '', puesto: '3 active', bg: '#0047FF', bot: true },
      perms: [[1, 'They access only the systems and data assigned to each agent.'], [1, 'They run tasks within the defined rules and limits.'], [0, 'They don’t change commercial terms or prices.'], [0, 'They don’t run out-of-limit actions without human approval.']],
      ctx: [['Systems', 'ERP · CRM · Email · WhatsApp'], ['Entities', 'Tasks · Actions · Approvals · Exceptions'], ['Processes', 'Execution · Approval · Follow-up'], ['Rules', 'Permissions · Limits · Exceptions · Approvals']],
      sources: ['Agent activity', 'Approvals', 'ERP'],
      qs: [
        { q: 'What are my agents doing right now?', lead: '3 active agents, 42 tasks run today:',
          items: [['', '31 tasks completed automatically within the rules.'], ['', '8 tasks in progress, no issues.'], ['', '3 actions are waiting for human approval before running.']],
          actions: ['Review approvals', 'See activity', 'See agents'] },
        { q: 'Which tasks or exceptions need my attention before they keep running?', lead: 'There are 4 cases that need intervention:',
          items: [['', '2 actions exceed the defined limits and are waiting for approval.'], ['', '1 data point doesn’t match between two systems and stopped a task.'], ['', '1 customer request fell outside policy.']],
          note: 'The rest of the tasks can continue automatically.',
          actions: ['Request approval', 'Review mismatch', 'Pause task'] },
      ],
    },
  },
};

export const ROLES4: Record<Locale, RolesCopy> = { es: ES, en: EN };
