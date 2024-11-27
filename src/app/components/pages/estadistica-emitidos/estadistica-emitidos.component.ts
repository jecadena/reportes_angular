import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { DocumentoService } from '../../../services/documento.service';
import { PdfUploadService } from '../../../services/pdf-upload.service';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../pages/usuarios/usuario';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import Swal from 'sweetalert2';
import 'jspdf-autotable';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { environment } from '../../../../environments/environment';
import { Pipe, PipeTransform } from '@angular/core';
import { NgForm } from '@angular/forms';

const base_url = environment.base_url;

@Pipe({ name: 'replaceSlash' })
export class ReplaceSlashPipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(' /', '');
  }
}

interface Documento {
  id: number;
  co_maestro: string;
  fe_docu: string;
  mo_total_doc: number;
  mo_igv_sin_credito: number;
  mo_igv_doc: number;
  nu_file: string;
  nu_docu: string;
  co_ruc: string;
  pagado: string;
  de_opcion: string;
  co_cuenta_tipo_igv: string;
  nu_docu_sunat: string;
  co_area: string;
  selected?: boolean;
}

@Component({
  selector: 'app-estadistica-emitidos',
  templateUrl: './estadistica-emitidos.component.html',
  styleUrls: ['./estadistica-emitidos.component.scss']
})

export class EstadisticaEmitidosComponent implements OnInit {
  public http_url_img: string;
  public selectedOption: any;
  noRecordsFound: boolean = false;
  hotelesUnicos: string[] = [];
  isHotelSelected: boolean = false;
  hotelSeleccionado: string = '';
  isLoading: boolean = false;
  isSearching: boolean = false;
  options: Array<{ value: string, text: string }> = [];
  rows: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 20;
  pagedRows: any[] = []; 
  isAnyCheckboxSelected = false;
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  columns = [
    { name: 'Solicitud' },
    { name: 'Número' },
    { name: 'Fecha de Ingreso' },
    { name: 'Fecha de Salida' },
    { name: 'Fecha de la factura' },
    { name: 'Total' },
    { name: 'Hotel' },
    { name: 'Operador' },
    { name: 'Pasajero' },
    { name: 'RUC L. Aérea' },
    { name: 'Ruta' },
    { name: 'Tipo Ruta' },
    { name: 'Área' }
  ];
  pdfData: Blob | null = null;
  public usuario: Usuario;
  searchText: string = '';
  resizingColumn: string | null = null;
  initialX: number = 0;
  initialWidth: number = 0;
  filteredRowsCount: number = 0;
  fechaInicial: string | null = null;
  fechaFinal: string | null = null;
  tipoOpcion: string = 'Todos';
  cliente: string = '';
  opcionSeleccionada: string = '';
  tipoSeleccionado: string = '';
  formatoExportar: string = '';
  corporativo: boolean = false;
  documentoSeleccionado: string = ''
  constructor(
    private documentoService: DocumentoService, 
    private pdfUploadService: PdfUploadService, 
    public authService: UsuarioService,
    private http: HttpClient) { 
      this.usuario = authService.usuario;
    }

  ngOnInit(): void {
    this.checkIfAnyCheckboxSelected(); 
    this.fetchOptions(this.usuario.co_tip_maestro, this.usuario.co_maestro);
    this.obtenerHotelesUnicos();
  }

  syncDates(): void {
    const fechaInicial = (document.getElementById('fechaInicial') as HTMLInputElement).value;
    (document.getElementById('fechaFinal') as HTMLInputElement).value = fechaInicial;
  }

  checkIfAnyCheckboxSelected(): void {
    this.isAnyCheckboxSelected = this.rows.some(row => row.selected);
  }

  convertirFechas(fechaStr: string): string {
    const [yyyy, mm, dd] = fechaStr.split('-');
    return `${mm}/${dd}/${yyyy}`;
  }

  convertirFechas1(fechaStr: string): string {
    const [yyyy, mm, dd] = fechaStr.split('-');
    return `${dd}/${mm}/${yyyy}`;
  }

  getProperty(row: any, propName: string): any {
    return row[propName];
  }

