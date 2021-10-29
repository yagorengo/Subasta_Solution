import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { setup as pnpSetup } from '@pnp/common';

import * as strings from 'AperturaDeSobresWebPartStrings';
import AperturaDeSobres from './components/AperturaDeSobres';
import { IAperturaDeSobresProps } from './components/IAperturaDeSobresProps';

export interface IAperturaDeSobresWebPartProps {
  description: string;
}

export default class AperturaDeSobresWebPart extends BaseClientSideWebPart<IAperturaDeSobresWebPartProps> {
  public onInit(): Promise<void> {
    pnpSetup({
      spfxContext: this.context
    });

    return Promise.resolve();
  }

  
  public render(): void {
    const element: React.ReactElement<IAperturaDeSobresProps> = React.createElement(
      AperturaDeSobres,
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
