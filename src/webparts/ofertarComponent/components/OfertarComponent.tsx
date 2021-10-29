import * as React from 'react';
import styles from './OfertarComponent.module.scss';
import { IOfertarComponentProps } from './IOfertarComponentProps';
import { Spinner } from '@fluentui/react/lib/Spinner';
import { TextField,Link, Text } from '@fluentui/react'
import { escape } from '@microsoft/sp-lodash-subset';
import { Services } from '../services/Services';
import { Label } from '@fluentui/react/lib/Label';
import { Dialog as Alert } from '@microsoft/sp-dialog';
import { PrimaryButton,DefaultButton, } from '@fluentui/react/lib/Button';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import {
  DocumentCard,
  DocumentCardType
} from '@fluentui/react/lib/DocumentCard';
export interface IOfertasState  {
  product:{
    idProduct:Number;
    marca:String;
    model:String;
    price:Number;
  };
  spinner:boolean;
  subasta:Number;
  ofertasEnProducto:Number;
  ofertasEnSubasta:Number;
  ofertaDialog:Boolean;
  aceptDialog:Boolean;
  valueOfert:string;
  successDialog:boolean;
  confirmDialog:boolean;
  errorValidateTitle:Boolean;
}
const dialogContentProps  = {
  type: DialogType.normal,
  title: 'Realizar Oferta',
  closeButtonAriaLabel: 'Close'
};
const dialogSpinnerProps = {
  type: DialogType.normal,
  title: 'Guardando oferta'
}
const successDialogProps = {
  type: DialogType.normal,
  title: 'Oferta Realizada',
  subText: "Su oferta fue realizada con éxito."
}


const modalProps = {
  isBlocking: false,
  styles: { main: { maxWidth: 450 } }
}
export default class OfertarComponent extends React.Component<IOfertarComponentProps, IOfertasState> {
 
  private Services: Services = null;
  constructor(props: IOfertarComponentProps) {
    super(props);
    this.state = {
      subasta:0,
      spinner:false,
      product:{
        idProduct:0,
        marca:"",
        model:"",
        price:0
      },
      successDialog:false,
      ofertasEnProducto:0,
      ofertasEnSubasta:0,
      ofertaDialog:false,
      aceptDialog:false,
      confirmDialog:false,
      valueOfert:"",
      errorValidateTitle:false,
    }
    this.Services = new Services(this.props.context);
    }
    
    
  
  public componentDidMount() {
    this.loadData();
  }
  private async loadData(){
    
    let idProduct = await this.Services.getIdProduct()
     this.Services.getDetailProduct(idProduct).then((data)=>{
       let tempArray = {
         idProduct:idProduct,
         marca:data.TaxCatchAll[0].Term,
         model:data.Title,
         price:data.Precio
       }
       this.setState({product:tempArray})
     })
     this.Services.getSubastaActiva().then(async(subastaActiva)=> {
       console.log("subasta activa ", subastaActiva)
       if(subastaActiva[0]!=0){
        let ofertasEnSubasta = await this.Services.getOfertasEnSubastaActiva(subastaActiva[0])
        let ofertasEnProducto = await this.Services.getOfertasDelProducto(idProduct, subastaActiva[0])
        this.setState({
          subasta:subastaActiva[0],
          ofertasEnSubasta:ofertasEnSubasta,
          ofertasEnProducto:ofertasEnProducto
        })
       }else{
         Alert.alert("La subasta está "+subastaActiva[1])
       }
     })
  }
  private handleOnChangeValue= (newValue:string):void =>{
    let onlyNums = newValue.replace(/[^0-9]/g, '');
      this.setState({valueOfert:onlyNums, errorValidateTitle:false})
  }
  private handleOfertar = ():void =>{
     this.setState({ofertaDialog:true, aceptDialog:true})
  }
  private handleAceptarOferta = ():void =>{
    
    let montoOfertado:Number = parseFloat(this.state.valueOfert)
    if(montoOfertado<this.state.product.price){
      this.setState({errorValidateTitle:true})
    }
    else{
      this.setState({confirmDialog:true, ofertaDialog:false, errorValidateTitle:false})
    }
 }

