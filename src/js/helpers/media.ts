import breakpointsMinData from '@common/styles/settings/breakpoints/breakpointsMin.module.scss';
import breakpointsMaxData from '@common/styles/settings/breakpoints/breakpointsMax.module.scss';

interface BreakpointsMin {
  xs: string,
  sm: string,
  md: string,
  lg: string,
  xl: string,
  xxl: string,
}
interface BreakpointsMax {
  xs: string,
  sm: string,
  md: string,
  lg: string,
  xl: string,
}

interface Changer {
  breakpoints: (keyof BreakpointsMin)[]
  onChange: ( { isBreakpointZone, breakpoint }: OnChangeProps ) => void
}

interface OnChangeProps {
  isBreakpointZone: boolean,
  breakpoint: keyof BreakpointsMin
}

interface AddChangerProps {
  name: string
  breakpoints: Changer['breakpoints']
  onChange: Changer['onChange']
}

interface ChangersData {
  changers: Record<string, Changer>
  addChanger: ( props: AddChangerProps ) => void
  removeChanger: ( name: string ) => void
}

type Device = 'mobile' | 'tablet' | 'pc'
type IsDevice = Record<Device, boolean>

interface MediaResponse {
  addMediaAction: ChangersData['addChanger']
  isDevice: IsDevice
}


/**
 * @description Возвращает {addMediaAction, isDevice}.
 * isDevice - показывает какой экран при загрузке страницы mobile|tablet|pc.
 * addMediaAction - добавляет функцию которая будет срабатывать на брейкпоинтах переданных в поле breakpoints.
 *    принимает объект - {
 *      name: 'уникальноеНазваниеДляСобытия',
 *      breakpoints: ['xl', 'xxl'],  - название брейкпоинта из $breakpoints-min в scss
 *      onChange(dataOfBreakpoint){ do some } - функция которая срабатывает для каждого брейкпоинта в массиве breakpoints
 *    }
 *
 * dataOfBreakpoint = {
 *   isBreakpointZone - булиновое значение обозначающее находится ли размер экрана в зоне брейкпоинта
 *   breakpoint - название брейкпоинта из массива breakpoints
 * }
 *
 *
 * Пример:
 * addMediaAction({
 *   name: 'uniqueName',
 *   breakpoints: ['xl', 'xxl'],
 *   onChange({isBreakpointZone, breakpoint}){
 *     if (breakpoint === 'xl') {
 *       if (isBreakpointZone) {
 *         do on enter in breakpoint
 *       } else {
 *         do on exit of breakpoint
 *       }
 *     }
 *   }
 * })
 */
export const mqData = () => {
  //@ts-ignore
  const breakpointsMin: BreakpointsMin = { ...breakpointsMinData };
  //@ts-ignore
  const breakpointsMax: BreakpointsMax = { ...breakpointsMaxData };

  const minMatch = ( minWidth: string ) => {
    return window.matchMedia( `(min-width: ${ minWidth })` );
  };
  const betweenMatch = ( minWidth: string, maxWidth: string ) => {
    return window.matchMedia( `(min-width: ${ minWidth }) and (max-width: ${ maxWidth })` );
  };

  const breakpoints: Record<keyof BreakpointsMin, MediaQueryList> = {
    xs: betweenMatch( breakpointsMin.xs, breakpointsMax.sm ),
    sm: betweenMatch( breakpointsMin.sm, breakpointsMax.sm ),
    md: betweenMatch( breakpointsMin.md, breakpointsMax.md ),
    lg: betweenMatch( breakpointsMin.lg, breakpointsMax.lg ),
    xl: betweenMatch( breakpointsMin.xl, breakpointsMax.xl ),
    xxl: minMatch( breakpointsMin.xxl ),
  };

  /**
   * Добавляет метод для события onChange на брейкпоинте из объекта changersData.changers
   *
   * @param changersData
   */
  const updateChangers = ( changersData: ChangersData ) => {
    Object.keys( breakpoints ).forEach( ( breakpoint ) => {
      const breakpointName = breakpoint as keyof BreakpointsMin

      breakpoints[ breakpointName ].onchange = ( event ) => {
        Object.keys( changersData.changers ).forEach( ( changerName ) => {
          if ( changersData.changers[ changerName ].breakpoints.includes( breakpointName ) ) {
            changersData.changers[ changerName ].onChange( { isBreakpointZone: event.matches, breakpoint: breakpointName } );
          }
        } );
      };
    } );
  };

  const changersData: ChangersData = {
    changers: {},
    addChanger( { name, breakpoints, onChange } ) {
      if ( ! this.changers[ name ] ) {
        this.changers[ name ] = {
          breakpoints,
          onChange,
        };
      } else {
        throw new Error( `changers.${ name } is already exist` );
      }
      updateChangers( this );
    },
    removeChanger( name ) {
      if ( Object.keys( this.changers ).includes( name ) ) {
        delete this.changers[ name ];
        updateChangers( this );
      }
    },
  };

  const response: MediaResponse = {
    addMediaAction: changersData.addChanger.bind( changersData ),
    isDevice: {
      mobile: breakpoints.xs.matches || breakpoints.sm.matches,
      tablet: breakpoints.md.matches,
      pc: breakpoints.lg.matches || breakpoints.xl.matches || breakpoints.xxl.matches,
    },
  };

  return response;
};
