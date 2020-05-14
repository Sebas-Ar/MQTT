import { MongoClient } from "mongodb";

export default async (req, res) => {

    const url = 'mongodb://localhost/mqtt-database'

    const client = new MongoClient(url, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })

    let data

    const coneccion = await client.connect()
    data = await client.db('mqtt-database').collection('GPIO').find().toArray()

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ response: data.reverse()}))


}