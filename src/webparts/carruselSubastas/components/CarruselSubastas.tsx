import * as React from 'react';
import styles from './CarruselSubastas.module.scss';
import { ICarruselSubastasProps } from './ICarruselSubastasProps';
import {ICarruselSubastasState} from './ICarruselSubastasState';
import { escape } from '@microsoft/sp-lodash-subset';
import {ICarouselImageProps} from "@pnp/spfx-controls-react/lib/controls/carousel/CarouselImage";
import { Carousel, CarouselButtonsLocation,CarouselButtonsDisplay,CarouselIndicatorShape } from "@pnp/spfx-controls-react/lib/Carousel";
import { Services } from '../services/Services';
import { Label, Pivot, PivotItem } from '@fluentui/react';
import { ImageFit } from 'office-ui-fabric-react/lib/Image';
export interface IDetails {
 description:String;
 state:String;
 info:String;
 doors:Number;
 kms:Number;
 model:Number;
 motor:String;
}

export default class CarruselSubastas extends React.Component<ICarruselSubastasProps, ICarruselSubastasState> {

  private Services: Services = null;
  constructor(props: ICarruselSubastasProps) {
    super(props);
    this.state = {
      products: [{
        imageSrc:"",
        title:"",
        url:""
        //style:{height:150}
      }],
      details:null,
      spinner:false,
      isHomePage:true
    }
    this.Services = new Services(this.props.context);
    }
    public async componentDidMount(){
      this.setState({spinner:true})
      let isHome = await this.Services.isHome()

      if (isHome){
        this.Services.getAllAviableProducts().then((products)=>{
          let arrayProducts = products.map((product)=>{
           let tempProd:ICarouselImageProps= { 
            imageSrc:product.Imagen1? product.Imagen1.Url:product.imageSrc,
            title:product.Title?product.Title:"",
            imageFit: ImageFit.contain,
            detailsStyle: {display:'flex'},
            url:product.Title==""?"":"https://claroaup.sharepoint.com/sites/SubastasAUP/SitePages/Disp-Producto.aspx?idProduct="+product.ID}
            return tempProd
          })
         
          this.setState({products:arrayProducts, isHomePage:true, spinner:false})
        })
      }else{
        let idProd = await this.Services.getIdProduct()
        this.Services.getProductImages(idProd).then((product)=> {
          console.log("Detalles", product)
          let images:any= [];
          let avatar: String = "https://claroaup.sharepoint.com/sites/SubastasAUP/SiteAssets/avatarAuto.png"
           images[0]= {imageSrc:product.Imagen1?product.Imagen1.Url: avatar, imageFit:ImageFit.contain};
           images[1]=  {imageSrc:product.Imagen2?product.Imagen2.Url: avatar,imageFit:ImageFit.contain}
           images[2]=  {imageSrc:product.Imagen3?product.Imagen3.Url: avatar, imageFit:ImageFit.contain}
           images[3]=  {imageSrc:product.Imagen4?product.Imagen4.Url: avatar, imageFit:ImageFit.contain}
           images[4]=  {imageSrc:product.Imagen5?product.Imagen5.Url: avatar, imageFit:ImageFit.contain}
          let detalles:IDetails = {
            description:product.DescriptionProduct,
            state:product.State,
            info:"",
            doors:product.CarDoor,
            kms:product.Kms,
            model:product.Model,
            motor:product.Motor
          }
           this.setState({products:images, isHomePage:false, spinner:false, details:detalles})
        })
      }
     } 

  public render(): React.ReactElement<ICarruselSubastasProps> {
    return (
      <div className={styles.carruselSubastas}>
        <Carousel
          buttonsLocation={CarouselButtonsLocation.center}
          buttonsDisplay={CarouselButtonsDisplay.buttonsOnly}
          contentContainerStyles={this.state.isHomePage?styles.carouselContainer:styles.carouselContent}
          isInfinite={true}
          indicatorShape={CarouselIndicatorShape.circle}
          pauseOnHover={true}    
          element={this.state.products}
          onMoveNextClicked={(index: number) => {  }}
          onMovePrevClicked={(index: number) => { }}
        />
        {this.state.isHomePage==false?
        <div>
        <Pivot aria-label="Large Link Size Pivot Example" linkSize="large">
          <PivotItem headerText="Descripción">
            <Label>{this.state.details.description}</Label>
          </PivotItem>
          <PivotItem headerText="Estado">
            <Label>{this.state.details.state}</Label>
          </PivotItem>
          <PivotItem headerText="Info">
            <Label>{this.state.details.info}</Label>
          </PivotItem>
          <PivotItem headerText="Puertas">
            <Label>{this.state.details.doors}</Label>
          </PivotItem>
          <PivotItem headerText="Kilómetros">
            <Label>{this.state.details.kms}</Label>
          </PivotItem>
          <PivotItem headerText="Modelo">
            <Label>{this.state.details.model}</Label>
          </PivotItem>
          <PivotItem headerText="Motor">
            <Label>{this.state.details.motor}</Label>
          </PivotItem>
        </Pivot>
      </div>
      :""
        }
      
      </div>
      
    );
  }
}
