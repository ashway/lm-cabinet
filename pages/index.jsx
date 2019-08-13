import Link from 'next/link';
import "../scss/style.scss"
import React from "react";

class IndexPage extends React.Component {

    render() {
        return (
            <div className="login-form">
                <div>
                    <div className="flex-block space-between mb20"><span className="ml10 h1 blue bold">Кабинет</span><span>Lux-motor</span></div>
                    <div><input type="text" className="text-field" placeholder="Логин"/></div>
                    <div><input type="password" className="text-field" placeholder="Пароль"/></div>
                    <div className="taright mt20"><Link href="/catalog"><a className="button">Войти</a></Link></div>
                </div>
            </div>
        )
    }
}

export default IndexPage;

