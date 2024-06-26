import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import Map from "./node_modules/react-map-gl/dist/es5/exports-maplibre";
import maplibregl from "./node_modules/maplibre-gl/dist/maplibre-gl.js";

let key = '2857565256134dea82685333241506';

let deltalat = 60;
let deltalng = 120;
let sources: string[] = [];
let map: maplibregl.Map;

let dateforweather: string;
let timeforweather: string;

async function loadImage() {
  let thunder = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Weather-rain-thunderstorm.svg/1200px-Weather-rain-thunderstorm.svg.png';
  let snow = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Weather-snow.svg/1200px-Weather-snow.svg.png';
  let sleet = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Antu_weather-snow-rain.svg/1024px-Antu_weather-snow-rain.svg.png';
  let cloud = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Weather-overcast.svg/1200px-Weather-overcast.svg.png';
  let moon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Moon_0063_Nevit.svg/601px-Moon_0063_Nevit.svg.png?20140817210629';
  let sun = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Sun.svg/768px-Sun.svg.png";
  let rain = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/O.rain.png/800px-O.rain.png';

  let image = await map.loadImage(rain);
  let image1 = await map.loadImage(sun);
  let image2 = await map.loadImage(thunder);
  let image3 = await map.loadImage(snow);
  let image4 = await map.loadImage(sleet);
  let image5 = await map.loadImage(cloud);
  let image6 = await map.loadImage(moon);

  map.addImage('rain', image.data);
  map.addImage('sun', image1.data);
  map.addImage('thunder', image2.data);
  map.addImage('snow', image3.data);
  map.addImage('sleet', image4.data);
  map.addImage('cloud', image5.data);
  map.addImage('moon', image6.data);
}

function changeTime() {
  let date = document.getElementById('nowdate') as HTMLInputElement;

  let mydate = new Date(date.value);
  let hour = mydate.getHours();
  let year = mydate.getFullYear();
  let month = mydate.getMonth();
  let day = mydate.getDate();
  let monthstr: string;
  let daystr: string;
  let hourstr: string;

  if (month + 1 <= 9) {
    monthstr = '0' + (month + 1);
  } else {
    monthstr = (month + 1).toString();
  }
  if (day <= 9) {
    daystr = '0' + day;
  } else {
    daystr = day.toString();
  }

  if (hour <= 9) {
    hourstr = '0' + hour;
  } else {
    hourstr = hour.toString();
  }

  dateforweather = year + "-" + monthstr + "-" + daystr;
  timeforweather = dateforweather + ' ' + hourstr + ':00';
}

function createSource(name: string, size: number, i: number, x: number, y: number) {
  map.addSource('maine' + i, {
    'type': 'geojson',
    'data': {
      'type': 'Feature',
      'properties': {},
      'geometry': {
        'type': 'Point',
        'coordinates':
          [x, y]
      }
    }
  });
  map.addLayer({
    'id': 'maine' + i,
    'type': 'symbol',
    'source': 'maine' + i,
    'layout': {
      'icon-image': name,
      'icon-size': size
    },
  });
  sources.push('maine' + i);
}

