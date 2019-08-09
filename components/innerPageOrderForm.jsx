import "../scss/style.scss"
import axios from "axios";
import React from "react";
import InputMask from 'react-input-mask';

class RequestFormInner extends React.Component {

    state = {
        fio: '',
        phone: '',
        fioHasError: false,
        phoneHasError: false,
        isSent: false,
        sending: false
    };

    handleChange(e, field) {
        let currentState = this.state;
        currentState[field] = e.target.value;
        this.setState(currentState);
        if(field=='fio' && this.state.fioHasError) this.setState({ fioHasError: false});
        if(field=='phone' && this.state.phoneHasError) this.setState({ phoneHasError: false});
    }

    async sendRequest() {
        if(!this.state.fio) this.setState({ fioHasError: true });
        if(!this.state.phone) this.setState({ phoneHasError: true });

        if(this.state.fio && this.state.phone) {
            this.setState({sending: true });
            await axios.post(`/api/sendRequest`, { fio: this.state.fio, phone: this.state.phone });
            this.setState({ isSent: true });
        }
    }

    render() {
    return (
        <div className={(this.props.type=='index-page')?'request-call-form show-from-tablet':`inner-page-request-call-form`}>
            <div className={`h-form ${(this.state.isSent)?'hide':''}`}>
                <div className="h2" style={{ textAlign: `left`}}>Заказать автомобиль</div>
                <div className="h-fields">
                    <div><input className={`fio-field text-field w100 ${(this.state.fioHasError)?'has-error':''}`} onChange={(e)=>this.handleChange(e, 'fio')} placeholder="ФИО" value={this.state.fio} maxLength="40" /></div>
                    <div><InputMask className={`phone-field text-field w100 ${(this.state.phoneHasError)?'has-error':''}`} {...this.props} mask="+7(999) 999 99 99" placeholder="Номер телефона" maskChar=" " onChange={(e)=>this.handleChange(e, 'phone')} placeholder="Контактный телефон"  value={this.state.phone}/></div>
                    <div><div className={`sendMailButton button ${(this.state.sending)?'processing':''}`} onClick={()=>this.sendRequest()} style={{ whiteSpace: `nowrap`}}>{(this.state.sending)?'Отправляю':'Оставить заявку'}</div></div>
                </div>
            </div>

            <div className={`form-message h3 ${(this.state.isSent)?'show':''}`}>
                <div>
                    <div className="h1 mb10">Спасибо!</div>
                    <div className="h2">В ближайшее время мы свяжемся с Вами.</div>
                </div>
            </div>
        </div>
        )
    }
}

export default RequestFormInner;