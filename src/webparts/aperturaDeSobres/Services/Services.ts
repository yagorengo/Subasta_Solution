import { WebPartContext } from "@microsoft/sp-webpart-base";
import { sp } from "@pnp/sp/presets/all";
import AES from "crypto-js/aes";
import Utf8 from "crypto-js/enc-utf8";
import { HttpClient, IHttpClientOptions, HttpClientResponse,ODataVersion } from '@microsoft/sp-http';



export class Services {

  constructor(private context: WebPartContext) {}

  protected async onInit(): Promise<void> {
        sp.setup(this.context);
      }
  
  public async openSecrets(IdItem, IdSecret){
      return  this.getSecrets(IdSecret).then((value)=> {
        let price =  this.decryptWithAES(value, IdSecret)
         return  this.addPrice(IdItem,price).then((rtaAddPrice)=> {
          return rtaAddPrice
        }) 
      })  
  }

  
  public async closeSubasta(idSubastaActiva:number): Promise<any>{
    return sp.web.lists.getByTitle("Subastas").items.getById(idSubastaActiva).update({State:"Finalizada"}).then((rta)=> {
      console.log("rta update subasta", rta)
      return true
    })
  }
  public async getSubastaActiva(): Promise<any>{
        let subastaActiva:any = await sp.web.lists.getByTitle("Subastas").items.filter("State eq 'Iniciada'").get()
        return subastaActiva[0]? subastaActiva[0]: null
      }
  //modificar a GetAll para retornar todos los items
  public async getOfertasEnSubastaActiva(IdSubasta):Promise<any>{
        let ofertas = await sp.web.lists.getByTitle("Ofertas").items.filter("SubastaId eq "+IdSubasta).select("Id","IdSecret").getAll()
        return ofertas
      }
 

  public getSecrets(nameSecret:string):Promise<any>{
      const function_key = "tyni3Cg7al5Fj55GiHFm8Iabp48YPpBI0FpZ30r0gQLTWXgD80KCoA=="
      const getURL = "https://subastas-aup-fn.azurewebsites.net/api/GetOfertas";

      const requestHeaders: Headers = new Headers();
      requestHeaders.append("Content-type", "text/plain");    
      requestHeaders.append("Cache-Control", "no-cache");  
      requestHeaders.append("x-functions-key",function_key);

      const postOptions: IHttpClientOptions = {
        headers: requestHeaders, 
        body: `{ "id":"${nameSecret}"}`,
        method: "POST"
      }
        return this.context.httpClient.post(getURL, HttpClient.configurations.v1, postOptions)
        .then((response: HttpClientResponse) => {
          return  response.json().then((responseJSON: any) => {
           return responseJSON.value
           }).catch(err=>console.log("err",err))
          }).catch(err=>console.log("err1",err))
        }

  private addPrice(id:number, price:number): Promise<any> {
    return sp.web.lists.getByTitle("Ofertas").items.getById(id).update({Offer:price}).then((resAddPrice)=> {
      return resAddPrice
    }).catch((err)=> {
      return err
    })
  }
  
  /**
   * Funcion que desencripta el valor del  secreto guardado en key vault
   * @param ciphertext texto encriptado
   * @param passphrase llave para desencriptar
   * @returns valor del monto ofertado desencriptado
   */
  decryptWithAES = (ciphertext, passphrase) => {
    const bytes = AES.decrypt(ciphertext, passphrase);
    const originalText = bytes.toString(Utf8);
    return originalText;
    };
  
}