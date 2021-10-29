import { WebPartContext } from "@microsoft/sp-webpart-base";
import { sp } from "@pnp/sp/presets/all";



export class Services {

  constructor(private context: WebPartContext) {}
    protected async onInit(): Promise<void> {
        sp.setup(this.context);
      }
  
      public async getSubastaActiva(): Promise<any>{
        let subastaActiva:any = await sp.web.lists.getByTitle("Subastas").items.filter("State eq 'Iniciada'").get()
        
          return subastaActiva.length == 0 ? 0 : subastaActiva[0].ID
        
      }

      public async notificarGanador(idOferta:number): Promise<any>{
        let resOfertaNotificada = await sp.web.lists.getByTitle("Ofertas").items.getById(idOferta)
        .update({stateOferta:"Notificada"})
        return resOfertaNotificada;
      }

      public async getIdSubasta():Promise<any>{
        let queryString = new URLSearchParams(window.location.search);
        let idSubastaQuery = queryString.get('idSubasta')
        return idSubastaQuery
      }
  
      public async getOfertasEnSubastaActiva(IdSubasta):Promise<any>{
        let ofertas = await sp.web.lists.getByTitle("Ofertas").items
        .select("Author/Title", "ID", "Author/EMail", "Author/UserName", "stateOferta", "Producto/Title", "Producto/Id", "Subasta/Id", "Subasta/Title","Created", "Offer")
        .expand("Producto", "Subasta", "Author")
        .orderBy("Offer", false)
        .filter("SubastaId eq "+IdSubasta).getAll()
        return ofertas;
      }

  public async getOfertas():Promise<any>{
    let idSubastaQuery = await this.getIdSubasta()
    
    if(idSubastaQuery){
      let ofertas = await this.getOfertasEnSubastaActiva(idSubastaQuery)
      return ofertas?ofertas:0
    }else{
      let subastaActiva:any = await this.getSubastaActiva()
      let ofertas = await this.getOfertasEnSubastaActiva(subastaActiva)
      return ofertas
    }
  
  }
  
}