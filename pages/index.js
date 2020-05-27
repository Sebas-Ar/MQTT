import React, { useState, useEffect } from 'react'
import { Line, defaults } from "react-chartjs-2";
import mqtt from "mqtt";
import Head from 'next/head'
import axios from "axios";

const Home = (props) => {

  const [top, setTop] = useState('nada');
  const [topicos, setTopicos] = useState(props.data);
  const [chartData, setChartData] = useState({});
  const [active, setactive] = useState(true);

  const options = {
    connectTimeout: 4000,
    clientId: 'cliente' + new Date().getUTCMilliseconds(),
    keepalive: 60,
    clean: true
  }

  useEffect(() => {
    /* console.log(active ? 'activo' : 'desactivo') */
    const client = mqtt.connect('ws://18.191.153.104:8083/mqtt', options)

    
      client.on('connect', () => {
          client.subscribe('GPIO', function (err) {
            if (err) {
              console.log('error al conectar al topic')
            }
          })
      })
  
      client.on('message', (topic, message) => {
        setTop(message.toString())
        /* if (!active) {
          console.log('intentado desconectar')
          client.end(true)
        } */
      })

  }, [/* active */]);


  useEffect(() => {

    console.log(top)

    let array = topicos

    for (let i = array.length - 1; i >= 0; i--) {
      if(i !== 0) {
        array[i] = array[i-1]
      } else {
        if (!isNaN(parseFloat(top))) {
          array[i] = parseFloat(top)
        }
      }
    }
    setTopicos(array)

    setChartData({
      labels: ['0s', '1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', '11s', '12s', '13s', '14s', '15s', '16s', '17s', '18s', '19s'],
      datasets: [
        {
          label: 'Distancia [cm]',
          data: array,
          backgroundColor: ['rgba(75, 192, 192, 0.6)'],
          borderWidth: 4,
        }
      ]
    })

    defaults.global.animation = false;

  }, [top]);

  const handleMongo = async () => {
    setactive(!active)
    const url = '/api/mqtt'
    const res = await axios.post(url, { active })
    console.log(res)
  }

  return <div className="content">
    <Head>
      <title>{top}</title>
      <link rel="icon" href="/favicon.ico" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.min.js" type="text/javascript"> </script>
    </Head>

    <button onClick={handleMongo}>Activar</button>

    <div className="line">
      <Line data={chartData} redraw={true} options={{
        scales: {
          yAxes: [{
            ticks: {
              max: 100,
              min: 0,
              stepSize: 5
            }
          }]
        },
        maintainAspectRatio: false
        }}/>
    </div>

    

    <style jsx>{`

      .line {
        width: 80%;
        height: 80%;
      }

      :global(*) {
        margin: 0;
        padding: 0;
      }

      .content {
        height: 100vh;
        width: 100%;
        
        display: grid; 
        align-items: center;
        justify-items: center;

        grid-template-rows: 100px 1fr;
      }  

      button {
        border: none;
        padding: 10px 20px;
        color: white;
        background: rgba(75, 192, 192, 0.6);
        border-radius: 20px;
        outline: none;
        cursor: pointer;
        transition: background .5s;
      }

      button:hover {
        background: rgba(75, 192, 192);
      }
      
    `}</style>
  </div>
}

export default Home

export const getServerSideProps = async () => {
  const url = 'http://localhost:3000/api/sensor'
  const res = await axios.get(url)


  let sensorData = res.data.response.slice(0, 20)
  let distancia = []

  for (const dat of sensorData) {
    distancia.push(parseFloat(dat.distancia))
  }


  return { props: { data: distancia } }
}
