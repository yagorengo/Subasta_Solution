
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { sp } from "@pnp/sp/presets/all";

export class Services {

    constructor(private context: WebPartContext) {}
    protected async onInit(): Promise<void> {
        sp.setup(this.context);
      }

    public async isHome():Promise<boolean>{
      let pathName = this.context.pageContext.site.serverRequestPath.indexOf("Home.aspx")
      if(pathName == -1){
        return false;
      }else
      return true
    }
    public async getIdProduct():Promise<any> {
      let queryString = new URLSearchParams(window.location.search);
      let queryIdProduct:any = await queryString.get('idProduct')?queryString.get('idProduct'):"";
      console.log("id product", queryIdProduct)
      return queryIdProduct
    }

    public  getProductImages(idProduct): Promise<any>{
    
        return sp.web.lists.getByTitle("Productos").items.getById(idProduct).get().then((product)=>{
        /*   let images:Array<IImage>=[];
         let avatar: String = "https://claroaup.sharepoint.com/sites/SubastasAUP/SiteAssets/avatarAuto.png"
          images[0]= {imageSrc:product.Imagen1?product.Imagen1.Url: avatar, index:0};
          images[1]=  {imageSrc:product.Imagen2?product.Imagen2.Url: avatar, index:1}
          images[2]=  {imageSrc:product.Imagen3?product.Imagen3.Url: avatar, index:2}
          images[3]=  {imageSrc:product.Imagen4?product.Imagen4.Url: avatar, index:3}
          images[4]=  {imageSrc:product.Imagen5?product.Imagen5.Url: avatar, index:4} */
          
          return product
        })
   }

   //**obtiene todos los productos a subastar en estado habilitado */
   public getAllAviableProducts():Promise<any>{
    return sp.web.lists.getByTitle("Productos").items.filter("State eq 'Disponible'").get().then((productos)=> {
      return productos
    })
   }

    public async obtenerUsuario():Promise<any>{
      let usuario = await sp.web.currentUser.get()
      console.log("Usuario en service", usuario)
      return usuario
   }
}