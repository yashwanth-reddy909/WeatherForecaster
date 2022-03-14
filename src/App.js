
import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [placename,setPlacename]=useState('London');
  const [loading,setLoading]=useState(false);
  const [weatherdata,setWeatherdata]=useState({});
  const [error,setError]=useState('');
  useEffect(()=>{
    // useEffect runs after component builds id user had previous searched a place name we fetch data through internal storage if not we pass London as a default location for
    // or If user is willing is give access to his location we get his latitude and longitude through geoprahic
    (async () => {
      if(localStorage.getItem('Previousplace')){
        const k=localStorage.getItem('Previousplace');
        setPlacename(k);
        handleClick(k);
      }
      else{
        handleClick(placename);
        // gps calls elert 
        getGPS();
      }
    })();
  },[]);

  const getGPS= async ()=>{
    setLoading(true);
    await navigator.geolocation.getCurrentPosition(
      position => {
        const latitude= position.coords.latitude;
        const longitude= position.coords.longitude;
        axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${process.env.REACT_APP_API_KEY}`)
        .then(res=>{
          setWeatherdata(res.data);
          setLoading(false);
          // console.log(res.data);
          localStorage.setItem('Previousplace',res.data.name);
          handleBackground(res.data.main.feels_like);
        })
        .catch(err=>{
          console.log(err);
          setLoading(false);
          console.log("Can not able send your current location to server");
        });
      }, 
      err => console.log(err)
    );
  }

  const handleBackground=(temp)=>{
    // background change on the temp of the placename user searching for UI ""
    if(temp<20){
      document.body.style.backgroundImage="url('https://raw.githubusercontent.com/zurkon/weather-geocoding/main/src/assets/blue.jpg')";
    }
    else if(temp<35){
      document.body.style.backgroundImage="url('https://raw.githubusercontent.com/zurkon/weather-geocoding/main/src/assets/green.jpg')";
    }
    else{
      document.body.style.backgroundImage="url('https://raw.githubusercontent.com/zurkon/weather-geocoding/main/src/assets/orange.jpg')";
    }
  }

  const handleClick=(name)=>{
    // whenever he click to search console comes here
    setLoading(true);
    axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${name}&units=metric&appid=${process.env.REACT_APP_API_KEY}`)
    .then(res=>{
      setLoading(false);
      localStorage.setItem('Previousplace',name);
      console.log(res.data);
      const totalWeatherReport=res.data;
      setWeatherdata(totalWeatherReport);
      handleBackground(totalWeatherReport.main.feels_like);
      // if(totalWeatherReport.main.feels_like<20){
      //   document.body.style.backgroundImage="url('https://raw.githubusercontent.com/zurkon/weather-geocoding/main/src/assets/blue.jpg')";
      // }
      // else if(totalWeatherReport.main.feels_like<35){
      //   document.body.style.backgroundImage="url('https://raw.githubusercontent.com/zurkon/weather-geocoding/main/src/assets/green.jpg')";
      // }
      // else{
      //   document.body.style.backgroundImage="url('https://raw.githubusercontent.com/zurkon/weather-geocoding/main/src/assets/orange.jpg')";
      // }
      
    })
    .catch(err=>{
      // error hanlder
      setError(err.response.data.message);
      if(err.response.data.cod==='404'){
        let i=`Place Not Found  "${placename}"`;
        setError(i);
        console.log(err.response.data.message);
      }
      setLoading(false);
    });
  }

  const handleKeyPress = (event) => {
    if(event.key === 'Enter'){
      handleClick(document.getElementById("text-1542372332072").value)
    }
  }
  // }
  const dateBuilder = (d) => {
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    let day = days[d.getDay()];
    let date = d.getDate();
    let month = months[d.getMonth()];
    let year = d.getFullYear();

    return `${day} ${date} ${month} ${year}`
  }

  const mToKmConversion=(meters)=>{
    const nu=meters/1000;
    return nu.toFixed(1);
  }
  return (
    <div className="App">
      {/* <div>
        <input onChange={(e)=>{setPlacename(e.target.value)}}/>
        <div onClick={()=>{handleClick(placename)}}>Search</div>
      </div> */}
      <div className='header'>
        <div class="input-group">
          <input onKeyPress={handleKeyPress}   onChange={(e)=>{setError('');setPlacename(e.target.value)}} class="form-control" type="text" name="text-1542372332072" id="text-1542372332072" required="required" placeholder="City name"/>
          <label for="text-1542372332072">City name</label>
        </div>
        <div className='mainbuttons'>
          <span id='searchbutton' onClick={()=>{handleClick(placename)}}><i className="bi bi-search"></i></span>
          <span id='locationbutton' onClick={()=>getGPS()}><i className="bi bi-geo-alt"></i></span>
        </div>
      </div>
      <div id='errordisplaydiv'>{error}</div>
      <div>
        {weatherdata!=={} ? (<div>
          <div className='location_name'>{loading ? 'Loading...' : `${weatherdata.name}, ${weatherdata.sys ? weatherdata.sys.country : ''}`}<div className='date'>{dateBuilder(new Date())}</div></div>
          {!loading &&  (weatherdata.main ? (<div>
            <div className='main_tempdiv'><span className='main_temp'>{Math.round(weatherdata.main.temp)}°c</span></div>
            <div className='min_max_temp'>{Math.round(weatherdata.main.temp_min)}&#186;C / {Math.round(weatherdata.main.temp_max)}&#186;C</div >
            <div className='weatherdis'>{weatherdata.weather[0].main} <span>{weatherdata.weather[0].description}</span></div>
            <div className='threeboxes'>
              <span><div className='threevalues'>{weatherdata.main.humidity} %</div><div className='threeattributes'>Humidity</div></span>
              <span><div className='threevalues'>{mToKmConversion(weatherdata.visibility)} Km</div><div className='threeattributes'>Visibility</div></span>
              <span id='thirdone'><div className='threevalues'>{weatherdata.wind.speed.toFixed(1)} m/s</div><div className='threeattributes'>Wind Speed</div></span>
            </div>
          </div>): '')}
        </div>): ''
        }
      </div>
    </div>
  );
}

export default App;
