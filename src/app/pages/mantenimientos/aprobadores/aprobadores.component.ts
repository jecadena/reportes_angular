import { Component, OnDestroy, OnInit } from '@angular/core';
import { Aprobador } from './aprobador';
import { AprobadorService } from '../../../services/aprobador.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MessageService, ConfirmationService } from 'primeng/api';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Subscription } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-aprobadores',
  templateUrl: './aprobadores.component.html',
  // styles: [`
  //       :host ::ng-deep .p-dialog .product-image {
  //           width: 150px;
  //           margin: 0 auto 2rem auto;
  //           display: block;
  //       }
  //   `],
  styleUrls: ['./aprobadores.component.scss']
})
export class AprobadoresComponent implements OnInit, OnDestroy {

  displaySaveDialog: boolean = false;
  //showSaveDialog: boolean = false;
  aprobadores: Aprobador[];
  //aprobador?: Aprobador;
  displayAddEditModal = false;
  selectedAprobadores: any = [];
  subscriptions: Subscription[] = [];
  pdtSubscription: Subscription = new Subscription();
  //submitted: boolean;
  cols: any[];
  items: MenuItem[];
  exportColumns: any[];

  constructor(private aprobadorService: AprobadorService,
    private usuarioService: UsuarioService,
    private messageService: MessageService,
    private confirmDialog: ConfirmationService) { }

    
    submitted: boolean = false;
    aprobador: any = { 
    co_aprobador: '', 
    de_aprobador: '', 
    de_email_aprobador: '', 
    fg_vigente: '' 
  };
  
  clearPlaceholder(field: string) {
    if (this.submitted && !this.aprobador[field]) {
      this.aprobador[field] = '';
    }
  }

  setPlaceholder(field: string) {
    if (this.submitted && !this.aprobador[field]) {
      switch (field) {
        case 'co_aprobador':
          this.aprobador[field] = 'Se requiere código.';
          break;
        case 'de_aprobador':
          this.aprobador[field] = 'Se requiere Descripción.';
          break;
        case 'de_email_aprobador':
          this.aprobador[field] = 'Se requiere Email.';
          break;
        case 'fg_vigente':
          this.aprobador[field] = 'Indique la vigencia.';
          break;
      }
    }
  }

  onSubmit() {
    this.submitted = true;
    // Lógica para manejar la validación del formulario
  }

  getAprobadorList() {
    this.pdtSubscription.add(this.aprobadorService.cargarAprobadores().subscribe(
      // (result: any) => {
      //   let aprobadores: Aprobador[] = [];
      //   for (let i = 0; i < result.length; i++) {
      //     let aprobador = result[i] as Aprobador;
      //     aprobadores.push(aprobador);
      //   }
      //   this.aprobadores = result;
      // },
      // error => {
      //   console.log(error);
      // });
      response => {
        this.aprobadores = response;
      }
    ))
    //this.subscriptions.push(this.pdtSubscription)
  }

  hideDialog() {
    this.displaySaveDialog = false;
    this.submitted = false;
  }


  showSaveDialog(editar: boolean) {
    if (editar) {
      if (this.selectedAprobadores == null || this.selectedAprobadores.co_aprobador == null) {
        this.messageService.add({ severity: 'warn', summary: "Advertencia!", detail: "Por favor seleccione un registro" });
        this.displaySaveDialog = false;
        return;
      } else {
        this.aprobadorService.getAprobador(this.selectedAprobadores.co_aprobador).subscribe((aprobador) => this.aprobador = aprobador)
        this.displaySaveDialog = true;
      }
    } else {
      this.aprobador = new Aprobador();
      this.displaySaveDialog = true;
    }
  }

