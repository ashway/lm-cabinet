import "../scss/style.scss"
import React from "react";
import axios from "axios";
import Cookie from 'js-cookie';
const apiHost = 'https://api.lux-motor.ru';

class IndexPage extends React.Component {

    state = {
        login: '',
        password: '',
        hasError: false
    };

    handleFormField = (e, field) => {
        let newState = {};
        newState[field] = e.target.value;
        newState.hasError = false;
        this.setState(newState);
    };

    sendAuth = async ()=> {
        let res = await axios.post(`${apiHost}/auth`, { login: this.state.login, password: this.state.password});
        if(res.data && res.data.error && res.data.error=='noauth') {
            this.setState({ hasError: true });
        } else {
            let token = res.data;
            console.log(token);
            Cookie.set('authToken', token, { expires: 60, path: '/' });
            location.reload();
        }
    };

    render() {
        return (
            <div className={`login-form ${this.state.hasError?'haserror':''}`}>
                <div>
                    <div className="flex-block space-between mb20"><span className="ml10 h1 blue bold">Кабинет</span><span>Lux-motor</span></div>
                    <div><input type="text" className="text-field" onChange={(e)=>this.handleFormField(e, 'login')} value={this.state.login} placeholder="Логин"/></div>
                    <div><input type="password" className="text-field" onChange={(e)=>this.handleFormField(e, 'password')} value={this.state.password} placeholder="Пароль"/></div>
                    <div className="taright mt20"><span className="button" onClick={()=>this.sendAuth()}>Войти</span></div>
                </div>
            </div>
        )
    }
}

export default IndexPage;

