import { WebPartContext } from "@microsoft/sp-webpart-base";
import { sp } from "@pnp/sp/presets/all";
import * as moment from 'moment';
import AES from "crypto-js/aes";
import Utf8 from "crypto-js/enc-utf8";
import { HttpClient, IHttpClientOptions, HttpClientResponse,ODataVersion } from '@microsoft/sp-http';



export class Services {

    constructor(private context: WebPartContext) {}
    protected async onInit(): Promise<void> {
      
        sp.setup(this.context);
      }

    public postSecret(nameSecret:string, valueSecret:string):Promise<any>{
      
      let function_key = "2yhr/UsUEfT22r6pHungie8aQopCt0ckPqJlt5gUEB7rFcfU13l0aQ=="
      const postURL = "https://subastas-aup-fn.azurewebsites.net/api/SetOfertas";
      const requestHeaders: Headers = new Headers();
      requestHeaders.append("Content-type", "text/plain");    
      requestHeaders.append("Cache-Control", "no-cache");  
      requestHeaders.append("x-functions-key",function_key);

      const postOptions: IHttpClientOptions = {
        headers: requestHeaders,    
        body: `{ "id": "${nameSecret}", "value": "${valueSecret}" }`,
        method: "POST"
      }
        return this.context.httpClient.post(postURL, HttpClient.configurations.v1, postOptions)
        .then((response: HttpClientResponse) => {
         return  response.json().then((responseJSON: JSON) => {
             return responseJSON;
           })
          })
    }
    

    public async getIdProduct():Promise<any> {
      let queryString = new URLSearchParams(window.location.search);
      let queryIdProduct:any = await queryString.get('idProduct')?queryString.get('idProduct'):"";
      
      return queryIdProduct
    }

    public async getDetailProduct(idProduct): Promise<any>{
      let vehiculo:any = await sp.web.lists.getByTitle("Productos").items.getById(idProduct).select("Title,Precio,Category,TaxCatchAll/ID,TaxCatchAll/Term").expand("TaxCatchAll").get()
     
      return vehiculo
   }
    public async getSubastaActiva(): Promise<any>{
      let subastaActiva:any = await sp.web.lists.getByTitle("Subastas").items.filter("State eq 'Iniciada'").get()
     // console.log("subasta activa full", subastaActiva)
      
      if(subastaActiva[0]){
        let caducada:boolean = moment().isAfter(subastaActiva[0].OData__EndDate)
        console.log("caducada?", caducada)
        let idSubasta = caducada? 0: subastaActiva[0].ID
        return [idSubasta , idSubasta==0? "vencida": ""]
      }else{
        return [0,"inactiva"]
      }
    }

    public async getOfertasEnSubastaActiva(IdSubasta):Promise<any>{
      let userId = await sp.web.currentUser.select("ID").get()
      let ofertas = await sp.web.lists.getByTitle("Ofertas").items.filter("SubastaId eq "+IdSubasta+" and AuthorId eq "+userId.Id).get()
     // console.log("ofertas en subasta activa", ofertas)
      return ofertas.length
    }
    public async getOfertasDelProducto(id, subastaId):Promise<any>{
      let userId = await sp.web.currentUser.select("ID").get()
      let ofertas = await sp.web.lists.getByTitle("Ofertas").items.filter("ProductoId eq "+id+" and AuthorId eq "+userId.Id+" and SubastaId eq "+subastaId  ).get()
     // console.log("oferttas del producto", ofertas)
      return ofertas.length
    }
    public async obtenerUsuario():Promise<any>{
      let usuario = await sp.web.currentUser.get()
      return usuario
   }


   /**
    * Funcion que encripta el valor del monto ofertado
    * @param text valor del monto
    * @param passphrase llave
    * @returns valor encriptado
    */
   encryptWithAES = (text, passphrase) => {
    return AES.encrypt(text, passphrase).toString();
    };



  decryptWithAES = (ciphertext, passphrase) => {
    const bytes = AES.decrypt(ciphertext, passphrase);
    const originalText = bytes.toString(Utf8);
    return originalText;
    };

  

   public async getKeyAndValue(price):Promise<any>{
    let timeStamp = moment().unix();
    let random3 = Math.floor(Math.random() * 1000);
    let key = `${timeStamp.toString() + random3.toString()}`
    let valueSecret = this.encryptWithAES(price,key)
    let keyAndSecret = [{key, valueSecret}];
    return keyAndSecret
   // console.log("decrypt value", this.decryptWithAES(this.encryptWithAES(value,key),key));
   }
   public async newOferta(idProduct:Number, idSubasta:Number, title:String, value:string):Promise<any>{

      let secrets = await this.getKeyAndValue(value)

      let resPost = await  this.postSecret(secrets[0].key, secrets[0].valueSecret)

      return sp.web.lists.getByTitle("Ofertas").items.add({
      ProductoId:idProduct,
      SubastaId:idSubasta,
      Title:title,
      IdSecret:resPost.id
     }).then((respuesta)=>{
       console.log("rta del addItem", respuesta)
       return respuesta
     }).catch(err => {return err})
    
    }
}