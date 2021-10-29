import * as React from 'react';
import styles from './OfferView.module.scss';
import { IOfferViewProps } from './IOfferViewProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { ListView, IViewField, SelectionMode, GroupOrder, IGrouping } from "@pnp/spfx-controls-react/lib/ListView";
import { Services } from '../Services/Services';
import { DisplayMode } from '@microsoft/sp-core-library';
import { WebPartTitle } from "@pnp/spfx-controls-react/lib/WebPartTitle";
import * as moment from 'moment';
import { Icon } from '@fluentui/react/lib/Icon';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { PrimaryButton,DefaultButton, } from '@fluentui/react/lib/Button';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { MessageBar, MessageBarType, Toggle, Text, mergeStyles } from '@fluentui/react';

export interface IOfferViewState {
  subasta:string;
  spinner:boolean;
  offers:Array<any>;
  confirmDialog:boolean;
  itemConfirm: number;
  noActive:boolean;
  queryString:string;
}

export default class OfferView extends React.Component<IOfferViewProps, IOfferViewState> {

  private Services: Services = null;
  constructor(props: IOfferViewProps) {
    super(props);
    this.state = {
      subasta:"",
      spinner:false,
      offers:[],
      confirmDialog:false,
      itemConfirm:undefined,
      noActive:false,
      queryString:undefined
    }
    this.Services = new Services(this.props.context);
    }

    public componentDidMount(){
     this.loadData()
    }
    
    public loadData(){
      this.setState({spinner:true})
      this.Services.getOfertas().then((ofertas)=> {
        if(ofertas != 0){
          let offerArray:[any]= ofertas.map((oferta)=> {
            let offerTemp = {
              estado : oferta.stateOferta,
              producto: oferta.Producto.Title,
              idProducto: oferta.Producto.Id,
              creado: moment(oferta.Created).format('DD/MM/YYYY'),
              offer: oferta.Offer? oferta.Offer:"",
              subasta: oferta.Subasta.Title,
              autor: oferta.Author.Title,
              user: oferta.Author.UserName,
              id: oferta.ID
            }
            return offerTemp
          })
          this.setState({offers: offerArray, subasta:offerArray[0].subasta, spinner:false})
        }else{
          this.setState({noActive:true, spinner:false})
        }
      })
    }
    
  public render(): React.ReactElement<IOfferViewProps> {
    
    let items = this.state.offers

    return (
      <div>
          {this.state.spinner?
        <Spinner label="Cargando" size={SpinnerSize.large} ></Spinner>
        :
        this.state.noActive?
        <MessageBar role="none">
              No se encontró ninguna subasta activa.
        </MessageBar>
        :
        <div className={ styles.offerView }>
        <WebPartTitle 
        title={"Subasta: "+this.state.subasta}
        updateProperty={this.algo}
        displayMode={DisplayMode.Read}
        ></WebPartTitle>
        <ListView
        items={items}
        viewFields={this._fields}
        groupByFields={this.groupByFields}
        stickyHeader={true}
        />
         <Dialog
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Notificar adjudicación',
          subText: "¿Desea confirmar la adjudicación de la oferta?"
        }}
        modalProps={{isBlocking: true}}
        hidden={!this.state.confirmDialog}
        onDismiss={this.closeDialogs}
      >
          <DialogFooter>
            <PrimaryButton onClick={this._handleConfirm} text="Aceptar" />
            <DefaultButton onClick={this.closeDialogs} text="Cancelar" />
          </DialogFooter>
      </Dialog>
      </div>
        }
      </div>
       
        
    );
  }
  public algo(){
  }
  private closeDialogs = ():void => {
    this.setState({confirmDialog:false})
  }
  private _handleConfirm = ():void => {
    this.setState({confirmDialog:false, spinner:true})
    this.Services.notificarGanador(this.state.itemConfirm).then((res)=>{
      this.loadData();
    })
  }
  private esAdjudicado(product):boolean{
    let cant = this.state.offers.filter(offer => offer.idProducto == product && offer.estado == "Aceptada")
    if(cant.length > 0){
      return true
    }else{
      return false
    }
  }

  public _handleNotification(item){
    if(item.estado=="Realizada" && item.offer != "")
    {
 this.setState({
      confirmDialog:true,
      itemConfirm: item.id
    })
    }
   
  }

  public _renderMonto(item){
    if(item.offer==""){
      return ""
    }else{
      let montoConFOrmat:Number = parseInt(item.offer)
      return "$"+ montoConFOrmat.toLocaleString('de-DE')
    }
    
  }

  public _renderNotificar(item){
   
    let esAdjudicado = this.esAdjudicado(item.idProducto)
   // console.log("producto ", item , " es adjudicado?", esAdjudicado)
    let iconName= item.estado=="Realizada" && item.offer != "" && !esAdjudicado ? "Ringer": "RingerOff"
    let pointer= iconName=="Ringer"?"pointer":"default"
      return (
      <div className= {styles.noti} onClick={iconName=="Ringer"?()=>this._handleNotification(item):this.algo}>
          <Icon 
            style={{ alignSelf: 'center', fontSize:'15px', cursor: pointer}} 
            iconName={iconName}>
          </Icon>
      </div>)
    
  }
  private groupByFields: IGrouping[] = [
     {
      name: "producto", 
      order: GroupOrder.descending
    }
  ];
  private readonly _fields: IViewField[] = [
    {
      name: '',
      displayName: '',
      minWidth: 30,
      isResizable: true,
      maxWidth: 30,
      render: (item) => { return this._renderNotificar(item); }
    },
  {
    name: 'autor',
    displayName: 'Realizada por',
    sorting: true,
    isResizable: true,
    minWidth: 80
  
  }, {
    name: 'estado',
    displayName: 'Estado',
    sorting: true,
    isResizable: true,
    minWidth: 150,
  },
  {
    name: 'creado',
    displayName: 'Creado',
    sorting: true,
    isResizable: true,
    minWidth: 150,
  },
  {
    name: 'offer',
    displayName: 'Monto ofertado',
    sorting: true,
    isResizable: true,
    minWidth:150,
    render: (item) => { return this._renderMonto(item); }
  }];
}
