import '@common'
import { app } from "@common/js/app";
import '@layouts/base/header'
import '@layouts/base/footer'
import '@shared/logo'

document.addEventListener('DOMContentLoaded', () => {
  app.initDependencies()
})