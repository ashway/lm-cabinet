import Link from 'next/link';
import "../scss/style.scss"
import React from "react";

class IndexPage extends React.Component {

    render() {
        return (
            <div className="login-form">
                <Link href="/dashboard"><a className="button">Главная страница</a></Link>
            </div>
        )
    }
}

export default IndexPage;

