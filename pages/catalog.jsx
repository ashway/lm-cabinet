import "../scss/style.scss"
import React from "react";
import Header from '../components/header';
import _ from 'lodash';
import Dropzone from 'react-dropzone';
import cookies from 'next-cookies';
import ScrollableAnchor from 'react-scrollable-anchor';
import { goToAnchor, configureAnchors } from 'react-scrollable-anchor';

const apiHost = 'https://api.lux-motor.ru';
const axiosInstance  = require('../axiosInstance');
configureAnchors({offset: -20});

const invertArray = (array) => {
    return _.fromPairs(_.map(array, (value, index) => [value, index+1]));
};

class CatalogPage extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            catalogList: null,
            showAddCarForm: false,
            orderMode: false,
            files: [],
            loadingPercent: 0,
            formSending: false,
            markSelect: {
                state: false,
                value: ''
            },
            modelSelect: {
                state: false,
                value: ''
            },
            orderedImages: [],

            //-- CarCreateEditForm
            currentCarAlias: null,
            driver: '',
            phone: '',
            price: '',
            outcity_price: '',
            mintime: '',
            active: null,
            photos: [],
            cover: null
        };
    }

    static async getInitialProps (ctx) {
        const { authToken } = cookies(ctx);
        let axios = axiosInstance(authToken);
        let mark  = await axios.get(`${apiHost}/mark/list`);
        let model  = await axios.get(`${apiHost}/model/list`);
        return { authToken, markList: mark.data, modelList: model.data };
    }

    stateSelectField = (field, state)=> {
        let selectField = this.state[field];
        selectField.state = (state=='toggle')?!selectField.state:state;
        let newState = {};
        newState[field] = selectField;
        this.setState( newState );
    };

    requestCatalogList = async (alias) => {
        let axios = axiosInstance(this.props.authToken);
       let res = await axios.get(`${apiHost}/car/list/${alias}`);
       return res.data;
    };

    selectFieldSetCurrent = async (field, value)=> {
        let selectField = this.state[field];
        selectField.value = value;
        selectField.state = false;
        let newState = {};
        newState[field] = selectField;

        if(field=='markSelect') {
            this.clearSelect('modelSelect');
            this.setState({ catalogList: null });
        }

        //--Подгружаем Каталог
        if(field==='modelSelect')  {
            let catalogList = await this.requestCatalogList(value);
            this.clearAddCarForm();
            this.setState({ showAddCarForm: false });
            newState.catalogList = catalogList;
        }
        this.setState( newState );
    };

    toggleShowForm = (form)=> {
        let newState = {};
        newState[form] = !this.state[form];
        this.setState(newState, ()=>{
            if(form=='showAddCarForm') this.clearAddCarForm();
        });
    };

    clearAddCarForm = (notfull) => {
        let data = {
            currentCarAlias: null,
            driver: '',
            phone: '',
            price: '',
            outcity_price: '',
            loadingPercent: 0,
            formSending: false,
            mintime: '',
            active: null,
            photos: [],
            files: [],
            cover: null,
            orderMode: false,
            orderedImages: []
        };
        if(notfull) delete data.currentCarAlias;
        this.setState(data);
    };

    handleFormField = (e, field) => {
        let newState = {};
        newState[field] = e.target.value;
        this.setState(newState);
    };

    clearSelect = (field) => {
        let selectField = this.state[field];
        selectField.value = null;
        selectField.state = false;
        let newState = {};
        newState[field] = selectField;
        newState.showAddCarForm = false;
        this.setState( newState );
        this.clearAddCarForm();
        if(field=='markSelect') {
            this.clearSelect('modelSelect');
            this.setState({ catalogList: null });
        }
    };

    onDropHandle = (acceptedFiles) => {
        this.setState({hasNoImages: false, files:  _.concat(this.state.files, acceptedFiles.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            })))});
    };

    removeFileHandle = (e, index) => {
        e.stopPropagation();
        let files = this.state.files;
        files.splice(index, 1);
        this.setState({ files });
    };

    deleteCar = async (alias) => {
        let axios = axiosInstance(this.props.authToken);
        let catalogList = this.state.catalogList;
        let index = _.findIndex(catalogList, i=>i.alias==alias);
        if(index>=0) {
            await axios.get(`${apiHost}/car/delete/${alias}`);
            catalogList.splice(index, 1);
            this.setState( { catalogList });
        }
    };

    closeCarForm = async () => {
        let carInfo = await this.getCarInfo(this.state.currentCarAlias);
        if(carInfo) {
            let catalogList = this.state.catalogList;
            let index = _.findIndex(catalogList, i=>i.alias==carInfo.alias);
            if(index>=0) {
                catalogList.splice(index, 1, carInfo);
                this.setState({ catalogList });
            }
        }
        this.clearAddCarForm();
        this.setState({ showAddCarForm: false })
    };

    editCar = (car) => {
        this.setState({
            currentCarAlias: car.alias,
            driver: car.driver || '',
            phone: car.phone || '',
            price: car.price || '',
            outcity_price: car.outcity_price || '',
            mintime: car.mintime || '',
            active: car.active || 0,
            photos: car.photos || [],
            cover: car.cover || '',
            loadingPercent: 0,
            formSending: false,
            showAddCarForm: true
        }, ()=>goToAnchor('carForm', false));
    };

    setCover = (e, file) => {
        e.stopPropagation();
        this.setState({ cover: file });
    };

    removePhotoHandle = (e, file) => {
        e.stopPropagation();
        let photos = this.state.photos;
        let index = _.findIndex(photos, p=>p==file);
        if(index>=0) photos.splice(index, 1);
        let cover = this.state.cover;
        if(cover==file) cover = photos[0];
        this.setState({ photos, cover });
    };

    getCarInfo = async (alias)=> {
        let axios = axiosInstance(this.props.authToken);
        let carInfo = await axios.get(`${apiHost}/car/get/${alias}`);
        return carInfo.data;
    };

    formSend = async () => {
        let axios = axiosInstance(this.props.authToken);
        let formData = new FormData();
        formData.append("model", this.state.modelSelect.value);
        formData.append("driver", this.state.driver || '');
        formData.append("phone", this.state.phone || '');
        formData.append("price", this.state.price || '');
        formData.append("outcity_price", this.state.outcity_price || '');
        formData.append("mintime", this.state.mintime || '');
        formData.append("active", this.state.active || 0);
        formData.append("photos", this.state.photos || '');
        formData.append("cover", this.state.cover || '');
        if(this.state.files && this.state.files.length>0) _.forEach(this.state.files, file=>formData.append("files", file, file.name));
        this.setState({ formSending: true });
        let url = (this.state.currentCarAlias)?`${apiHost}/car/update/${this.state.currentCarAlias}`:`${apiHost}/car/add`;
        let res = await axios.post(url, formData, {
            onUploadProgress: (progressEvent) => {
                let loadingPercent = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
                this.setState({ loadingPercent: loadingPercent, formSending: loadingPercent<100 });
            }
        });


        let carInfo = await this.getCarInfo(res.data);

        if(carInfo) {
            let catalogList = this.state.catalogList;
            let index = _.findIndex(catalogList, i=>i.alias==carInfo.alias);
            if(index>=0) catalogList.splice(index, 1, carInfo);
            else catalogList.push(carInfo);
            this.setState({ catalogList });
        }
        this.clearAddCarForm();
        this.setState({ showAddCarForm: false });
    };

    toggleActive = async (car)=> {
        let axios = axiosInstance(this.props.authToken);
        let catalogList = this.state.catalogList;
        car.active = (car.active)?0:1;
        let index = _.findIndex(catalogList, i=>i.alias==car.alias);
        if(index>=0) catalogList.splice(index, 1, car);

        catalogList = _.orderBy(catalogList, ['active', 'alias'], ['desc', 'asc']);
        await axios.get(`${apiHost}/car/status/${car.alias}/${car.active}`);
        this.setState({ catalogList });
    };

    arrangePhotos = (index, direction) => {
        let photos = this.state.photos;
    };

    setOrderMode = (state) => {
        this.setState({ orderMode: state, orderedImages: [] });
    };

    setNextOrder = (img) => {
        let orderedImages = this.state.orderedImages;
        orderedImages.push(img);
        this.setState({ orderedImages });
    };

    resetOrderImage = () => {
        this.setState({ orderedImages: [] });
    };

    saveImageOrder = () => {
        this.setState({ photos: this.state.orderedImages, orderedImages: [], orderMode: false });
    };

    moveOrderIndex = () => {
        let orderedImages = this.state.orderedImages;
        orderedImages.push(this.state.photos[this.state.orderedImages.length]);
        this.setState({ orderedImages });
    };

    render() {

        let markListObj = _.keyBy(this.props.markList, 'alias');
        let modelListObj = _.keyBy(this.props.modelList, 'alias');


        let currentModelName;
        if(this.state.modelSelect.value && modelListObj[this.state.modelSelect.value]) {
            currentModelName = `${markListObj[modelListObj[this.state.modelSelect.value].mark].name} ${modelListObj[this.state.modelSelect.value].name}`;
        }

        return (
            <div className="content">
                <Header page="catalog"/>

                <div className="model-nest-selector mb20">

                        <div className={`w100 form-select ${(this.state.markSelect.state)?'opened':''}`}>
                            <div onClick={()=>this.stateSelectField('markSelect', 'toggle')}>{(markListObj[this.state.markSelect.value]||{}).name || 'Выберите марку'}</div>
                            {(this.state.markSelect.value)?<div className="clear-icon" onClick={(e)=>{ e.stopPropagation(); this.clearSelect('markSelect'); }}/>:null}
                            <div>
                                {_.map(this.props.markList, i=><div key={i.alias} onClick={()=>this.selectFieldSetCurrent('markSelect', i.alias)}>{i.name}</div>)}
                            </div>
                        </div>

                    {(this.state.markSelect.value)?<div className={`w100 form-select ${(this.state.modelSelect.state)?'opened':''}`}>
                            <div onClick={(e)=>{this.stateSelectField('modelSelect', 'toggle');}}>{currentModelName || 'Выберите модель'}</div>
                            <div>
                                {_.map((this.state.markSelect.value)?_.filter(this.props.modelList, i=>i.mark===this.state.markSelect.value):this.props.modelList, i=><div key={i.alias} onClick={()=>this.selectFieldSetCurrent('modelSelect', i.alias)}>{`${markListObj[i.mark].name} ${i.name}`}</div>)}
                            </div>
                        </div>:null}

                </div>

                <ScrollableAnchor id={'carForm'}>
                    <div>
                    {(this.state.modelSelect.value)?<div className="flex-block fb-vcenter pos-left mb20 mr20"><div className="h1">{currentModelName}</div><div className="button" onClick={()=>this.toggleShowForm('showAddCarForm')}>+</div></div>:null}

                    {(this.state.showAddCarForm)?<div className="add-car-form mb20">
                        <div>
                            <div>
                                <div>
                                    <div>ФИО водителя</div>
                                    <div><input className="text-field full" onChange={(e)=>this.handleFormField(e, 'driver')} value={this.state.driver}/></div>
                                </div>
                                <div>
                                    <div>Телефон водителя</div>
                                    <div><input className="text-field full" onChange={(e)=>this.handleFormField(e, 'phone')} value={this.state.phone}/></div>
                                </div>
                                <div>
                                    <div>Цена в час</div>
                                    <div><input className="text-field full" onChange={(e)=>this.handleFormField(e, 'price')} placeholder="Базовая" value={this.state.price}/></div>
                                </div>
                                <div>
                                    <div>Цена за км, загород</div>
                                    <div><input className="text-field full" onChange={(e)=>this.handleFormField(e, 'outcity_price')} placeholder="Базовая" value={this.state.outcity_price}/></div>
                                </div>
                                <div>
                                    <div>Минимальное время заказа</div>
                                    <div><input className="text-field full" onChange={(e)=>this.handleFormField(e, 'mintime')} placeholder="Базовая" value={this.state.mintime}/></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex-block fb-vcenter space-between">
                                    <div className="h2 full">Фотографии автомобиля</div>
                                    {(!this.state.orderMode)?<div className="flex-block action-bar">
                                        <div className="icomoon" onClick={()=>this.setOrderMode(true)}>&#xea45;</div>
                                    </div>:null}
                                    {(this.state.orderMode)?<div className="flex-block action-bar">
                                        <div className="o" onClick={()=>this.moveOrderIndex()}>{this.state.orderedImages.length+1}</div>
                                        <div className="icomoon reset" onClick={()=>this.resetOrderImage()}>&#xe965;</div>
                                        <div className={`icomoon ok ${(this.state.orderedImages.length!=this.state.photos.length)?'disabled':''}`} onClick={()=>this.saveImageOrder()}>&#xea10;</div>
                                        <div onClick={()=>this.setOrderMode(false)} className="icomoon cancel">&#xea0f;</div>
                                    </div>:null}
                                </div>
                                <div className="file-list">
                                    {_.map(this.state.photos, (file, index) => (
                                        <div key={file} onClick={(e)=>{(this.state.orderMode)?this.setNextOrder(file):this.setCover(e, file)}}>
                                            <div className={`${(this.state.orderMode)?`order-on ${(invertArray(this.state.orderedImages)[file])?'ordered':''}`:''}`} style={{backgroundImage: `url(https://img.lux-motor.ru/car/${this.state.currentCarAlias}/${file}.jpg)`}}>
                                                {(this.state.cover==file)?<div className="cpl-active"/>:null}
                                                {(!this.state.orderMode)?<div className="cpl-remove" onClick={(e)=>this.removePhotoHandle(e, file)} />:null}
                                                <div className="cpl-orderNum">{(invertArray(this.state.orderedImages)[file])?invertArray(this.state.orderedImages)[file]:this.state.orderedImages.length+1}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="container car-photos-loader">
                                    <Dropzone onDrop={this.onDropHandle}>
                                        {({getRootProps, getInputProps}) => (
                                            <div {...getRootProps()}>
                                                <input {...getInputProps()} />
                                                <p>Перетащите в эту область фотографии или кликните по этому полю, чтобы открыть окно выбора.</p>
                                                {(this.state.files.length>0)?<div className="file-list">
                                                    {_.map(this.state.files, (file, index) => (
                                                        <div key={file.name}  onClick={(e)=>this.setCover(e, file.name)}>
                                                            <div style={{backgroundImage: `url(${file.preview})`}}>
                                                                {(this.state.cover==file.name)?<div className="cpl-active"/>:null}
                                                                <div className="cpl-remove" onClick={(e)=>this.removeFileHandle(e, index)} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>:null}
                                            </div>)}
                                    </Dropzone>
                                </div>
                            </div>
                        </div>
                        <div className="flex-block fb-vcenter pos-right mt20">
                            <div className="icomoon action-button cancel" onClick={()=>this.clearAddCarForm(true)}>&#xea72;</div>
                            <div className="button gray hide-mobile" onClick={()=>this.closeCarForm()}>Закрыть</div>
                            <div className="icomoon action-button gray show-mobile" onClick={()=>this.closeCarForm()}>&#xea0f;</div>
                            {(this.state.loadingPercent==100)?<div className="small-font">Данные сохранены</div>:null}
                            {(!this.state.formSending)?<div className={`button ${this.state.orderedImages.length>0?'gray disabled':''}`} onClick={()=>this.formSend()}>{(this.state.currentCarAlias)?'Сохранить':'Добавить'}</div>:
                            <div className="loading-process">
                                <div className="small-font">Загружаю фотографии и отправляю данные</div>
                                <div><div style={{ width: `${this.state.loadingPercent}%`}}/></div>
                            </div>}
                        </div>
                    </div>:null}
                    </div>
                </ScrollableAnchor>

                {(this.state.catalogList)?<div className="car-list">
                    {_.map(this.state.catalogList, i=><div key={i.alias} onClick={()=>this.editCar(i)}>
                        <div style={{backgroundImage: `url(https://img.lux-motor.ru/${(i.cover)?`car/${i.alias}/${i.cover}.jpg)`:'noimage.png'}`}}/>
                        <div className="actions"><div className={`${(i.active)?'active':'disabled'}`} onClick={(e)=>{e.stopPropagation(); this.toggleActive(i)}}/><div className="icomoon delete" onClick={(e)=>{ e.stopPropagation(); this.deleteCar(i.alias); }}>&#xe9ac;</div></div>
                        <div>
                            <div>
                                <div>
                                    <div>{i.driver}</div>
                                    <div className="h1 mt5">{i.phone}</div>
                                </div>
                                <div>
                                    <div>{i.price || modelListObj[i.model].price} руб.</div>
                                    <div>{i.outcity_price || modelListObj[i.model].outcity_price} руб/км</div>
                                    <div>{i.mintime || modelListObj[i.model].mintime} часа</div>
                                </div>
                            </div>
                        </div>
                    </div>)}
                </div>:null}
            </div>
        )
    }
}

export default CatalogPage;