 private handleConfirmOferta = ():void =>{
  this.setState({spinner:true})
  this.Services.newOferta(this.state.product.idProduct, this.state.subasta, this.state.product.model,this.state.valueOfert)
  .then((res)=>{
    this.loadData().then(()=>{
      this.setState({successDialog:true, confirmDialog:false, spinner:false})
    })
  })
 }
 private handleOk = ():void =>{
   this.setState({aceptDialog:false, confirmDialog:true})
 }
 
private closeDialogs = ():void => {
  this.setState({successDialog:false,confirmDialog:false, aceptDialog:false, ofertaDialog:false})
}

  public render(): React.ReactElement<IOfertarComponentProps> {
  let montoConFOrmat:Number = parseInt(this.state.valueOfert)
    return (
      <div className={ styles.ofertarComponent }>    
      <DocumentCard
        className={styles.card}
        type={ DocumentCardType.normal }
      >
          <div className={styles.modelo}>
            <Label className={styles.label}>Modelo </Label>
            <Label className={styles.label}>{this.state.product.model}</Label>
          </div>    
          <div className={styles.marca}>
            <Label className={styles.label}>Marca </Label>
            <Label className={styles.label}>{this.state.product.marca}</Label>
          </div>
          <div className={styles.precio}>
            <Label className={styles.label}>Precio inicial </Label>
            <Label className={styles.label}>${this.state.product.price}</Label>
          </div>
          <div className={styles.divButtons}>
            <PrimaryButton onClick={this.handleOfertar}
             disabled={this.state.ofertasEnProducto>0 || this.state.ofertasEnSubasta> 1 || this.state.subasta ==0} 
             text="Ofertar" style={{fontSize:15}} />
            <PrimaryButton text="Salir" href={this.props.context.pageContext.web.absoluteUrl}  style={{fontSize:15}}/> 
          </div>        
      </DocumentCard>
        <Dialog
        dialogContentProps={dialogContentProps}
        modalProps={modalProps}
        hidden={!this.state.ofertaDialog}>
        <Text>
          Si estas de acuerdo con las 
        <Link target={'_blank'} href={"https://claroaup.sharepoint.com/sites/SubastasAUP/SitePages/T%C3%A9rminos-y-condiciones.aspx"}> condiciones </Link>
          ingrese un monto a ofertar.
        </Text>
        <TextField
         errorMessage={this.state.errorValidateTitle?"El valor de la oferta debe ser mayor al inicial":""}
        value={this.state.valueOfert}
        onChange={(e,newValue) =>this.handleOnChangeValue(newValue)}
        styles={{root:{width:200}}}
        placeholder="Valor sin puntos ni coma"/>
        <DialogFooter>
          <PrimaryButton onClick={this.handleAceptarOferta} text="Aceptar" />
          <DefaultButton onClick={this.closeDialogs} text="Cancelar" />
        </DialogFooter>
      </Dialog>
      <Dialog
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Confirmar oferta',
          subText: "Desea confirmar la oferta por $"+montoConFOrmat.toLocaleString('de-DE')+"?"
        }}
        modalProps={{isBlocking: true}}
        hidden={!this.state.confirmDialog}
      >
          <DialogFooter>
            <PrimaryButton onClick={this.handleConfirmOferta} text="Aceptar" />
            <DefaultButton onClick={this.closeDialogs} text="Cancelar" />
          </DialogFooter>
      </Dialog>
      <Dialog
        dialogContentProps={successDialogProps}
        modalProps={{isBlocking: true}}
        hidden={!this.state.successDialog}
      >
        <DialogFooter>
            <PrimaryButton onClick={this.closeDialogs} text="Aceptar" />
        </DialogFooter>
      </Dialog>
      <Dialog hidden={!this.state.spinner}
            dialogContentProps={dialogSpinnerProps}
            modalProps={{isBlocking: true}}>
          <Spinner label="Se está guardando la oferta"></Spinner>
      </Dialog>
      </div>
    );
  }
  
}