  save() {
    this.submitted = true;

    if (this.aprobador.co_maestro != "" && this.aprobador.co_maestro != undefined) {
      this.aprobadorService.update(this.aprobador).subscribe(
        (result: any) => {
          console.log(result.data);
          this.aprobadores[this.findIndexById(this.aprobador.co_aprobador)] = result.data;
          this.messageService.add({ severity: 'success', summary: "Resultado", detail: "Aprobador " + result.data.de_aprobador + " actualizado con éxito!" });
          //result.data;
        }

      )
    } else {

      console.log("Creando :" + this.aprobador);
      this.aprobadorService.create(this.aprobador).subscribe(
        (result: any) => {
          console.log(" result " + JSON.stringify(result));
          //this.aprobador.co_aprobador = this.createId();
          this.aprobadores.push(result.data);
          this.messageService.add({ severity: 'success', summary: "Resultado", detail: "Aprobador " + result.data.de_aprobador + " creado con éxito!" });
        }
      )

    }
    //if (event.status == 'success') {
    // this.getAprobadorList();
    $("#exampleMaodal").modal('hide');
    //}
    //this.displaySaveDialog.close;
    this.displaySaveDialog = false;
    //this.aprobador = {};
    //xxx}
  }

  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.aprobadores.length; i++) {
      if (this.aprobadores[i].co_aprobador === id) {
        index = i;
        break;
      }
    }

    return index;
  }
  createId(): string {
    let id = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  showAddModal() {
    console.log("entre showAddModal");
    this.displayAddEditModal = true;
    this.selectedAprobadores = null;
  }

  hideAddModal(isClosed: boolean) {
    console.log("entre hideAddModal");
    this.displayAddEditModal = !isClosed;
    this.selectedAprobadores = null;
  }

  showEditModal(aprobador: Aprobador) {
    console.log("entre showEditModal");
    this.displayAddEditModal = true;
    this.selectedAprobadores = aprobador;
  }

  validarAprobador(aprobador: Aprobador) {
    let index = this.aprobadores.findIndex((e) => e.co_aprobador == aprobador.co_aprobador);

    if (index != -1) {
      this.aprobadores[index] = aprobador;
    } else {
      this.aprobadores.push(aprobador);

    }
  }

  deleteAprobador() {
    if (this.selectedAprobadores == null || this.selectedAprobadores.co_aprobador == null) {
      this.messageService.add({ severity: 'warn', summary: "Advertencia!", detail: "Por favor seleccione un registro" });
      return;
    }
    this.confirmDialog.confirm({
      message: "¿Está seguro que desea eliminar el registro?",
      accept: () => {
        console.log("" + this.selectedAprobadores.co_aprobador);
        this.aprobadorService.deleteAprobador(this.selectedAprobadores.co_aprobador).subscribe(
          (result: any) => {
            this.messageService.add({ severity: 'success', summary: "Resultado", detail: "Se eliminó el Aprobador " + result.data.de_aprobador + " con éxito!" });
            this.deleteObject(result.data.co_aprobador);
          }
        )
      }
    })
  }

  deleteObject(co_aprobador: string) {
    let index = this.aprobadores.findIndex((e) => e.co_aprobador == co_aprobador);
    if (index != -1) {
      this.aprobadores.splice(index, 1);
    }
  }

  exportPdf() {
    import("jspdf").then(jsPDF => {
      import("jspdf-autotable").then(x => {
        //const doc = new jsPDF.default(0,0);
        //doc.autoTable(this.exportColumns, this.aprobadores);
        //doc.save('aprobadores.pdf');
      })
    })
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.aprobadores);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "aprobadores");
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  ngOnDestroy(): void {
    //this.subscriptions.forEach(sub => sub.unsubscribe());
    this.pdtSubscription.unsubscribe();
  }

  ngOnInit() {
    this.selectedAprobadores = Aprobador;
    this.getAprobadorList();

    this.cols = [
      { field: "de_foto", header: "Foto" },
      { field: "co_aprobador", header: "Código" },
      { field: "de_aprobador", header: "Descripción" },
      { field: "de_email_aprobador", header: "Email" },
      { field: "fg_vigente", header: "Vigente" },
    ];
    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));
  }

  selectRow(event: any, aprobador: Aprobador) {
    if (event.target.checked) {
      this.selectedAprobadores.push(aprobador);
    } else {
      this.selectedAprobadores = this.selectedAprobadores.filter(a => a !== aprobador);
    }
  }

  selectAll(event: any) {
    if (event.target.checked) {
      this.selectedAprobadores = [...this.aprobadores];
    } else {
      this.selectedAprobadores = [];
    }
  }
}