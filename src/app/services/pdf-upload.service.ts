import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PdfUploadService {

  private uploadUrl = 'http://localhost:3000/upload'; // URL del endpoint en el servidor

  constructor(private http: HttpClient) { }

  uploadPDF(pdfBlob: Blob, fileName: string): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', pdfBlob, fileName);

    return this.http.post(this.uploadUrl, formData, {
      headers: new HttpHeaders({
        // headers if needed
      })
    });
  }
}