async function changeWeather() {
  for (let i of sources) {
    map.removeLayer(i)
    map.removeSource(i);
  }
  sources = [];

  // console.log(map.getBounds());
  let i = 0;
  let c = map.getCenter()
  let zoom = map.getZoom() * 3;
  let deltalat1 = (map.getBounds()._ne.lat - map.getBounds()._sw.lat) / numOfLat;
  let razn = map.getBounds()._ne.lng - map.getBounds()._sw.lng;
  if (razn > 360)
    razn = 360;
  let deltalng1 = razn / numOfLng;
  for (let y1 = map.getBounds()._ne.lat - deltalat1 / 2; y1 > map.getBounds()._sw.lat; y1 -= deltalat1) {
    let y = Math.floor(y1 * 10000) / 10000;
    // let y = y1;

    for (let x1 = map.getBounds()._ne.lng - deltalng1 / 2; x1 > map.getBounds()._sw.lng; x1 -= deltalng1) {
      let x = Math.floor(x1 * 10000) / 10000;
      // let x = x1;
      let url2 = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${y},${x}&days=5`;

      fetch(url2).then((mydata) => {
        mydata.text().then((txt) => {
          let text = JSON.parse(txt);
          i++;

          let checkrain = document.getElementById('rain') as HTMLInputElement;
          let checksnow = document.getElementById('snow') as HTMLInputElement;
          let checksleet = document.getElementById('sleet') as HTMLInputElement;
          let checksun = document.getElementById('sun') as HTMLInputElement;
          let checkmoon = document.getElementById('moon') as HTMLInputElement;
          let checkthunder = document.getElementById('thunder') as HTMLInputElement;
          let checkcloud = document.getElementById('cloud') as HTMLInputElement;


          // console.log(text);
          for (let day of text.forecast.forecastday) {
            if (dateforweather == day.date) {
              for (let hour of day.hour) {
                if (timeforweather == hour.time) {
                  if (hour.condition.code == 1063 ||             // rain
                    (hour.condition.code >= 1150 && hour.condition.code <= 1201) ||
                    hour.condition.code == 1240) {
                    if (!checkrain.checked)
                      break;

                    createSource('rain', 0.15, i, x, y);
                  } else if (hour.condition.code == 1066 ||      // snow
                    hour.condition.code == 1072 ||
                    (hour.condition.code >= 1114 && hour.condition.code <= 1117) ||
                    (hour.condition.code >= 1210 && hour.condition.code <= 1237) ||
                    (hour.condition.code >= 1255 && hour.condition.code <= 1264)) {
                    if (!checksnow.checked)
                      break;

                    createSource('snow', 0.09, i, x, y);
                  } else if (hour.condition.code == 1069 ||     // sleet
                    hour.condition.code == 1252 ||
                    (hour.condition.code >= 1204 && hour.condition.code <= 1207)) {
                    if (!checksleet.checked)
                      break;

                    createSource('sleet', 0.15, i, x, y);
                  } else if (hour.condition.code == 1087 ||     // thunder
                    (hour.condition.code >= 1273 && hour.condition.code <= 1282)) {
                    if (!checkthunder.checked)
                      break;
                    createSource('thunder', 0.08, i, x, y);
                  } else if (                                   // clouds
                    (hour.condition.code >= 1003 && hour.condition.code <= 1009)) {
                    if (!checkcloud.checked)
                      break;

                    createSource('cloud', 0.08, i, x, y);
                  } else if (hour.condition.text == 'Clear' ||  // moon 
                    hour.condition.text == 'Clear ') {
                    if (!checkmoon.checked)
                      break;

                    createSource('moon', 0.15, i, x, y);
                  } else {                                      // Sunny
                    if (!checksun.checked)
                      break;

                    createSource('sun', 0.15, i, x, y);
                  }
                }
              }
            }
          }
        });
      });
    }
  }
}
// let marker: maplibregl.Marker;

const numOfLng = 4, numOfLat = 3;

let lat = 0, lng = 0;

const App = () => {
  const [mycountry, setCountry] = useState("undefined");
  const [mycity, setCity] = useState("undefined");
  const [mydate, setDate] = useState("undefined");

  function onMapClick(e: any) {
    // console.log('click');
    // marker.setLngLat(e.lngLat);

    let url = `https://api.openweathermap.org/data/2.5/forecast?lat=${e.lngLat.lat}&lon=${e.lngLat.lng}&units=metric&appid=7185f8466d8d0f2977ed26d7bdcab055`;
    let url1 = `https://api.openweathermap.org/data/2.5/weather?lat=${e.lngLat.lat}&lon=${e.lngLat.lng}&units=metric&appid=7185f8466d8d0f2977ed26d7bdcab055`;

    lat = e.lngLat.lat;
    lng = e.lngLat.lng;

    fetch(url).then((mydata) => {
      // console.log("zashlo");
      mydata.text().then((txt) => {
        let text = JSON.parse(txt);
        // console.log('done');
        setCountry(text.city.country);
        // console.log(text.city);
        // setCity(text.city.name);
        // setTemp(text.list[0].main.temp);
        // setDate(text.list[0].dt_txt);
      });
    });
  }


  useEffect(() => {
    if (!map) {
      map = new maplibregl.Map({
        container: "map",
        style: `https://api.maptiler.com/maps/streets/style.json?key=gHEk1ahGnKcGpVg5vq6z`,
        center: [-68.13734351262877, 45.137451890638886],
        zoom: 1,
      });
      // marker = new maplibregl.Marker;
      // marker.setLngLat([0, 0]);
      // marker.addTo(map);
    }
    map.on('load', () => {
      console.log('load');
      loadImage();
      // LoadWeather();
      let i = 0;
      var now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      now.setMinutes(0);
      let date = document.getElementById('nowdate') as HTMLInputElement;
      date.min = date.value = now.toISOString().slice(0, 16);
      now.setDate(now.getDate() + 3);
      date.max = now.toISOString().slice(0, 16);

      changeTime();

      for (let y1 = 90; y1 > -90; y1 -= deltalat) {
        let y = Math.floor(y1 * 10000) / 10000;
        for (let x1 = -180; x1 < 180; x1 += deltalng) {
          let x = Math.floor(x1 * 10000) / 10000;
          let url2 = `https://api.weatherapi.com/v1/forecast.json?key=2857565256134dea82685333241506&q=${y},${x}&days=2`;

          fetch(url2).then((mydata) => {
            mydata.text().then((txt) => {
              let text = JSON.parse(txt);
              // console.log(text.forecast.forecastday[0]);
              // console.log(text);
              i++;
              // console.log(
              //   text.forecast.forecastday[0].day.daily_will_it_rain
              // );
              if (text.current.precip_mm > 0) {
                sources.push('maine' + i);
                map.addSource('maine' + i, {
                  'type': 'geojson',
                  'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                      'type': 'Point',
                      'coordinates':
                        [x, y]
                    }
                  }
                });
                map.addLayer({
                  'id': 'maine' + i,
                  'type': 'symbol',
                  'source': 'maine' + i,
                  'layout': {
                    'icon-image': 'rain',
                    'icon-size': 0.15
                  },
                });
              } else {
                sources.push('maine' + i);
                map.addSource('maine' + i, {
                  'type': 'geojson',
                  'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                      'type': 'Point',
                      'coordinates':
                        [x, y]
                    }
                  }
                });
                map.addLayer({
                  'id': 'maine' + i,
                  'type': 'symbol',
                  'source': 'maine' + i,
                  'layout': {
                    'icon-image': 'sun',
                    'icon-size': 0.15
                  },
                });
              }
            })
          })
        }
      }


    })
    let cl = document.getElementById('clickMe');
    if (cl)
      cl.onclick = function () {
        changeWeather();
      };
    map.on("dblclick", (e: any) => {
      console.log('click');
      // onMapClick(e);
      // marker.setLngLat(e.lngLat);
    })
  });

  let date = document.getElementById('nowdate') as HTMLInputElement;

  if (date) {
    date.onchange = () => {
      changeTime();
      changeWeather();
    }
  }

  return (
    <div style={{ width: "100%" }}>
      <div className="map" style={{ width: "80%" }}>
        <p id="map" style={{ height: "600px", width: "100%" }}></p>
      </div>
      <div className="country" style={{ width: "1000px" }}>
      </div>
    </div>);
  //            <p>Temperature: {0}</p><p>Country: {mycountry}</p>
}

async function onLoad() {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    const root = createRoot(rootElement);
    // root.render([<div>its me</div>]);
    root.render([<App></App>]);
  }
}
window.onload = onLoad;


