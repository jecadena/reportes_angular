import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { DocumentoService } from '../../services/documento.service';
import { PdfUploadService } from '../../services/pdf-upload.service';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../pages/usuarios/usuario';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import 'jspdf-autotable';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { environment } from '../../../environments/environment';
import { Pipe, PipeTransform } from '@angular/core';

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
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  public http_url_img: string;
  public selectedOption: any;

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
    { name: 'L. Aérea' },
    { name: 'Fec. Emisión' },
    { name: 'Tarifa' },
    { name: 'IGV' },
    { name: 'Impuestos' },
    { name: 'Total' },
    { name: 'Apellidos' },
    { name: 'Nombre' },
    { name: 'Cód.' },
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

  getProperty(row: any, propName: string): any {
    return row[propName];
  }

  /* getProperty(row: any, property: string) {
    return row[property] || '';
  }*/

  dividirNombreCompleto(nombreCompleto: string): { apellidos: string, nombres: string } {
    const partes = nombreCompleto.split(' / ');
    const apellidos = partes[0] ? partes[0].trim() : '';
    const nombres = partes[1] ? partes[1].trim() : '';
    return { apellidos, nombres };
  }

  toggleAllSelection(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      document.getElementById('btnPDF').hidden = false;
      document.getElementById('btnExcel').hidden = false;
    } else {
      document.getElementById('btnPDF').hidden = true;
      document.getElementById('btnExcel').hidden = true;
    }
    console.log("Checked: ", checked);
    this.pagedRows.forEach(row => row.selected = checked);
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
      const pdfUrl = `http://REMOTESERVER:9091/api/reportes/?nu_iata=${row['nu_iata']}&de_boleto=${row['Número Boleto']}`;

      try {
        const { content, filename } = await this.fetchPDF(row);
        this.visualizePDF(content, filename);
      } catch (error) {
        console.error('Error fetching PDF:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo obtener el PDF seleccionado',
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
      const pdfUrl = `http://REMOTESERVER:9091/api/reportes/?nu_iata=${row['nu_iata']}&de_boleto=${row['Número Boleto']}`;
      const response: HttpResponse<Blob> = await this.http.get(pdfUrl, { observe: 'response', responseType: 'blob' }).toPromise();
      console.log(row);
      let filename = `${row['nu_iata'].trim()} ${row['Número Boleto'].trim()}.pdf`;

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
      'L. Aérea': row.co_maestro,
      'Fec. Emisión': row.fe_docu,
      'Tarifa': row.mo_total_doc,
      'IGV': row.mo_igv_sin_credito,
      'Impuestos': row.mo_igv_doc,
      'Total': row.nu_file,
      'Apellidos': row.nu_docu,
      'Nombre': row.co_ruc,
      'Cód.': row.pagado,
      'RUC L. Aérea': row.de_opcion,
      'Ruta': row.co_cuenta_tipo_igv,
      'Tipo Ruta': row.nu_docu_sunat,
      'Área': row.co_area
    }));

    const header = [
      'L. Aérea', 'Fec. Emisión', 'Tarifa', 'IGV', 'Impuestos', 'Total', 'Apellidos', 'Nombre', 'Cód.', 'RUC L. Aérea', 'Ruta', 'Tipo Ruta', 'Área'
    ];
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    const tituloCelda = {
      font: { size: 20, color: { rgb: '2a3e52' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      fill: { fgColor: { rgb: 'ffffff' } }
    };
    const subtituloCelda = {
      font: { size: 12 },
      alignment: { horizontal: 'center' },
      fill: { fgColor: { rgb: 'ffffff' } }
    };
    const encabezadoCelda = {
      font: { color: { rgb: 'ffffff' } },
      fill: { fgColor: { rgb: '2a3e52' } },
      alignment: { horizontal: 'center' }
    };
    XLSX.utils.sheet_add_aoa(worksheet, [
      [{ v: 'Consulta de Boletos', s: tituloCelda }],
      [{ v: `Del ${fechaInicial} al ${fechaFinal} / Cliente: ${clienteSelect} / Tipo: ${tipo}`, s: subtituloCelda }],
      header.map(h => ({ v: h, s: encabezadoCelda }))
    ], { origin: 'A1' });
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 12 } }];
    worksheet['!merges'] = [{ s: { r: 1, c: 0 }, e: { r: 1, c: 12 } }];
    XLSX.utils.sheet_add_json(worksheet, data, { origin: 'A4', skipHeader: true });
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, 'documentos.xlsx');
    Swal.fire({
      toast: true,
      position: 'top',
      icon: 'warning',
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
    const url = `http://REMOTESERVER:9091/api/subclientes/01/${co_tip_maestro}/${co_maestro}`;
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
    const pdfUrl = `http://REMOTESERVER:9091/api/reportes/?nu_iata=${row['nu_iata']}&de_boleto=${row['Número Boleto']}`;
    console.log("Ver documento: ",pdfUrl);
    try {
      const { content, filename } = await this.fetchPDF(row);
      this.visualizePDF(content, filename);
    } catch (error) {
      console.error('Error fetching PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener el PDF seleccionado',
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

    console.log('Fecha inicial convertida: ', fechaInicio);
    console.log('Fecha final convertida: ', fechaFinal);

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
    console.log(tipo);
  
    this.isLoading = true;
    this.isSearching = true;
  
    this.documentoService.buscarConsultaDocumentos(fechaInicio, fechaFinal, cliente, tipo).subscribe(
      response => {
        this.rows = response;
        this.checkIfAnyCheckboxSelected();
        this.updatePagedRows();
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

  updatePagedRows(): void {
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
      this.updatePagedRows();
    }
  }

  goToLastPage() {
    this.currentPage = this.getTotalPages();
    this.updatePagedRows();
  }

  getTotalPages(): number {
    return Math.ceil(this.rows.length / this.itemsPerPage);
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

  isFirstPage(): boolean {
    return this.currentPage === 1;
  }

  isLastPage(): boolean {
    return this.currentPage === this.getTotalPages();
  }

  filterRows() {
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
      const numero = this.getProperty(row, 'Nombre Apellidos').toLowerCase();
      return numero.includes(searchTextLowerCase);
    });

    this.filteredRowsCount = this.pagedRows.length;
    this.currentPage = 1;
    this.aplicarPaginacion();
  }

  aplicarPaginacion(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.pagedRows = this.pagedRows.slice(start, end);
    console.log(this.pagedRows);
  }

  onResizeStart(event: MouseEvent, column: string): void {
    this.resizingColumn = column;
    this.initialX = event.clientX;
    this.initialWidth = (event.target as HTMLElement).parentElement!.offsetWidth;
    event.preventDefault();
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