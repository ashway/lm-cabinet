import Link from 'next/link'
import "../scss/style.scss";
import React from "react";
import _ from 'lodash';

class Header extends React.Component {

    menuList = [
        /*{ alias: 'orders', name: 'Заявки с сайта'},*/
        { alias: 'catalog', name: 'Каталог автомобилей'},
        { alias: 'models', name: 'Модельный ряд'},
        /*{ alias: 'drivers', name: 'Заявки от водителей'},*/
    ];

    render() {
        return <div className="header">
        <div className="h-menu">
            {_.map(this.menuList, item=><Link key={item.alias} href={`/${item.alias}`}><a className={`${(this.props.page===item.alias)?'active':''}`}>{item.name}</a></Link>)}
        </div>
    </div>
    }

}

export default Header;