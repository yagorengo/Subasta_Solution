import {ICarouselImageProps} from "@pnp/spfx-controls-react/lib/controls/carousel/CarouselImage";
import {IDetails} from './CarruselSubastas';
export interface ICarruselSubastasState{
    products: [ICarouselImageProps];
    details: IDetails;
    spinner:boolean;
    isHomePage:boolean;
}