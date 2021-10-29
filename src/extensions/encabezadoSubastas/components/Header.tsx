import * as React from 'react';
import styles from './Header.module.scss';
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';
import { IButtonProps } from '@fluentui/react/lib/Button';

export interface IHeaderProps {
    context: ApplicationCustomizerContext;
    isUserAdmin: boolean;
}

export class Header extends React.Component<IHeaderProps, {}> {
    constructor(props: IHeaderProps) {
        super(props);
        this.state = {
            items: null
        };
    }

    
    private _items:ICommandBarItemProps[] =[
        {
            key: 'products',
            text: 'Productos a subastar',
            iconProps: { iconName: 'Car' },
            href:"https://claroaup.sharepoint.com/sites/SubastasAUP/SitePages/Productos.aspx"
          },
          {
            key: 'terms',
            text: 'Términos y condiciones',
            iconProps: { iconName: 'AccountActivity' },
            href: 'https://claroaup.sharepoint.com/sites/SubastasAUP/SitePages/T%C3%A9rminos-y-condiciones.aspx',
          }
    ] 
    private  _itemsAdmin: ICommandBarItemProps[] = [
        {
          key: 'products',
          text: 'Productos a subastar',
          iconProps: { iconName: 'Car' },
          href:"https://claroaup.sharepoint.com/sites/SubastasAUP/SitePages/Productos.aspx"
        },
        {
          key: 'terms',
          text: 'Términos y condiciones',
          iconProps: { iconName: 'AccountActivity' },
          href: 'https://claroaup.sharepoint.com/sites/SubastasAUP/SitePages/T%C3%A9rminos-y-condiciones.aspx',
        },
        {
            key: 'offer',
            text: 'Ofertas de subasta',
            iconProps: { iconName: 'DecisionSolid' },
            href: "https://claroaup.sharepoint.com/sites/SubastasAUP/SitePages/Ofertas-de-subasta-activa.aspx"
          }
      ];

     

    public render(): React.ReactElement<IHeaderProps> {
     let items = this.props.isUserAdmin? this._itemsAdmin:this._items
        return (
            <div className={styles.app}>
                <CommandBar
                    items={items}
                />
            </div>
        );
    }
}