import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../pages/usuarios/usuario';
import { environment } from '../../../environments/environment';
import { filter } from 'rxjs/operators';

const base_url = environment.base_url;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styles: []
})

export class SidebarComponent implements OnInit {
  public usuario: Usuario;
  public http_url_img: string;
  public menuItems: any[] = [];
  public activeMenu: string = '';

  constructor(private sidebarService: SidebarService, private usuarioService: UsuarioService, private router: Router) {
    this.usuario = usuarioService.usuario;
  }

  ngOnInit(): void {
    this.http_url_img = `${base_url}/usuarios/uploads/img/`;

    this.sidebarService.getDynamicMenu(this.usuario.co_tip_maestro, this.usuario.co_maestro).subscribe(menu => {
      this.menuItems = menu;
      this.setActiveMenu(this.router.url); 
      console.log('Menu Items:', this.menuItems);
    }, error => {
      console.error('Error loading dynamic menu:', error);
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.setActiveMenu(event.urlAfterRedirects);
    });

    this.sidebarService.dynamicMenu$.subscribe(menu => {
      this.menuItems = menu;
    });
  }

  setActiveMenu(url: string): void {
    this.activeMenu = '';
    this.menuItems.forEach(item => {
      if (item.submenu.some(subItem => `/${subItem.url}` === url)) {
        this.activeMenu = item.titulo;
      }
    });
  }

  isMenuOpen(item: any): boolean {
    return this.activeMenu === item.titulo;
  }
}