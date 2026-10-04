import {defineCliConfig} from 'sanity/cli'
import {projectId, dataset} from './env.js'

export default defineCliConfig({
  api: {projectId, dataset},
  studioHost: 'noctilabs',
  deployment: {appId: 'ha7oz27kd5g92zyod8hrzk5h'},
})
