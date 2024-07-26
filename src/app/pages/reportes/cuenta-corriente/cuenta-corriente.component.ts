import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../../services/usuario.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Usuario } from '../../../pages/usuarios/usuario';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { formatDate } from '@angular/common';
import { DocumentoService } from '../../../services/documento.service';
import { SidebarService } from '../../../services/sidebar.service';

@Component({
  selector: 'app-cuenta-corriente',
  templateUrl: './cuenta-corriente.component.html',
  styleUrls: ['./cuenta-corriente.component.css']
})
export class CuentaCorrienteComponent implements OnInit {
  public selectedOption: any;
  public dynamicMenu: any[] = [];
  public filteredMenu: any[] = [];
  fechaInicial: string | null = null;
  fechaFinal: string | null = null;
  tipoOpcion: string = 'Todos';
  isLoading: boolean = false;

  cliente: string = '';
  opcionSeleccionada: string = '';
  tipoSeleccionado: string = '';
  formatoExportar: string = '';
  corporativo: boolean = false;
  documentoSeleccionado: string = '';

  options: Array<{ value: string, text: string }> = [];
  public usuario: Usuario;

  searchText: string = '';
  coReporte: string;

  constructor(
    private route: ActivatedRoute,
    private documentoService: DocumentoService,
    public authService: UsuarioService,
    private http: HttpClient,
    private sidebarService: SidebarService,
    private router: Router
  ) { this.usuario = authService.usuario; }

  ngOnInit(): void {
    this.fetchOptions(this.usuario.co_tip_maestro, this.usuario.co_maestro);
    this.route.data.subscribe(data => {
      if (data.tipoOpcion) {
        this.tipoOpcion = data.tipoOpcion;
      }
    });
    this.sidebarService.dynamicMenu$.subscribe(menu => {
      this.dynamicMenu = menu;
      this.filterMenuByUrl();
      console.log('Dynamic Menu in CuentaCorrienteComponent:', this.filteredMenu);
    });
  }

  fetchOptions(co_tip_maestro: string, co_maestro: string): void {
    console.log("Tip Maestro: ", co_tip_maestro);
    console.log("Maestro: ", co_maestro);
    const url = `http://REMOTESERVER:9091/api/subclientes/01/${co_tip_maestro}/${co_maestro}`;
    this.http.get(url).subscribe((response: any) => {
      this.options = response.map((item: any) => ({
        value: item.co_tip_maestro + item.co_maestro,
        text: item.de_maestro
      }))
      .sort((a, b) => a.text.localeCompare(b.text));
    }, error => {
      document.getElementById('busqueda').hidden = true;
      Swal.fire({
        toast: true,
        position: 'top-right',
        icon: 'warning',
        title: 'No se pueden cargar datos del servidor.',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
      console.error('Error fetching options', error);
    });
  }

  actualizarFechaFinal(): void {
    if (this.fechaInicial) {
      this.fechaFinal = formatDate(this.fechaInicial, 'yyyy-MM-dd', 'en-US');
    } else {
      this.fechaFinal = null;
    }
  }

  private showWarningToast(mensaje: string): void {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'warning',
      title: mensaje,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }

  private validateForm(form: NgForm): boolean {
    if (!this.fechaInicial) {
      this.isLoading = false;
      this.showWarningToast('La fecha inicial es obligatoria.');
      return false;
    }

    if (!this.fechaFinal) {
      this.isLoading = false;
      this.showWarningToast('La fecha final es obligatoria.');
      return false;
    }

    if(!this.selectedOption){
      this.isLoading = false;
      this.showWarningToast('Seleccione un cliente.');
      return false;
    }

    if(!this.tipoSeleccionado){
      this.isLoading = false;
      this.showWarningToast('Seleccione una de las opciones.');
      return false;
    }

    if(!this.documentoSeleccionado){
      this.isLoading = false;
      this.showWarningToast('Seleccione el formato a exportar');
      return false;
    }

    return true;
  }

  filterMenuByUrl(): void {
    const currentUrl = this.router.url.split('/').pop();
    this.filteredMenu = [];
    this.dynamicMenu.forEach(item => {
      const filteredSubmenu = item.submenu.filter(subItem => subItem.url === currentUrl);
      if (filteredSubmenu.length > 0) {
        this.filteredMenu.push({
          ...item,
          submenu: filteredSubmenu
        });
        if (filteredSubmenu[0].co_reporte) {
          this.coReporte = filteredSubmenu[0].co_reporte;
        }
      }
    });
  }

  submitForm(form: NgForm): void {
    this.isLoading = true;
    if (this.validateForm(form)) {
      const co_cia = '01';
      const co_tip_maestro = this.usuario.co_tip_maestro;
      const co_maestro = this.usuario.co_maestro;
      const co_reporte = this.coReporte;
      const fe_del = this.fechaInicial;
      const fe_al = this.fechaFinal;
      const fg_pago = this.tipoSeleccionado;  
      const fg_formato = this.documentoSeleccionado.toUpperCase();
      const fg_corporativo = this.corporativo ? '1' : '0';
      const co_tip_maestro_cl = this.selectedOption;

      const url = `http://REMOTESERVER:9091/api/cuentacorriente/?co_cia=${co_cia}&fe_del=${fe_del}&fe_al=${fe_al}&co_tip_maestro_p=${co_tip_maestro}&co_maestro_p=${co_maestro}&co_reporte=${co_reporte}&co_tip_maestro_cl=${co_tip_maestro_cl}&fg_pago=${fg_pago}&fg_corporativo=${fg_corporativo}&fg_formato=${fg_formato}`;
      
      this.http.get(url, { observe: 'response', responseType: 'blob' }).subscribe((response: HttpResponse<Blob>) => {
        const contentDisposition = response.headers.get('content-disposition');
        let filename = contentDisposition ? contentDisposition.split('filename=')[1].trim() : 'archivo.' + this.documentoSeleccionado;
        filename = filename.substring(1, filename.length - 1);
        console.log(this.documentoSeleccionado);
        console.log(filename);
        if (this.documentoSeleccionado === 'PDF') {
          const fileURL = URL.createObjectURL(response.body);
          Swal.fire({
            html: `<embed src="${fileURL}" type="application/pdf" width="100%" height="600px" />`,
            width: '800px',
            showCloseButton: true,
            showConfirmButton: false
          });
        } else {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(response.body);
          link.download = filename;
          link.click();
          this.isLoading = false;
          Swal.fire({
            toast: true,
            position: 'top',
            icon: 'success',
            title: filename + ' creado',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
          });
        }
      }, error => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo generar el archivo. Por favor, intente nuevamente.',
        });
        console.error('Error generating file', error);
      });
      console.log(url);
    }
  }

  onSelectClick(): void {
    console.log("Options: ", this.options.length);
    if (!this.options.length) {
      this.fetchOptions(this.usuario.co_tip_maestro, this.usuario.co_maestro);
    }
  }

  onCorporativoChange(): void {
    if (this.corporativo) {
      const matchingOption = this.filteredMenu[0]?.submenu[0]?.co_tip_maestro + this.filteredMenu[0]?.submenu[0]?.co_maestro;
      this.selectedOption = this.options.find(option => option.value === matchingOption)?.value || '-1';
    } else {
      this.selectedOption = '-1';
    }
  }

  tipoOpciones = [
    { label: 'Pendientes', value: 'P' },
    { label: 'Cancelados', value: 'C' },
    { label: 'Todos', value: 'T' }
  ];

  tipoDocumento = [
    { label: 'PDF', value: 'pdf' },
    { label: 'Excel', value: 'xlsx' }
  ];
}
