import { Component, OnInit, HostListener } from '@angular/core';
import { UsuarioService } from '../../services/usuario.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { Usuario } from '../../pages/usuarios/usuario';
import { environment } from '../../../environments/environment';

const base_url = environment.base_url;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: [
  ]
})

export class HeaderComponent implements OnInit {
  public usuario: Usuario;
  public http_url_img: string;
  public isMenuCollapsed: boolean = false;
  public isLogoChanged: boolean = false;
  public isSearchVisible: boolean = false;

  constructor(private router: Router, public authService: UsuarioService) {
    this.usuario = authService.usuario;
  }

  logout(): void {
    let username = this.authService.usuario.de_nom_solicitante + ' ' + this.authService.usuario.de_pat_solicitante;
    console.log(username);
    this.authService.logout();
    swal.fire('Logout', `${username}, has cerrado sesión con éxito!`, 'success');
    this.router.navigate(['/login']);
  }
  
  toggleMenu(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  toggleLogo(): void {
    this.isLogoChanged = !this.isLogoChanged;
  }

  toggleSearch(event: Event): void {
    event.stopPropagation();
    this.isSearchVisible = !this.isSearchVisible;
    console.log(this.isSearchVisible);
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: Event) {
    if (this.isSearchVisible) {
      this.isSearchVisible = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isLogoChanged = window.innerWidth < 1168;
  }

  ngOnInit(): void {
    this.http_url_img = `${base_url}/usuarios/uploads/img/`;
    this.isLogoChanged = window.innerWidth < 1168;
    this.isSearchVisible = false;
  }
}