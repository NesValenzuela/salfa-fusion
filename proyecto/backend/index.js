const express = require('express')

const PORT = 4000
const app = express()

app.listen(PORT, () => {
    console.log('server on port 4000')
})

app.get('/', (req, res)=>{
    res.json({message: 'hola mundo' })
})