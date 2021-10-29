import * as React from 'react';
import styles from './AperturaDeSobres.module.scss';
import { IAperturaDeSobresProps } from './IAperturaDeSobresProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { Services } from '../Services/Services';
import { PrimaryButton,DefaultButton, } from '@fluentui/react/lib/Button';
import { Spinner } from '@fluentui/react/lib/Spinner';
import { TextField } from '@fluentui/react/lib/TextField';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { MessageBar, MessageBarType,  Link } from '@fluentui/react';

export interface IAperturaDeSobresState {
  spinner:Boolean;
  ofertas:any;
  enableButton:Boolean;
  subastaActiva:any;
  errorValidateTitle:Boolean;
  fieldValue:string;
  confirmDialog:boolean;
  successDialog:boolean;
  error:string;
}
export default class AperturaDeSobres extends React.Component<IAperturaDeSobresProps, IAperturaDeSobresState> {
  private Services: Services = null;
  constructor(props:IAperturaDeSobresProps){
    super(props);
    this.state = ({
      spinner:false,
      ofertas:null,
      enableButton:false,
      subastaActiva:null,
      errorValidateTitle:false,
      fieldValue:"",
      confirmDialog:false,
      successDialog:false,
      error:""
    })
    this.Services = new Services(this.props.context);
  }
  private dialogContentProps = {
    type: DialogType.normal,
    title: 'Cierre de subasta',
    closeButtonAriaLabel: 'Close',
    subText: '¿Desea confirmar el cierre de la subasta? Verifique que la aplicación tenga los permisos necesarios para desencriptar los valores de las ofertas.',
  };
  private dialogSpinnerProps = {
    type: DialogType.normal,
    title: 'Apertura de sobres'
  }
  private successDialogProps = {
    type: DialogType.normal,
    title: 'Subasta cerrada',
    subText: "Los montos fueron cargados y la subasta paso a estado cerrada"
  }
  public componentDidMount() {
  this.Services.getSubastaActiva().then((subastaActiva)=> {
    let queryString = new URLSearchParams(window.location.search);
    let idSubastaQuery = queryString.get('idSubasta')
    if(idSubastaQuery==subastaActiva.ID){
      this.Services.getOfertasEnSubastaActiva(subastaActiva.ID).then((ofertasActivas)=> {
        this.setState ({ofertas:ofertasActivas, enableButton:true, subastaActiva:subastaActiva})
      })
    }else{
      this.setState({
        enableButton:false
      })
      //la subasta no es una subasta activa
    }
  })
  }

  private  aperturaDeSobres = () :void => {
     Promise.all(
      this.state.ofertas.map((oferta)=>{
        this.setState({spinner:true, confirmDialog:false})
        return this.Services.openSecrets(oferta.Id, oferta.IdSecret)
        })
    ).then(()=> {
      this.Services.closeSubasta(this.state.subastaActiva.ID).then(()=> {
        this.setState({spinner:false, successDialog:true})
      }).catch((err=>this.setState({error:err, spinner:false })))  
    }).catch((err=>this.setState({error:err, spinner: false})))  
 }
 

 private handleCierreButton = () :void => {
  
  if(this.state.subastaActiva.Title == this.state.fieldValue){
    this.setState({confirmDialog:true, errorValidateTitle:false})
  }else{
    this.setState({errorValidateTitle:true})
  }
 }
 private handleOnChangeLabel = (value) :void => {
  this.setState({fieldValue:value})
 }

 private closeDialog = (): void => {
  this.setState({confirmDialog:false})
 }

private aceptErrorDialog = ():void => {
  this.setState({error:""})
}

  public render(): React.ReactElement<IAperturaDeSobresProps> {
    return (
      <div className={ styles.aperturaDeSobres }>
          <div className={styles.container }>
            <div className={styles.button}>
              <PrimaryButton onClick={this.handleCierreButton} text="Cerrar subasta" disabled={!this.state.enableButton}/>
            </div>
            <TextField
            value={this.state.fieldValue}
            onChange={(e,newValue)=>this.handleOnChangeLabel(newValue)}
            label="Ingrese el título de la subasta que desea cerrar."
            errorMessage={this.state.errorValidateTitle?"El titulo es inválido":""}
            />
          </div>
           <Dialog
            hidden={!this.state.confirmDialog}
            onDismiss={this.closeDialog}
            dialogContentProps={this.dialogContentProps}
            modalProps={{isBlocking: true}}
            >
              <DialogFooter>
                <PrimaryButton onClick={this.aperturaDeSobres} text="Acpetar" />
                <DefaultButton onClick={this.closeDialog} text="Cancelar" />
              </DialogFooter>
            </Dialog>
            <Dialog hidden={!this.state.spinner}
            dialogContentProps={this.dialogSpinnerProps}
            modalProps={{isBlocking: true}}>
              <Spinner label="Desencriptando monto de ofertas" />
            </Dialog>
            <Dialog 
            hidden={!this.state.successDialog}
            dialogContentProps={this.successDialogProps}
            modalProps={{isBlocking: true}}>
              <DialogFooter>
                <PrimaryButton onClick={()=>location.reload()} text="Aceptar" />
              </DialogFooter>
            </Dialog>
            <Dialog 
            hidden={this.state.error==""?true:false}
            onDismiss={this.aceptErrorDialog}
            dialogContentProps={{type:DialogType.normal, title:"Error"}}
            modalProps={{isBlocking: true}}>
              <MessageBar
                messageBarType={MessageBarType.error}
                isMultiline
                dismissButtonAriaLabel="Close"
              >
                Error en la apertura de sobres, asegúrese de que la aplicación tenga permiso de GET en los SECRETS y vuelva a intentarlo.

              </MessageBar>
              <DialogFooter>
                <PrimaryButton onClick={this.aceptErrorDialog} text="Aceptar" />
              </DialogFooter>
            </Dialog>
      </div>
    );
  }
}