  dividirNombreCompleto(nombreCompleto: string): { apellidos: string, nombres: string } {
    const partes = nombreCompleto.split(' / ');
    const apellidos = partes[0] ? partes[0].trim() : '';
    const nombres = partes[1] ? partes[1].trim() : '';
    return { apellidos, nombres };
  }

  toggleAllSelection(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      //document.getElementById('btnPDF').hidden = false;
      document.getElementById('btnExcel').hidden = false;
    } else {
      //document.getElementById('btnPDF').hidden = true;
      document.getElementById('btnExcel').hidden = true;
    }
    console.log("Checked: ", checked);
    this.rows.forEach(row => row.selected = checked);
    this.checkIfAnyCheckboxSelected();
  }

  async exportToPDF(): Promise<void> {
    document.getElementById('btnPDF').hidden = true;
    document.getElementById('btnExcel').hidden = true;
    (document.getElementById('searchText') as HTMLInputElement).value = '';
    const selectedRows = this.rows.filter(row => row.selected);
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No hay documentos seleccionados',
      });
      return;
    }
    if (selectedRows.length === 1) {
      const row = selectedRows[0];
      const pdfUrl = `https://actoursapps.com.pe:8080/erequest/api/reportes/?nu_iata=${row['nu_iata']}&de_boleto=${row['Número Boleto']}&fe_emision=${row['Fec. Emision']}`;
      try {
        const { content, filename } = await this.fetchPDF(row);
        this.visualizePDF(content, filename);
      } catch (error) {
        console.error('Error fetching PDF:', error);
        Swal.fire({
          icon: 'warning',
          title: 'Aviso',
          text: 'No se ha encontrado el boleto seleccionado',
        });
      }
    } else {
      const zip = new JSZip();
      const currentDate = new Date();
      const formattedDate = `${currentDate.getFullYear()}_${(currentDate.getMonth() + 1).toString().padStart(2, '0')}_${currentDate.getDate().toString().padStart(2, '0')}_${currentDate.getHours().toString().padStart(2, '0')}_${currentDate.getMinutes().toString().padStart(2, '0')}_${currentDate.getSeconds().toString().padStart(2, '0')}`;
      const zipFilename = `boletos_${formattedDate}.zip`;
      for (const row of selectedRows) {
        try {
          const { content, filename } = await this.fetchPDF(row);
          zip.file(filename, content);
        } catch (error) {
          console.error(`Error fetching PDF for boleto ${row['Número Boleto']}:`, error);
        }
      }
      const zipContent = await zip.generateAsync({ type: 'blob' });
      saveAs(zipContent, zipFilename);
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'warning',
        title: 'Zip creado',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    }
  }

  async fetchPDF(row: any): Promise<{ content: Blob; filename: string }> {
    try {
        const nu_iata = String(row['nu_iata']).trim();
        const de_boleto = String(row['Número Boleto']).trim();
        const fe_emision = row['Fec. Emisión'] ? String(row['Fec. Emisión']).trim() : '';
        console.log('La Fecha: : ', fe_emision);
        console.log('IATA: ', nu_iata);
        console.log('Boleto: ', de_boleto);
        if (!nu_iata || !de_boleto || !fe_emision) {
            throw new Error('Información incompleta para obtener el PDF');
        }
        const pdfUrl = `https://actoursapps.com.pe:8080/erequest/api/reportes/?nu_iata=${encodeURIComponent(nu_iata)}&de_boleto=${encodeURIComponent(de_boleto)}&fe_emision=${encodeURIComponent(fe_emision)}`;
        const response: HttpResponse<Blob> = await this.http.get(pdfUrl, { observe: 'response', responseType: 'blob' }).toPromise();
        console.log(row);
        let filename = `${nu_iata} ${de_boleto}.pdf`;
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
            const matches = contentDisposition.match(/filename="([^"]+)"/);
            if (matches && matches.length > 1) {
                filename = matches[1];
            }
        }
        return {
            content: response.body as Blob,
            filename: filename
        };
    } catch (error) {
        console.error('Error PDF:', error);
        throw error;
    }
  }

  visualizePDF(pdfOutput: Blob, filename: string): void {
    const filePath = URL.createObjectURL(pdfOutput);
    const screenWidth = window.innerWidth;
    const width = screenWidth < 768 ? '70%' : '60%';
    Swal.fire({
      title: filename,
      html: `<embed width="100%" style="height: 80vh !important;" src="${filePath}" type="application/pdf" />`,
      width: width,
      showCloseButton: true,
      showConfirmButton: false
    });
  }

  onCheckboxChange(): void {
    document.getElementById('btnPDF').hidden = false; 
    document.getElementById('btnExcel').hidden = false; 
    this.checkIfAnyCheckboxSelected();
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

  exportToExcel(): void {
    document.getElementById('btnPDF').hidden = true;
    document.getElementById('btnExcel').hidden = true;
    const lafechaInicial = (document.getElementById('fechaInicial') as HTMLInputElement).value;
    const lafechaFinal = (document.getElementById('fechaFinal') as HTMLInputElement).value;
    const eltipo = (document.querySelector('input[name="tipo"]:checked') as HTMLInputElement)?.value;
    const elcliente = (document.getElementById('clienteSelect') as HTMLSelectElement)?.value;
    const selectedRows = this.rows.filter(row => row.selected);
    if (selectedRows.length === 0) {
      return;
    }
    const fechaInicial = lafechaInicial;
    const fechaFinal = lafechaFinal;
    const clienteSelect = elcliente;
    const tipo = eltipo;
    const data = selectedRows.map(row => ({
      'L. Aérea': this.getProperty(row, 'L. Aérea'),
      'Fec. Emisión': this.getProperty(row, 'Fec. Emisión'),
      'Tarifa': this.getProperty(row, 'Tarifa'),
      'IGV': this.getProperty(row, 'IGV'),
      'Impuestos': this.getProperty(row, 'Impuesto'),
      'Total': this.getProperty(row, 'Total'),
      'Nombre': this.getProperty(row, 'Nombre Apellidos'),
      'Cód.': this.getProperty(row, 'co_iata'),
      'RUC L. Aérea': this.getProperty(row, 'RUC L. Aérea'),
      'Ruta': this.getProperty(row, 'Ruta'),
      'Tipo Ruta': this.getProperty(row, 'Tipo Ruta'),
      'Área': this.getProperty(row, 'co-area')
    }));
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('data');
    const tituloCelda: Partial<ExcelJS.Style> = {
      font: { size: 20, color: { argb: 'FF2A3E52' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
    };
    const subtituloCelda: Partial<ExcelJS.Style> = {
      font: { size: 12 },
      alignment: { horizontal: 'center', vertical: 'middle' },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
    };
    const encabezadoCelda: Partial<ExcelJS.Style> = {
      font: { color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF009999' } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };
    worksheet.mergeCells('A1:L1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Consulta de Boletos';
    titleCell.style = tituloCelda;
    worksheet.mergeCells('A2:L2');
    const subtitleCell = worksheet.getCell('A2');
    subtitleCell.value = `Del ${fechaInicial} al ${fechaFinal} / Cliente: ${clienteSelect} / Tipo: ${tipo}`;
    subtitleCell.style = subtituloCelda;
    const header = ['L. Aérea', 'Fec. Emisión', 'Tarifa', 'IGV', 'Impuestos', 'Total', 'Nombre', 'Cód.', 'RUC L. Aérea', 'Ruta', 'Tipo Ruta', 'Área'];
    const headerRow = worksheet.addRow(header);
    headerRow.eachCell(cell => {
      cell.style = encabezadoCelda;
    });
    data.forEach(d => {
      worksheet.addRow(Object.values(d));
    });
    worksheet.columns.forEach(column => {
      column.width = 20;
    });
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'documentos.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
    Swal.fire({
      toast: true,
      position: 'top',
      icon: 'success',
      title: 'Excel creado',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }

  onSelectClick(): void {
    console.log("Options: ", this.options.length);
    if (!this.options.length) {
      this.fetchOptions(this.usuario.co_tip_maestro, this.usuario.co_maestro);
    }
  }

  fetchOptions(co_tip_maestro: string, co_maestro: string): void {
    console.log("Tip Maestro: ", co_tip_maestro);
    console.log("Maestro: ", co_maestro);
    const url = `https://actoursapps.com.pe:8080/erequest/api/subclientes/01/${co_tip_maestro}/${co_maestro}`;
    this.http.get(url).subscribe((response: any) => {
      this.options = response
        .map((item: any) => ({
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

    async fetchAndShowPDF(row: any): Promise<void> {
      const nu_iata = String(row['nu_iata']).trim();
      const de_boleto = String(row['Número Boleto']).trim();
      const fe_emision = row['Fec. Emisión'] ? String(row['Fec. Emisión']).trim() : '';
      console.log('Fecha en FetchAndShow:', fe_emision);
      if (!nu_iata || !de_boleto || !fe_emision) {
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Información incompleta para obtener el PDF',
          });
          return;
      }
      const pdfUrl = `https://actoursapps.com.pe:8080/erequest/api/reportes/?nu_iata=${encodeURIComponent(nu_iata)}&de_boleto=${encodeURIComponent(de_boleto)}&fe_emision=${encodeURIComponent(fe_emision)}`;
      console.log('Ver documento: ', pdfUrl);
      try {
          const { content, filename } = await this.fetchPDF({ ...row, 'Fec. Emisión': fe_emision });
          this.visualizePDF(content, filename);
      } catch (error) {
          console.error('Error fetching PDF:', error);
          Swal.fire({
            icon: 'warning',
            title: 'Aviso',
            text: 'No se ha encontrado el boleto seleccionado',
          });
      }
    }

  buscar(): void {
    if (this.isSearching) {
      return;
    }
    const fechaInicioStr = (document.getElementById('fechaInicial') as HTMLInputElement).value;
    const fechaFinalStr = (document.getElementById('fechaFinal') as HTMLInputElement).value;
    const fechaInicio = this.convertirFechas(fechaInicioStr);
    const fechaFinal = this.convertirFechas(fechaFinalStr);
    if (!fechaInicio) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe seleccionar una fecha de inicio',
      });
      return;
    }
    if (!fechaFinal) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe seleccionar una fecha de fin',
      });
      return;
    }
    const tipo = (document.querySelector('input[name="tipo"]:checked') as HTMLInputElement)?.value;
    const cliente = (document.getElementById('clienteSelect') as HTMLSelectElement)?.value;
    this.isLoading = true;
    this.isSearching = true;
    this.documentoService.buscarConsultaDocumentosBoletos(fechaInicio, fechaFinal, cliente, tipo).subscribe(
      response => {
        this.rows = response;
        this.filteredRowsCount = this.rows.length;
        this.noRecordsFound = this.rows.length === 0;
        this.checkIfAnyCheckboxSelected();
        this.updatePagedRows();
        this.hotelesUnicos = Array.from(new Set(this.rows.map(row => this.getProperty(row, 'Hotel')))).sort();
        this.isLoading = false;
        this.isSearching = false;
        this.itemsPerPage = 20;
        this.changePageSize('20');
      },
      error => {
        console.error('Error fetching documents', error);
        this.isLoading = false;
        this.isSearching = false;
      }
    );
  }

  sortTable(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.rows.sort((a, b) => {
      const aValue = this.getProperty(a, column);
      const bValue = this.getProperty(b, column);
      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
    this.updatePagedRows();
  }

  getSortIcon(column: string): string {
    if (this.sortColumn === column) {
      return this.sortDirection === 'asc' ? 'fa fa-arrow-up' : 'fa fa-arrow-down';
    }
    return 'fa fa-arrow-down';
  }

  sortRows() {
    this.rows.sort((a, b) => {
      const aValue = this.getProperty(a, this.sortColumn);
      const bValue = this.getProperty(b, this.sortColumn);
      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  updatePagedRows(): void {
    this.sortRows();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedRows = this.rows.slice(startIndex, endIndex);
    this.isLoading = false;
  }

  changePageSize(event: any): void {
    let newSize: number;
    if (typeof event === 'string') {
      newSize = parseInt(event, 10);
    } else if (event && event.target) {
      newSize = parseInt(event.target.value, 10);
    } else {
      console.error('Número o evento no válido');
      return;
    }
    this.itemsPerPage = newSize;
    this.updatePagedRows();
  }

  goToFirstPage() {
    this.currentPage = 1;
    this.updatePagedRows();
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedRows();
    }
  }

  goToNextPage() {
    this.isLoading = false;
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      console.log("Total páginas: ", this.getTotalPages());
      console.log("Página actual: ", this.currentPage);
      this.updatePagedRows();
    }
  }

  goToLastPage() {
    this.currentPage = this.getTotalPages();
    this.updatePagedRows();
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredRowsCount / this.itemsPerPage);
  }

  calculatePageRange(): { startIndex: number, endIndex: number } {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    let endIndex = startIndex + this.itemsPerPage - 1;
    if (endIndex >= this.rows.length) {
      endIndex = this.rows.length - 1;
    }
    return { startIndex, endIndex };
  }

  calcularRango(): {inicio: number, fin: number}{
    const inicio = (this.currentPage -1) * this.itemsPerPage;
    let fin = inicio + this.itemsPerPage - 1;
    if(fin >= this.rows.length){
      fin = this.rows.length - 1;
    }
    return { inicio, fin };
  }

  calcularSumatoriaTotal(): number {
    let sumatoria = 0;
    this.rows.forEach(row => {
      sumatoria += parseFloat(this.getProperty(row, 'Total'));
    });
    return sumatoria;
  }

  toggleSort(column: string, direction: 'asc' | 'desc') {
    this.sortColumn = column;
    this.sortDirection = direction;
  }

  isFirstPage(): boolean {
    return this.currentPage === 1;
  }

  isLastPage(): boolean {
    return this.currentPage === this.getTotalPages();
  }

  /*filterRows() {
    document.getElementById('btnPDF').hidden = true;
    document.getElementById('btnExcel').hidden = true;
    if (this.searchText.trim() === '') {
      this.pagedRows = this.rows;
      this.filteredRowsCount = this.rows.length;
      this.aplicarPaginacion();
      return;
    }
    const searchTextLowerCase = this.searchText.trim().toLowerCase();
    this.pagedRows = this.rows.filter(row => {
      const numero = this.getProperty(row, 'Hotel').toLowerCase();
      return numero.includes(searchTextLowerCase);
    });
    this.filteredRowsCount = this.pagedRows.length;
    this.currentPage = 1;
    this.aplicarPaginacion();
  }*/

    filterRows() {
      document.getElementById('btnPDF').hidden = true;
      document.getElementById('btnExcel').hidden = true;
    
      // Aplica filtros de texto y select de hotel
      const searchTextLowerCase = this.searchText.trim().toLowerCase();
      const hotelSeleccionado = (document.getElementById('hotelSelect') as HTMLSelectElement).value;
    
      this.pagedRows = this.rows.filter(row => {
        const coincideHotel = hotelSeleccionado ? this.getProperty(row, 'Hotel') === hotelSeleccionado : true;
        const coincideTexto = searchTextLowerCase ? this.getProperty(row, 'Hotel').toLowerCase().includes(searchTextLowerCase) : true;
        return coincideHotel && coincideTexto;
      });
      this.filteredRowsCount = this.pagedRows.length;
      this.currentPage = 1;
      this.aplicarPaginacion();
      this.calcularSumatoriaTotal();
    }

  aplicarPaginacion(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.pagedRows = this.pagedRows.slice(start, end);
    console.log("Filas paginadas: ", this.filteredRowsCount);
  }

  onResizeStart(event: MouseEvent, column: string): void {
    this.resizingColumn = column;
    this.initialX = event.clientX;
    this.initialWidth = (event.target as HTMLElement).parentElement!.offsetWidth;
    event.preventDefault();
  }

  obtenerHotelesUnicos() {
    const hotelesSet = new Set(this.rows.map(row => this.getProperty(row, 'Hotel')));
    this.hotelesUnicos = Array.from(hotelesSet).sort();
  }

  filtrarPorHotelSeleccionado(event: Event) {
    this.hotelSeleccionado = (event.target as HTMLSelectElement).value; // Mantiene el hotel seleccionado
    this.isHotelSelected = this.hotelSeleccionado !== ''; // Se establece si hay un hotel seleccionado
    
    // Filtrar las filas según el hotel seleccionado
    this.pagedRows = this.rows.filter(row => {
      const isHotelMatch = this.hotelSeleccionado === '' || this.getProperty(row, 'Hotel') === this.hotelSeleccionado;
      return isHotelMatch;
    });

    this.filteredRowsCount = this.pagedRows.length;
    this.aplicarPaginacion();
    this.calcularSumatoriaTotal();
  }
  
  abrirFormularioPago() {
    const anyChecked = this.pagedRows.some(row => row.selected);
    if (!anyChecked) {
        Swal.fire({
            icon: 'warning',
            title: 'No se ha seleccionado ningún documento',
            text: 'Por favor, seleccione al menos un documento antes de continuar.',
            confirmButtonText: 'Aceptar'
        });
        return;
    }
    Swal.fire({
        title: 'PAGO DE DOCUMENTOS',
        html: `
            <div>
                <p><strong>Hotel:</strong> ${this.hotelSeleccionado}</p>
                <div class="form-group mt-3 d-flex align-items-center">
                    <label for="numeroInput" class="mb-0 me-2 labelBlack" style="width:30%;">Número:</label>
                    <input type="text" id="numeroInput" class="form-control form-control-sm w-60" style="width:70%;" placeholder="Ingrese el número" />
                </div>
                <div class="form-group mt-2 d-flex align-items-center">
                    <label for="fechaInput" class="mb-0 me-2 labelBlack" style="width:30%;">Fecha:</label>
                    <input type="date" id="fechaInput" class="ms-2 form-control form-control-sm w-60" style="width:70%;" />
                </div>
                <div class="form-group mt-2 d-flex align-items-center">
                    <label for="fileInput" class="mb-0 me-2 labelBlack" style="width:30%;">Archivo:</label>
                    <input type="file" id="fileInput" class="form-control form-control-sm w-60" style="width:70%;" accept=".pdf, .xls, .xlsx, .doc, .docx" />
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'CARGAR FACTURA',
        cancelButtonText: 'CANCELAR',
        preConfirm: () => {
            const numero = (document.getElementById('numeroInput') as HTMLInputElement).value;
            const fecha = (document.getElementById('fechaInput') as HTMLInputElement).value;
            const archivo = (document.getElementById('fileInput') as HTMLInputElement).files?.[0];

            if (!numero || !fecha || !archivo) {
                Swal.showValidationMessage('Por favor complete todos los campos');
                return false;
            }
            return { numero, fecha, archivo };
        }
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            const { numero, fecha, archivo } = result.value;
            console.log("Número: ", numero);
            console.log("Fecha: ", fecha);
            console.log("Archivo: ", archivo);
            // Crear el FormData para enviar el archivo y los demás datos
            const formData = new FormData();
            formData.append('numero', numero);
            formData.append('fecha', fecha);
            formData.append('archivo', archivo);

            this.pagedRows = this.rows.filter(row => {
              const isHotelMatch = this.hotelSeleccionado === '' || this.getProperty(row, 'Hotel') === this.hotelSeleccionado;
              return isHotelMatch;
            });
            // Añadir serie y número de pagedRows seleccionados
            const documentosSeleccionados = this.pagedRows
                .filter(row => row.selected)
                .map(row => ({ serieSunat: row.serieSunat, numero: row.Número }));
            formData.append('documentos', JSON.stringify(documentosSeleccionados));
            console.log("DATOS: ",this.pagedRows);
            // Realizar la petición POST al servidor
            /*this.http.post('https://actoursappss.com.pe:8080/erequest', formData).subscribe(
                response => {
                    console.log('Respuesta del servidor:', response);
                    Swal.fire({
                        icon: 'success',
                        title: 'Factura cargada exitosamente',
                        confirmButtonText: 'Aceptar'
                    });
                },
                error => {
                    console.error('Error al cargar la factura:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al cargar la factura',
                        text: 'Hubo un problema al cargar la factura. Intente de nuevo.',
                        confirmButtonText: 'Aceptar'
                    });
                }
            );*/
        }
        this.pagedRows = this.rows.filter(row => {
          const isHotelMatch = this.hotelSeleccionado === '' || this.getProperty(row, 'Hotel') === this.hotelSeleccionado;
          return isHotelMatch;
        });
    
        this.filteredRowsCount = this.pagedRows.length;
        this.aplicarPaginacion();
    });
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.resizingColumn) {
      const deltaX = event.clientX - this.initialX;
      const newWidth = this.initialWidth + deltaX;
      document.querySelector(`th[scope='col'] [data-column='${this.resizingColumn}']`)!.parentElement!.style.width = `${newWidth}px`;
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.resizingColumn = null;
  }
}