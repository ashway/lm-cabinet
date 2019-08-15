const axiosBase = require('axios');
const _  = require('lodash');

module.exports = (userToken) => {
    let adapter = axiosBase;
    if(userToken) {
        adapter = axiosBase.create({
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
    }
    return adapter;
};