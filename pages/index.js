import React, { useState, useEffect } from 'react'
import { Line, defaults } from "react-chartjs-2";
import mqtt from "mqtt";
import Head from 'next/head'
import axios from "axios";

const Home = () => {

  const [top, setTop] = useState('');
  const [topicos, setTopicos] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [chartData, setChartData] = useState({});
  const [active, setactive] = useState(true);

  const options = {
    connectTimeout: 4000,
    clientId: 'cliente' + new Date().getUTCMilliseconds(),
    keepalive: 60,
    clean: true
  }

  useEffect(() => {
    
    const client = mqtt.connect('ws://3.17.147.59:8083/mqtt', options)

    client.on('connect', () => {
      client.subscribe('GPIO', function (err) {
        if (err) {
          console.log('error al conectar al topic')
        }
      })
    })

    client.on('message', function (topic, message) {
      setTop(message.toString())
    })

  }, []);

/*   useEffect(() => {
    var hostname = "3.17.147.59";
    var port = 8084;
    var clientId = "mqttjs_66d6f8e622";
    clientId += new Date().getUTCMilliseconds();
    var username = "admin";
    var password = "public";
    var subscription = "GPIO";
    var displayClass;

    var mqttClient = new Paho.MQTT.Client(hostname, port, clientId);
    mqttClient.onMessageArrived = MessageArrived;
    mqttClient.onConnectionLost = ConnectionLost;
    Connect();

    function Connect() {
      mqttClient.connect({
        onSuccess: Connected,
        onFailure: ConnectionFailed,
        keepAliveInterval: 10,
        userName: username,
        useSSL: true,
        password: password
      });
    }

    function Connected() {
      console.log("Connected");
      mqttClient.subscribe(subscription);
    }

    function ConnectionFailed(res) {
      console.log("Connect failed:" + res.errorMessage);
    }

    function ConnectionLost(res) {
      if (res.errorCode !== 0) {
        console.log("Connection lost:" + res.errorMessage);
        Connect();
      }
    }


    function MessageArrived(message) {

      setTop(message.payloadString);
      
      var topic = message.destinationName.split("/");
      if (topic.length == 3) {
        var ioname = topic[1];
        UpdateElement(ioname, displayClass);
      }
    }
  }, []); */

  useEffect(() => {

    let array = topicos

    for (let i = array.length - 1; i >= 0; i--) {
      if(i !== 0) {
        array[i] = array[i-1]
      } else {
        if (isNaN(parseFloat(top))) {
          array[i] = 0
        } else {
          array[i] = parseFloat(top)
        }
      }
    }
    setTopicos(array)

    setChartData({
      labels: ['5s', '10s', '15s', '20s', '25s', '30s', '35s', '40s', '45s', '50s', '55s', '60s', '65s', '70s', '75s', '80s', '85s', '90s', '95s', '100s'],
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
