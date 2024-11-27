import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { } from  'ng2-charts';

import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { MenubarModule } from 'primeng/menubar';

// Modulos
import { SharedModule } from '../shared/shared.module';
import { ComponentsModule } from '../components/components.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { ProgressComponent } from './progress/progress.component';
import { Grafica1Component } from './grafica1/grafica1.component';
import { PagesComponent } from './pages.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { PromesasComponent } from './promesas/promesas.component';
import { RxjsComponent } from './rxjs/rxjs.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { PerfilComponent } from './perfil/perfil.component';
import { AprobadoresComponent } from './mantenimientos/aprobadores/aprobadores.component';
import { AddEditAprobadorModule } from './mantenimientos/add-edit-aprobador/add-edit-aprobador.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import {ToastModule} from 'primeng/toast';
import { MessageService } from 'primeng/api';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';
import {ToolbarModule} from 'primeng/toolbar';
import {FileUploadModule} from 'primeng/fileupload';
import { CuentaCorrienteComponent } from './reportes/cuenta-corriente/cuenta-corriente.component';
import { CargaMasivaComponent } from './reportes/carga-masiva/carga-masiva.component';
import { EstadisticaBoletosComponent } from './reportes/estadistica-boletos/estadistica-boletos.component';
import { EstadisticaCentroCostosComponent } from './reportes/estadistica-centro-costos/estadistica-centro-costos.component';
import { EstadisticaSolicitantesComponent } from './reportes/estadistica-solicitantes/estadistica-solicitantes.component';
import { EstadisticaHotelComponent } from './reportes/estadistica-hotel/estadistica-hotel.component';



@NgModule({
  declarations: [
    DashboardComponent,
    ProgressComponent,
    Grafica1Component,
    PagesComponent,
    AccountSettingsComponent,
    PromesasComponent,
    RxjsComponent,
    UsuariosComponent,
    PerfilComponent,
    AprobadoresComponent,
    CuentaCorrienteComponent,
    CargaMasivaComponent,
    EstadisticaBoletosComponent,
    EstadisticaCentroCostosComponent,
    EstadisticaSolicitantesComponent,
    EstadisticaHotelComponent,

  ],
  exports: [
    DashboardComponent,
    ProgressComponent,
    Grafica1Component,
    PagesComponent,
    AccountSettingsComponent,
    AprobadoresComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule,
    ComponentsModule,
    TableModule,
    PanelModule,
    BrowserAnimationsModule,
    MenubarModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    FileUploadModule,
    AddEditAprobadorModule
  ],
  providers: [
    MessageService,
    ConfirmationService
  ],
})
export class PagesModule { }
