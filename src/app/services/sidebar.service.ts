import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private dynamicMenuSubject = new BehaviorSubject<any[]>([]);
  public dynamicMenu$ = this.dynamicMenuSubject.asObservable();

  staticMenu: any[] = [
    {
      titulo: 'Consultas',
      icono: 'mdi mdi-search-web',
      submenu: [
        { titulo: 'Consulta de Boletos', url: '/dashboard' },
        { titulo: 'Consulta Documentos', url: 'documentos' }
      ]
    },
    {
      titulo: 'Reportes',
      icono: 'mdi mdi-file-chart',
      submenu: []  
    }
  ];

  constructor(private http: HttpClient) { }

  getDynamicMenu(co_tip_maestro: string, co_maestro: string): Observable<any[]> {
    const url = `http://REMOTESERVER:9091/api/reportes/01/${co_tip_maestro}/${co_maestro}`;
    return this.http.get<any[]>(url).pipe(
      map((response: any[]) => {
        console.log('API response:', response);

        const newMenu = JSON.parse(JSON.stringify(this.staticMenu));

        if (response && Array.isArray(response)) {
          response.forEach(item => {
            let menuItem = null;
            if (item.de_reporte === 'Estadistica de Boletos') {
              menuItem = { titulo: 'Estadística Boletos', url: 'estadistica-boletos', co_tip_maestro: item.co_tip_maestro, co_maestro: item.co_maestro, co_reporte: item.co_reporte };
            } else if (item.de_reporte === 'Estadistica de Hoteles') {
              menuItem = { titulo: 'Estadística Hotel', url: 'estadistica-hotel', co_tip_maestro: item.co_tip_maestro, co_maestro: item.co_maestro, co_reporte: item.co_reporte };
            } else if (item.de_reporte === 'Cuenta Corriente') {
              menuItem = { titulo: 'Cuenta Corriente', url: 'cuenta-corriente', co_tip_maestro: item.co_tip_maestro, co_maestro: item.co_maestro, co_reporte: item.co_reporte };
            } else if (item.de_reporte === 'Carga Masiva de Boletos') {
              menuItem = { titulo: 'Carga Masiva', url: 'carga-masiva', co_tip_maestro: item.co_tip_maestro, co_maestro: item.co_maestro, co_reporte: item.co_reporte };
            } else if (item.de_reporte === 'Estadistica de Boletos - Centro de Costos') {
              menuItem = { titulo: 'Est. Centro Costos', url: 'estadistica-centro-costos', co_tip_maestro: item.co_tip_maestro, co_maestro: item.co_maestro, co_reporte: item.co_reporte };
            } else if (item.de_reporte === 'Estadistica de Boletos - Solicitantes') {
              menuItem = { titulo: 'Est. Solicitantes', url: 'estadistica-solicitantes', co_tip_maestro: item.co_tip_maestro, co_maestro: item.co_maestro, co_reporte: item.co_reporte };
            }

            if (menuItem) {
              newMenu.find(menu => menu.titulo === 'Reportes').submenu.push(menuItem);
            }
          });

          console.log('Dynamic Menu after processing:', newMenu);
          this.dynamicMenuSubject.next(newMenu);
          return newMenu;
        } else {
          console.error('Response is not an array or is undefined:', response);
          this.dynamicMenuSubject.next(newMenu);
          return newMenu;
        }
      }),
      catchError(error => {
        console.error('Error in API call:', error);
        const clonedMenu = JSON.parse(JSON.stringify(this.staticMenu));
        this.dynamicMenuSubject.next(clonedMenu);
        return of(clonedMenu);
      })
    );
  }
}
