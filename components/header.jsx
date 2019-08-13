import Link from 'next/link'
import "../scss/style.scss";
import React from "react";
import _ from 'lodash';
import Head from 'next/head';

class Header extends React.Component {

    menuList = [
        /*{ alias: 'orders', name: 'Заявки с сайта'},*/
        { alias: 'catalog', name: 'Каталог автомобилей'},
        { alias: 'models', name: 'Модельный ряд'},
        { alias: 'services', name: 'Услуги'}
    ];

    render() {
        return <div className="header">
            <Head>
                <meta charSet="utf-8" />
                <title>Кабинет Lux-motor</title>
            </Head>
        <div className="h-menu">
            {_.map(this.menuList, item=><Link key={item.alias} href={`/${item.alias}`}><a className={`${(this.props.page===item.alias)?'active':''}`}>{item.name}</a></Link>)}
        </div>
    </div>
    }

}

export default Header;