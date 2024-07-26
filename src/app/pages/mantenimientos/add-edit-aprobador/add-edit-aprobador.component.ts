import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AprobadorService } from 'src/app/services/aprobador.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-edit-aprobador',
  templateUrl: './add-edit-aprobador.component.html',
  styleUrls: ['./add-edit-aprobador.component.css']
})
export class AddEditAprobadorComponent implements OnInit, OnChanges {

  @Input() displayAddEditModal: boolean = true;
  @Input() selectedAprobadores: any = null;
  @Output() clickClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() clickAddEdit: EventEmitter<any> = new EventEmitter<any>();
  modalType = "Add";

  aprobadorForm = this.fb.group({
    de_foto: ["", Validators.required],
    co_aprobador: ["", Validators.required],
    de_aprobador: ["", Validators.required],
    de_email_aprobador: ["", Validators.required],
    fg_vigente: ["", Validators.required]
  });
  constructor(private fb: FormBuilder,
    private aprobadorService: AprobadorService,
    private messageService: MessageService) { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    if (this.selectedAprobadores) {
      this.modalType = 'Edit';
      this.aprobadorForm.patchValue(this.selectedAprobadores);
    } else {
      this.aprobadorForm.reset();
      this.modalType = 'Add';
    }
  }

  closeModal() {
    this.aprobadorForm.reset();
    this.clickClose.emit(true);
  }

  // addEditAprobador() {
  //   this.aprobadorService.addEditAprobador(this.aprobadorForm.value, this.selectedAprobadores).subscribe(
  //     response => {
  //       this.clickAddEdit.emit(response);
  //       this.closeModal();
  //       const msg = this.modalType === 'Add' ? 'Aprobador added' : 'Aprobador updated';
  //       this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });
  //     },
  //     error => {
  //       this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
  //       console.log('Errror occured');
  //     }
  //   )
  // }

}