import React, { useState, useEffect } from 'react'
import Head from 'next/head'

const Home = () => {

  const [top, setTop] = useState('');


  useEffect(() => {
    var hostname = "tailor.cloudmqtt.com";
    var port = 30432;
    var clientId = "webio4mqttexample";
    clientId += new Date().getUTCMilliseconds();;
    var username = "giptqpdu";
    var password = "1axnvdwpNP-d";
    var subscription = "output";
    var displayClass;

    var mqttClient = new Paho.MQTT.Client(hostname, port, clientId);
    mqttClient.onMessageArrived = MessageArrived;
    mqttClient.onConnectionLost = ConnectionLost;
    Connect();

    /*Initiates a connection to the MQTT broker*/
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

    /*Callback for successful MQTT connection */
    function Connected() {
      console.log("Connected");
      mqttClient.subscribe(subscription);
    }

    /*Callback for failed connection*/
    function ConnectionFailed(res) {
      console.log("Connect failed:" + res.errorMessage);
    }

    /*Callback for lost connection*/
    function ConnectionLost(res) {
      if (res.errorCode !== 0) {
        console.log("Connection lost:" + res.errorMessage);
        Connect();
      }
    }


    /*Callback for incoming message processing */
    function MessageArrived(message) {
      setTop(message.destinationName + " : " + message.payloadString);
      switch (message.payloadString) {
        case "ON":
          displayClass = "on";
          break;
        case "OFF":
          displayClass = "off";
          break;
        default:
          displayClass = "unknown";
      }
      var topic = message.destinationName.split("/");
      if (topic.length == 3) {
        var ioname = topic[1];
        UpdateElement(ioname, displayClass);
      }
    }
  }, []);

  return <div className="content">
    <Head>
      <title>{top}</title>
      <link rel="icon" href="/favicon.ico" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.min.js" type="text/javascript"> </script>
    </Head>

    <h1>{top}</h1>

    <style jsx>{`

      :global(*) {
        margin: 0;
        padding: 0;
      }

      .content {
        height: 100vh;
        width: 100%;
        background: linear-gradient(to top, #141e30, #243b55);
        display: grid; 
        align-items: center;
        justify-items: center;
      }  

      h1 {
        color: white;
      }
      
    `}</style>
  </div>
}

export default Home
