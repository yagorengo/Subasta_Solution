import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { setup as pnpSetup } from '@pnp/common';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'CarruselSubastasWebPartStrings';
import CarruselSubastas from './components/CarruselSubastas';
import { ICarruselSubastasProps } from './components/ICarruselSubastasProps';

export interface ICarruselSubastasWebPartProps {
  description: string;
}

export default class CarruselSubastasWebPart extends BaseClientSideWebPart<ICarruselSubastasWebPartProps> {

  public onInit(): Promise<void> {
    pnpSetup({
      spfxContext: this.context
    });

    return Promise.resolve();
  }
  public render(): void {
    const element: React.ReactElement<ICarruselSubastasProps> = React.createElement(
      CarruselSubastas,
      {
        description: this.properties.description,
        context: this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }


  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
