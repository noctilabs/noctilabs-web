import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {projectId, dataset} from './env.js'
import {schemaTypes} from './schemaTypes/index.js'

export default defineConfig({
  name: 'default',
  title: 'NoctiLabs',
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: {types: schemaTypes},
})
