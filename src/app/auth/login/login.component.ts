import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../pages/usuarios/usuario';
import swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  titulo: string = 'Por Favor Iniciar Sesión !';
  usuario: Usuario = new Usuario();
  loading: boolean = false;

  constructor(
    private router: Router,
    private authService: UsuarioService
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      const usuario = this.authService.usuario;
      console.log(usuario);
      swal.fire('Login', `Hola ${usuario.de_nom_solicitante} ${usuario.de_pat_solicitante}, ya estás autenticado!`, 'info');
      this.router.navigate(['/dashboard']);
    }
  }


  login(): void {
    if (!this.usuario.de_email || !this.usuario.de_password) {
      swal.fire('Error Login', 'Ingrese sus datos!', 'error');
      return;
    }
    this.loading = true;

    this.authService.login(this.usuario).subscribe(
      response => {
        this.authService.guardarUsuario(response.access_token);
        this.authService.guardarToken(response.access_token);
        const usuario = this.authService.usuario;
        console.log(usuario);
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      err => {
        this.loading = false;
        if (err.status === 400) {
          swal.fire('Error Login', 'Datos del Login Incorrectos', 'error');
          this.usuario = new Usuario();
          this.router.navigate(['/login']);
        } else if (err.status === 401) {
          swal.fire('Acceso no autorizado', 'No está autorizado para acceder al sistema. Consulte con su proveedor.', 'error');
          this.usuario = new Usuario();
        }
      }
    );
  }
}