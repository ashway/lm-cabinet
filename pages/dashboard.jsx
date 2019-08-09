import Link from 'next/link';
import "../scss/style.scss"
import React from "react";
import Header from '../components/header';

class IndexPage extends React.Component {

    render() {
        return (
            <div className="content">
                <Header />
            </div>
        )
    }
}

export default IndexPage;

