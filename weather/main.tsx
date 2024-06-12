import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import Map from "./node_modules/react-map-gl/dist/es5/exports-maplibre";

let inputval = 0;
function onMapChange() {}

let lat: number, lng: number;

function App() {
  const [mytemp, setTemp] = useState(0);
  const [mycountry, setCountry] = useState("undefined");
  const [mycity, setCity] = useState("undefined");
  const [mydate, setDate] = useState("undefined");

  function onMapClick(e: any) {
    let url = `https://api.openweathermap.org/data/2.5/forecast?lat=${e.lngLat.lat}&lon=${e.lngLat.lng}&units=metric&appid=7185f8466d8d0f2977ed26d7bdcab055`;
    let url1 = `https://api.openweathermap.org/data/2.5/weather?lat=${e.lngLat.lat}&lon=${e.lngLat.lng}&units=metric&appid=7185f8466d8d0f2977ed26d7bdcab055`;

    lat = e.lngLat.lat;
    lng = e.lngLat.lng;
    const a = document.getElementById("scroll") as HTMLInputElement;
    let b = a.value;

    fetch(url).then((mydata) => {
      // console.log("zashlo");
      mydata.text().then((txt) => {
        let text = JSON.parse(txt);
        console.log(b);
        inputval = Number(b);
        console.log(text);
        setCountry(text.city.country);
        // console.log(text.city);
        setCity(text.city.name);
        setTemp(text.list[b].main.temp);
        setDate(text.list[b].dt_txt);
      });
    });
  }

  return (
    <div>
      <Map
        onClick={onMapClick}
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 1,
        }}
        style={{ width: 1200, height: 450 }}
        mapStyle="https://api.maptiler.com/maps/openstreetmap/style.json?key=gHEk1ahGnKcGpVg5vq6z"
      />
      <br />
      <br />
      <br />
      <p>Country: {mycountry}</p>
      <p>City: {mycity}</p>
      <p>Temperature: {mytemp}</p>
      <p>Date: {mydate}</p>
    </div>
  );
}

/*
useEffect(() => {
    ...
})

function TextComp() {
    const textElement = document.getElementById(
        "myarea"
      ) as HTMLTextAreaElement;
 
    const [myLink, setmyLink] = useState(
        `ttps://github.com/search?q=sum2024&type=repositories`
      );
    
   const myClick = () => {
    console.log(textElement.value);
     setmyLink(
       `https://github.com/search?q=${textElement.value}&type=repositories`
     );
   };
   // fetch(`https://api.github.com/users/schacon/repos
   // `);
   fetch(`https://api.github.com/search/repositories?q=octokit`).then(
     (mydata) => {
       mydata.text().then((txt) => {
         let text = JSON.parse(txt);
         console.log(txt);
       });
     }
   );
    
  return (<button key="mybutton" onClick={myClick}>Press</button>);
}
*/
async function onLoad() {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render([<App></App>]);
  }
}
window.onload = onLoad;
