
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { sp } from "@pnp/sp/presets/all";

export class Services {

    constructor(private context: WebPartContext) {}
    protected async onInit(): Promise<void> {
        sp.setup(this.context);
      }

    public  getProducts(): Promise<any>{
      let queryString = new URLSearchParams(window.location.search);
      var foo = queryString.get('k')
      console.log("QueryString", foo)
      if (foo && foo.length > 3){
        return sp.web.lists.getByTitle("Productos").items.filter("State eq 'Disponible' and substringof('"+foo+"',Title)").get().then((productos)=> {
          return productos
      })
      }else{
        return sp.web.lists.getByTitle("Productos").items.filter("State eq 'Disponible'").get().then((productos)=> {
          return productos
      })
      }
      
   }

    public async obtenerUsuario():Promise<any>{
      let usuario = await sp.web.currentUser.get()
   
      return usuario
   }
}