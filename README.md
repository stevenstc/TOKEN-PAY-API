# TRON-PAY-API
Una API sencilla para generar wallets de forma segura por medio de Express para recibir pagos


## /consultar/saldo/:wallet a consultar
Metodo GET

response:
```js
{
  status: "200"
  data:{
    time: 1617494748,
    address: "TB7RTxBPY4eMvKjceXj8SWjVnZCrWr4XvF",
    tron: 2500,
    usd: 250
  }
}
```

## /generar/wallet
Metodo POST

input:
```js
data: {
  token: "youtokentxt"
}
```

response
```js
{
  status: "200",
  data:{
    time: 1617494748,
    address: "TBEhx2CjKcr62Zg4PnEm5FQMr2EVrUfXoM",
    privateKey: "Adrdftgyhujikoadwybkhunm09876daw7t6hj899"
  }
}
```

## /trasferir/owner
Metodo POST

input:
```js
data: {
  token: "youtokentxt",
  privateKey: "Adrdftgyhujikoadwybkhunm09876daw7t6hj899"
}
```

response:
```js
{
  status: "200",
  data:{
    time: 1617494748,
    value: 2500,
    from: "TBEhx2CjKcr62Zg4PnEm5FQMr2EVrUfXoM",
    to: "TB7RTxBPY4eMvKjceXj8SWjVnZCrWr4XvF",
    id: "f8f70731df59b4d7d8159df705f0f7289cd2a037187dda043e28c77287b12e11"
  }
}
```
