import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { setup as pnpSetup } from '@pnp/common';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'ProductosASubastarWebPartStrings';
import ProductosASubastar from './components/ProductosASubastar';
import { IProductosASubastarProps } from './components/IProductosASubastarProps';

export interface IProductosASubastarWebPartProps {
  description: string;
}

export default class ProductosASubastarWebPart extends BaseClientSideWebPart<IProductosASubastarWebPartProps> {

  public onInit(): Promise<void> {
    pnpSetup({
      spfxContext: this.context
    });

    return Promise.resolve();
  }
  public render(): void {
    const element: React.ReactElement<IProductosASubastarProps> = React.createElement(
      ProductosASubastar,
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
