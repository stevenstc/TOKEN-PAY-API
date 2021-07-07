const express = require('express')
const bodyParser = require("body-parser");

const fetch = require('node-fetch');

var TronWeb = require('tronweb');

const app = express();
const port = process.env.PORT || 3003;
const token = process.env.APP_MT;
const owner = process.env.APP_OWNER || "TB7RTxBPY4eMvKjceXj8SWjVnZCrWr4XvF";

const tokenTRC20 = process.env.APP_TRC20 || "TDDkSxfkN5DbqXK3tHSZFXRMcT9aS6m9qz";
const pool = process.env.APP_POOL || "TMSRvNWKUTvMBaTPFGStWVNtRUQJD72skU";

const TRONGRID_API = process.env.APP_API || "https://api.trongrid.io";

let network = "shasta";

if (TRONGRID_API == "https://api.shasta.trongrid.io") {

  console.log("Esta api esta conectada en la red de pruebas para pasar a la red principal por favor establezaca la variable de entorno APP_API = https://api.trongrid.io en el archivo .env");

}else{
  network = "trongrid";
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


async function precioToken() {

    let consulta = await fetch('https://api.just.network/swap/scan/statusinfo?exchangeAddress='+pool)
    .catch(error =>{console.error(error)})
    var json = await consulta.json();

    var contractSITE = await tronWeb.contract().at(tokenTRC20);

    var balanceSITE = await contractSITE.balanceOf(pool).call();

    balanceSITE = balanceSITE/100000000;

    var balanceTRX = await tronWeb.trx.getBalance(pool);

    balanceTRX = balanceTRX/1000000;

    return (balanceTRX/balanceSITE)*json.data.trxPrice;
}

async function precioTRX() {

    let consulta = await fetch('https://api.just.network/swap/scan/statusinfo?exchangeAddress='+pool)
    .catch(error =>{console.error(error)})
    var json = await consulta.json();

    return json.data.trxPrice;
}


app.get('/', async(req,res) => {

    res.send("Conectado TRON-PAY-API Exitodamente!");


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

    var precio = trxPrice*saldo;

    precio = precio.toFixed(2);
    precio = parseFloat(precio);

    respuesta.network = network;
    respuesta.data = {

      time: Date.now(),
      address: cuenta,
      balance:{
        tron:saldo
      },
      valueUsd: precio,
      trxPrice: trxPrice

    }
    res.status(200).send(respuesta);

});

app.post('/generar/wallet', async(req,res) => {

    let token2 = req.body.token;
    let respuesta = {};

    if ( token == token2 ) {

      let cuenta = await tronWeb.createAccount();

        respuesta.status = "200";
        respuesta.network = network;
        respuesta.data = {
            time: Date.now(),
            address: cuenta.address.base58,
            privateKey: cuenta.privateKey
          };

        res.send(respuesta);

    }else{
        respuesta.txt = "No autorizado";
        res.send(respuesta);
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
          id: id
        };

        res.send(respuesta);

    }else{
        respuesta.txt = "No autorizado";
        if (saldo = 0) {
          respuesta.txt = "No hay saldo para enviar";
        }
        res.send(respuesta);
    }


});

app.listen(port, ()=> console.log('Escuchando Puerto: ' + port))
