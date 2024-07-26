import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { AuthGuard } from '../guards/auth.guard';

import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProgressComponent } from './progress/progress.component';
import { Grafica1Component } from './grafica1/grafica1.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { PromesasComponent } from './promesas/promesas.component';
import { RxjsComponent } from './rxjs/rxjs.component';
import { PerfilComponent } from './perfil/perfil.component';
import { CuentaCorrienteComponent } from './reportes/cuenta-corriente/cuenta-corriente.component';
import { CargaMasivaComponent } from './reportes/carga-masiva/carga-masiva.component';
import { EstadisticaBoletosComponent } from './reportes/estadistica-boletos/estadistica-boletos.component';
import { EstadisticaCentroCostosComponent } from './reportes/estadistica-centro-costos/estadistica-centro-costos.component';
import { EstadisticaSolicitantesComponent } from './reportes/estadistica-solicitantes/estadistica-solicitantes.component';
import { EstadisticaHotelComponent } from './reportes/estadistica-hotel/estadistica-hotel.component';
//Mantenimientos
import { AprobadoresComponent } from './mantenimientos/aprobadores/aprobadores.component';

const routes: Routes = [
    {
        path: 'dashboard',
        component: PagesComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', component: DashboardComponent, data: { titulo: 'Consulta de Boletos' } },
            { path: 'documentos', component: RxjsComponent, data: { titulo: 'Consulta Documentos' }},
            { path: 'perfil', component: PerfilComponent, data: { titulo: 'Perfil de Usuario' }},
            { path: 'aprobadores', component: AprobadoresComponent, data: { titulo: 'Tabla de Aprobadores' }},
            { path: 'cuenta-corriente', component: CuentaCorrienteComponent, data: { titulo: 'Cuenta Corriente' }},
            { path: 'carga-masiva', component: CargaMasivaComponent, data: { titulo: 'Carga Masiva' } },
            { path: 'estadistica-boletos', component: EstadisticaBoletosComponent, data: { titulo: 'Estadística por Boletos' } },
            { path: 'estadistica-centro-costos', component: EstadisticaCentroCostosComponent, data: { titulo: 'Estadística por Centro Costos' } },
            { path: 'estadistica-solicitantes', component: EstadisticaSolicitantesComponent, data: { titulo: 'Estadística por Solicitantes' } },
            { path: 'estadistica-hotel', component: EstadisticaHotelComponent, data: { titulo: 'Estadística por Hoteles' } },
            //{ path: 'carga-masiva', component: CuentaCorrienteComponent, data: { titulo: 'Carga Masiva', tipoOpcion: 'Nacionales' } },
            //{ path: 'estadistica-boletos', component: CuentaCorrienteComponent, data: { titulo: 'Estadística Boletos', tipoOpcion: 'Internacionales' } },
            //{ path: 'estadistica-centro-costos', component: CuentaCorrienteComponent, data: { titulo: 'Estadística Centro Costos', tipoOpcion: 'Nacionales' } },
            //{ path: 'estadistica-solicitantes', component: CuentaCorrienteComponent, data: { titulo: 'Estadística Solicitantes', tipoOpcion: 'Internacionales' } },
        ]
    },
];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ]
})
export class PagesRoutingModule {}