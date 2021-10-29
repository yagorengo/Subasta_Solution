import * as React from 'react';
import styles from './ProductosASubastar.module.scss';
import { IProductosASubastarProps } from './IProductosASubastarProps';
import {IProductosASubastarSatate} from './IProductosASubastarSatate';
import { ImageFit } from 'office-ui-fabric-react/lib/Image';
import { ISize } from 'office-ui-fabric-react/lib/Utilities';
import { GridLayout } from "@pnp/spfx-controls-react/lib/GridLayout";
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { Label } from '@fluentui/react/lib/Label';
import {
  DocumentCard,
  DocumentCardDetails,
  DocumentCardPreview,
  DocumentCardTitle,
  IDocumentCardPreviewProps,
  DocumentCardType
} from '@fluentui/react/lib/DocumentCard';
import { Services } from '../services/Services';

export default class ProductosASubastar extends React.Component<IProductosASubastarProps, IProductosASubastarSatate> {

  private Services: Services = null;
  constructor(props: IProductosASubastarProps) {
    super(props);
    this.state = {
      products: [{
        thumbnail:"",
        title:"",
        price:0,
        model:"",
        id:null
      }],
      spinner:false
    }
    this.Services = new Services(this.props.context);
    }

   public componentDidMount(){
    this.setState({spinner:true})
     this.Services.getProducts().then((products)=>{
       let formatProducts = products.map((product)=>{
         let formatPrice = parseInt(product.Precio).toLocaleString('de-DE')
        let tempProd= { 
         thumbnail:product.Imagen1? product.Imagen1.Url:"",
         title:product.Title,
         price:formatPrice,
         model:product.Model,
         id:product.Id}
         return tempProd
       })
       this.setState({products:formatProducts, spinner:false})
     })
   } 

  public render(): React.ReactElement<IProductosASubastarProps> {
    
    return (
       <GridLayout
            ariaLabel="List of content, use right and left arrow keys to navigate, arrow down to access details."
            items={this.state.products}
            onRenderGridItem={(item: any, finalSize: ISize, isCompact: boolean) => this._onRenderGridItem(item, finalSize, isCompact)}
          />
    );
  }

  private _onRenderGridItem = (item: any, finalSize: ISize, isCompact: boolean): JSX.Element => {
    const previewProps: IDocumentCardPreviewProps = {
      previewImages: [
        {
          previewImageSrc: item.thumbnail,
          imageFit: ImageFit.contain,
          height: 130
        }
      ]
    };

    return (
    <div
      data-is-focusable={true}
      role="listitem"
      aria-label={item.title}
    >
      <DocumentCard
        type={isCompact ? DocumentCardType.compact : DocumentCardType.normal}
      >
        <DocumentCardPreview {...previewProps} />
        <DocumentCardDetails>
          <DocumentCardTitle
            styles={{root:{textAlign: 'center'}}}
            title={item.title}
            shouldTruncate={false}
          />
           <Label style={{textAlign:'center'}}>Precio: ${item.price}</Label>
           <Label style={{textAlign:'center'}}>Modelo: {item.model}</Label>
           <PrimaryButton text="Ver producto" href={"https://claroaup.sharepoint.com/sites/SubastasAUP/SitePages/Disp-Producto.aspx?idProduct="+item.id} allowDisabledFocus style={{width:'50%', marginRight: '20%', marginLeft: '20%'}}  />
        </DocumentCardDetails>
      </DocumentCard>
    </div>
    )
  }
}
