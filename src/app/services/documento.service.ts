import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {

  private baseUrl = 'https://actoursapps.com.pe:8080/erequest';
  private baseUrl1 = 'https://181.177.229.139:8080/erequest';

  constructor(private http: HttpClient) { }

  buscarDocumentos(fechaInicio: string, fechaFinal: string, cliente: string, tipo: string): Observable<any> {
    const url = `${this.baseUrl}/api/estadisticaboleto`;
    const params = {
      pc_co_cia: '01',
      pc_co_tip_maestro_cl_full: cliente,
      pdt_fe_del: fechaInicio,
      pdt_fe_al: fechaFinal,
      pc_fg_tipo_ruta: tipo
    };
    return this.http.get<any>(url, { params });
  }

  private formatDate(date: Date): string {
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  buscarConsultaDocumentos(fechaInicio: string, fechaFinal: string, cliente: string, tipo: string): Observable<any> {
    const url = `${this.baseUrl}/api/boletoslist`;
    const params = {
      pc_co_cia: '01',
      pc_co_tip_maestro_cl_full: cliente,
      pdt_fe_del: fechaInicio,
      pdt_fe_al: fechaFinal,
      pc_fg_tipo_ruta: tipo
    };
    return this.http.get<any>(url, { params });
  }

  buscarConsultaDocumentosBoletos(fechaInicio: string, fechaFinal: string, cliente: string, tipo: string): Observable<any> {
    const url = `${this.baseUrl1}/api/documentosHotelList`;
    const params = {
      pc_co_cia: '01',
      pc_co_tip_maestro_cl_full: cliente,
      pdt_fe_del: fechaInicio,
      pdt_fe_al: fechaFinal,
      pc_fg_estado: tipo
    };
    return this.http.get<any>(url, { params });
  }

  buscarDocumentos1(fechaInicio: string, fechaFinal: string, cliente: string, nu_file: string, co_tip_doc: string, nu_serie: string, nu_docu: string): Observable<any> {
    const url = `${this.baseUrl}/api/documentoslist`;
    const params = {
      pc_co_cia: '01',
      pc_co_tip_maestro_cl_full: cliente,
      pdt_fe_del: fechaInicio,
      pdt_fe_al: fechaFinal,
      pc_nu_file: nu_file,
      pc_co_tip_doc: co_tip_doc,
      pc_nu_serie: nu_serie,
      pc_nu_docu: nu_docu
    };
    return this.http.get<any>(url, { params });
  }

  eliminarPDF(pdfPath: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/eliminar-pdf`, { pdfPath });
  }
}