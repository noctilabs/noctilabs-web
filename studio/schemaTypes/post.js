import {defineField, defineType} from 'sanity'

// Categorías estables de Insights en la web nueva (src/content/categories.ts).
const topics = [
  {title: 'Tesis', value: 'tesis'},
  {title: 'Contexto de negocio', value: 'contexto'},
  {title: 'IA operativa', value: 'ia-operativa'},
  {title: 'Agentes', value: 'agentes'},
  {title: 'Transformación', value: 'transformacion'},
]

export const post = defineType({
  name: 'post',
  title: 'Blog post',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'localeString', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      description: 'English URL: noctilabs.io/en/insights/<slug> (old site: /blog/<slug>)',
      options: {source: 'title.en'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slugEs',
      title: 'Slug (español)',
      type: 'slug',
      description: 'URL en español: noctilabs.io/insights/<slug>. Si queda vacío, se usa el slug en inglés.',
      options: {source: 'title.es'},
    }),
    defineField({name: 'publishedAt', title: 'Published on', type: 'date', validation: (rule) => rule.required()}),
    defineField({
      name: 'showOnInsights',
      title: 'Mostrar en Insights (web nueva)',
      type: 'boolean',
      description:
        'Si está vacío, se usa «Show on /blog». Sólo se publican los posts completos en inglés y español (título, resumen y cuerpo).',
    }),
    defineField({
      name: 'topic',
      title: 'Categoría en Insights',
      type: 'string',
      options: {list: topics, layout: 'radio'},
      description: 'Si está vacía, se deduce de la categoría en inglés cuando coincide (Thesis, Agents, …).',
    }),
    defineField({
      name: 'listed',
      title: 'Show on /blog',
      type: 'boolean',
      description: 'When off, the post is still published at its URL but left out of the blog list.',
      initialValue: true,
    }),
    defineField({name: 'category', type: 'localeString', validation: (rule) => rule.required()}),
    defineField({
      name: 'excerpt',
      type: 'localeText',
      description: 'Shown on the blog list when this is the latest post, and used as the meta description.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'readingTime',
      title: 'Reading time (minutes)',
      type: 'number',
      description: 'Leave empty to calculate it from the English body.',
    }),
    defineField({name: 'body', type: 'localeBody', validation: (rule) => rule.required()}),
  ],
  orderings: [{title: 'Newest first', name: 'publishedAtDesc', by: [{field: 'publishedAt', direction: 'desc'}]}],
  preview: {
    select: {title: 'title.en', subtitle: 'publishedAt'},
  },
})
