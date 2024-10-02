export interface AppInterface {
  bodyBlock: ( isBlock?: boolean ) => void
  initDependencies: () => void
  setWindowVariables?: () => void
}
export interface App extends Omit<AppInterface, 'initDependencies'> {}
