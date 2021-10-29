import {    IDocumentCardPreviewProps } from 'office-ui-fabric-react/lib/DocumentCard';

export interface IProductosASubastarSatate{
    products: [{
        thumbnail:string;
        title:string;
        price:number;
        model:string;
        id:Number;
    }];
    spinner:boolean;
}