import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import styles from './EncabezadoSubastas.module.scss'
import "@pnp/sp/webs";
import "@pnp/sp/site-groups/web";
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';
import { sp } from "@pnp/sp/presets/all";
import * as strings from 'EncabezadoSubastasApplicationCustomizerStrings';
import { IHeaderProps, Header } from './components/Header';
import * as React from 'react';
import * as ReactDom from 'react-dom';
const LOG_SOURCE: string = 'EncabezadoSubastasApplicationCustomizer';


export interface IEncabezadoSubastasApplicationCustomizerProperties {
 
  Top: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class EncabezadoSubastasApplicationCustomizer
  extends BaseApplicationCustomizer<IEncabezadoSubastasApplicationCustomizerProperties> {
    private static headerPlaceholder: PlaceholderContent;
    private isCierreSubastaPage: boolean = false
   // private isCustomPage: boolean = false;  
    private pathName: string = '';
    //private webURL: string = '';
    private isUserAdmin: boolean;

    @override
  public onInit(): Promise<void> {
    sp.setup(this.context);
    this.pathName = this.context.pageContext.site.serverRequestPath;
    //this.webURL = this.context.pageContext.web.absoluteUrl.replace('/SitePages/','');
    /* this.isCustomPage = this.pathName.indexOf('Home.aspx') !== -1 || 
    this.pathName.indexOf('Disp-Producto.aspx') !== -1 || 
    this.pathName.indexOf('Productos.aspx') !== -1 || 
    window.location.href == this.webURL ;  */
    
    this.isCierreSubastaPage = this.pathName.indexOf("Apertura.aspx") !== -1 ? true :false;
    if(this.isCierreSubastaPage){
    this.validarSubastaActiva().then((res)=> {
      if(!res){
        Dialog.alert(`La subasta no está activa`);
      }
    })
    } 
    this.context.application.navigatedEvent.add(this, () => {
      this.loadReactComponent();
    });
    this.render(); 
    return Promise.resolve();
  }

  private render() {
    if (this.context.placeholderProvider.placeholderNames.indexOf(PlaceholderName.Top) !== -1) {
      if (!EncabezadoSubastasApplicationCustomizer.headerPlaceholder || !EncabezadoSubastasApplicationCustomizer.headerPlaceholder.domElement) {
        EncabezadoSubastasApplicationCustomizer.headerPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, {
          onDispose: this.onDispose
        });
      }

      this.loadReactComponent();
    }
    else {
      console.log(`The following placeholder names are available`, this.context.placeholderProvider.placeholderNames);
    }
  }
     

  private async loadReactComponent() {
    
    let isAdm = await this.isUserAdminFn()
    
    if (EncabezadoSubastasApplicationCustomizer.headerPlaceholder && EncabezadoSubastasApplicationCustomizer.headerPlaceholder.domElement) {
      const element: React.ReactElement<IHeaderProps> = React.createElement(Header, {
        context: this.context,
        isUserAdmin:isAdm
      });

      ReactDom.render(element, EncabezadoSubastasApplicationCustomizer.headerPlaceholder.domElement);
    }
    else {
      console.log('DOM element of the header is undefined. Start to re-render.');
      this.render();
    }
  }
  public async validarSubastaActiva():Promise<boolean>{
    let queryString = new URLSearchParams(window.location.search);
    let idSubastaQuery = queryString.get('idSubasta')
    let idSubastaActiva = await this.getSubastaActiva()
    if(idSubastaActiva==idSubastaQuery){
      return true
    }else
    return false
  }

  public  async isUserAdminFn():Promise<boolean>{
    return sp.web.currentUser.groups.getById(3).get().then((res)=>{
   
      return true
    }).catch((e)=> {
      return false
    })
  }

  public async getSubastaActiva(): Promise<any>{
    let subastaActiva:any = await sp.web.lists.getByTitle("Subastas").items.filter("State eq 'Iniciada'").get()
    return subastaActiva[0]? subastaActiva[0].ID: 0
  }
  private _onDispose(): void {
    if (EncabezadoSubastasApplicationCustomizer.headerPlaceholder && EncabezadoSubastasApplicationCustomizer.headerPlaceholder.domElement) {
      ReactDom.unmountComponentAtNode(EncabezadoSubastasApplicationCustomizer.headerPlaceholder.domElement);
    }
  }
 
}
