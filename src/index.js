const express = require('express')
const bodyParser = require("body-parser");

const fetch = require('node-fetch');
const mongoose = require('mongoose');
var TronWeb = require('tronweb');

const app = express();
const port = process.env.PORT || 3003;

const token = process.env.APP_MT;
const uri = process.env.APP_URI || "mongodb+srv://dbTronPay:sffN0hkxIIjyQ3Gw@cluster0.ztc71.mongodb.net/registro";

const owner = process.env.APP_OWNER || "TB7RTxBPY4eMvKjceXj8SWjVnZCrWr4XvF";

const tokenTRC20 = process.env.APP_TRC20 || "TDDkSxfkN5DbqXK3tHSZFXRMcT9aS6m9qz";
const pool = process.env.APP_POOL || "TMSRvNWKUTvMBaTPFGStWVNtRUQJD72skU";

const TRONGRID_API = process.env.APP_API || "https://api.trongrid.io";

let network;

if (TRONGRID_API == "https://api.trongrid.io") {

  network = "MainNet - Trongrid";
  console.log(TRONGRID_API);

}else{
  network = "TestNet - Shasta";
  console.log("Esta api esta conectada en la red de pruebas para pasar a la red principal por favor establezaca la variable de entorno APP_API = https://api.trongrid.io en el archivo .env");
  console.log(TRONGRID_API);
}


tronWeb = new TronWeb(
  TRONGRID_API,
  TRONGRID_API,
  TRONGRID_API
);

tronWeb.setAddress('TEf72oNbP7AxDHgmb2iFrxE2t1NJaLjTv5');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const options = { useNewUrlParser: true, useUnifiedTopology: true };

mongoose.connect(uri, options).then(
  () => { console.log("Conectado Exitodamente!");},
  err => { console.log(err); }
);

var transaccion = mongoose.model('transaccion', {
    token: String,
    id: Number,
    timeStart: Number,
    address: String,
    privateKey: String,
    value: Number,
    usd: Number,
    pay: Boolean,
    payAt: Number

});


async function precioToken() {

    var trxPrice = await precioTRX();

    var balanceTRC20 = await contractTRC20.balanceOf(pool).call();

    balanceTRC20 = balanceTRC20/100000000;

    var balanceTRX = await tronWeb.trx.getBalance(pool);

    balanceTRX = balanceTRX/1000000;

    return (balanceTRX/balanceTRC20)*trxPrice;
}

async function precioTRX() {

    let consulta = await fetch('https://api.just.network/swap/scan/statusinfo')
    .catch(error =>{console.error(error)})
    var json = await consulta.json();

    return json.data.trxPrice;
}


app.get('/', async(req,res) => {

    res.status(200).send("Conectado TRON-PAY-API Exitodamente!");


});

app.get('/precio', async(req,res) => {

    var Price = await precioToken();

    var response = {
        "ok": true,
        "message": "",
        "data": {
            "price": Price
        }
    }
    res.status(200).send(response);

});

app.get('/consultar/saldo/:direccion', async(req,res) => {

    let cuenta = req.params.direccion;
    let respuesta = {};

    let saldo = await tronWeb.trx.getBalance(cuenta);
    saldo = saldo/1000000;

    var trxPrice = await precioTRX();

    var precioTron = trxPrice*saldo;

    precioTron = precioTron.toFixed(2);
    precioTron = parseFloat(precioTron);

    const contractTRC20 = await tronWeb.contract().at(tokenTRC20);

    var saldoSite = await contractTRC20.balanceOf(cuenta).call();

    saldoSite = saldoSite/100000000;

    var sitePrice = 0.02; //await precioToken();

    var precioSite = saldoSite*sitePrice;

    respuesta.network = network;
    respuesta.data = {

      time: Date.now(),
      address: cuenta,
      balance:{
        tron:saldo,
        site:saldoSite
      },
      valueSiteUsd: precioSite,
      valueTrxUsd: precioTron,
      totalValue: precioSite+precioTron,
      trxPrice: trxPrice,
      sitePrice: sitePrice

    }
    res.status(200).send(respuesta);

});

app.get('/consultar/id/:id', async(req,res) => {

    let id = req.params.id;
    id = parseInt(id);

    usuario = await transaccion.find({ id: id }, {"privateKey":0,"_id":0,"__v":0} );

    res.status(200).send(usuario);

});

app.post('/consultar/id/:id', async(req,res) => {

  let id = req.params.id;
  let token2 = req.body.token;

  if ( token == token2 ) {

    usuario = await transaccion.find({ id: id }, function (err, docs) {});
    usuario = usuario[0];

    res.status(200).send(usuario);
  }else{
    respuesta.txt = "No autorizado";
    res.status(200).send(respuesta);
  }

});

app.post('/consultar/transacciones', async(req,res) => {


  let token2 = req.body.token;

  if ( token == token2 ) {

    usuario = await transaccion.find();

    res.status(200).send(usuario);
  }else{
    respuesta.txt = "No autorizado";
    res.status(200).send(respuesta);
  }

});

app.post('/generar/wallet', async(req,res) => {

    let token2 = req.body.token;
    let usd = req.body.usd;
    let respuesta = {};

    if ( token == token2 ) {

      let cuenta = await tronWeb.createAccount();

        usuario = await transaccion.find({ token: "SITE" }, function (err, docs) {});
        
        respuesta.network = network;
        respuesta.data = {
            id: usuario.length,
            timeStart: Date.now(),
            address: cuenta.address.base58
          };

        var sitePrice = 0.02; //await precioToken();

        var transaccions = new transaccion({
            token: "SITE",
            id: usuario.length,
            timeStart: Date.now(),
            address: cuenta.address.base58,
            privateKey: cuenta.privateKey,
            value: parseFloat(usd)/sitePrice,
            usd: parseFloat(usd),
            priceSite: sitePrice,
            pay: false,
            payAt: 0

        });

        transaccions.save().then(() => {
            respuesta.txt = "transacción creada exitodamente";

            res.status(200).send(respuesta);
        });

    }else{
        respuesta.txt = "No autorizado";
        res.status(200).send(respuesta);
    }


});

app.post('/trasferir/owner', async(req,res) => {

    let token2 = req.body.token;
    let privateKey = req.body.privateKey;
    let respuesta = {};

    let tronCuenta = new TronWeb(
      TRONGRID_API,
      TRONGRID_API,
      TRONGRID_API,
      privateKey
    );

    let saldo = await tronCuenta.trx.getBalance();

    if ( token == token2 && saldo > 0 ) {


        let id = await tronCuenta.trx.sendTransaction(owner, saldo);

        id = id.transaction.txID;


        respuesta.status = "200";
        respuesta.network = network;
        respuesta.data = {
          time: Date.now(),
          tron: saldo/1000000,
          from: tronCuenta.address.base58,
          to: owner,
          txID: id
        };

        res.status(200).send(respuesta);

    }else{
        respuesta.txt = "No autorizado";
        if (saldo = 0) {
          respuesta.txt = "No hay saldo para enviar";
        }
        res.status(200).send(respuesta);
    }


});

app.listen(port, ()=> console.log('Corriendo en http://localhost:' + port))
