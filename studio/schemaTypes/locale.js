import {defineField, defineType} from 'sanity'

// English is the site default and is required; Spanish is optional and
// falls back to English when the visitor switches the site to ES.
const languages = [
  {id: 'en', title: 'English', required: true},
  {id: 'es', title: 'Español'},
]

function localized(name, title, fieldType) {
  return defineType({
    name,
    title,
    type: 'object',
    fields: languages.map((lang) =>
      defineField({
        name: lang.id,
        title: lang.title,
        ...fieldType,
        validation: lang.required ? (rule) => rule.required() : undefined,
      }),
    ),
  })
}

const block = {
  type: 'block',
  styles: [
    {title: 'Normal', value: 'normal'},
    {title: 'Heading', value: 'h2'},
    {title: 'Pull quote', value: 'blockquote'},
  ],
  lists: [
    {title: 'Bullet', value: 'bullet'},
    {title: 'Numbered', value: 'number'},
  ],
  marks: {
    decorators: [
      {title: 'Bold', value: 'strong'},
      {title: 'Italic', value: 'em'},
    ],
    annotations: [
      {
        name: 'link',
        type: 'object',
        title: 'Link',
        fields: [{name: 'href', type: 'url', validation: (rule) => rule.uri({allowRelative: true, scheme: ['http', 'https', 'mailto']})}],
      },
    ],
  },
}

export const localeString = localized('localeString', 'Localized string', {type: 'string'})
export const localeText = localized('localeText', 'Localized text', {type: 'text', rows: 3})
export const localeBody = localized('localeBody', 'Localized body', {type: 'array', of: [block]})
