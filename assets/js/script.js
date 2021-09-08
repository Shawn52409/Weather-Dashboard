var APIKey = "ee5bba5a0ab601cf94442ccef226d4cf";
var currentDate = moment().format('dddd (l)');
var searchHistory = [];




// function called after a search is made
function getWeather(event){    
    event.preventDefault();

    // $(event.target).text
    var searchInput = $("#search-input").val().trim();    
    // var searchInput = event;

    // if search does not bring up a city then quit out of function
    if (searchInput === null){
        return;
    }  


    // first api call using city from user's search
    var queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + searchInput + "&units=imperial&appid=" + APIKey;
    
    // remove search from bar
    $('#search-input').val('');    
    
    // fetch request for current weather
    fetch(queryURL)
        .then(function (response){
            console.log(response);                      
            if (!response.ok){
                return;
            }
            response.json().then(function (data){
                console.log(data);                           
                

                if (!searchHistory.includes(searchInput)){
                    searchHistory.push(searchInput);
                        $("#searchcontent").append(`
                        <li class="text-capitalize btn btn-info btn-block gap-2 w-75">${searchInput}</li>
                        `)
                        
                        localStorage.setItem("searchInput", searchHistory);
                    };

                // variables used to lookup icon for current weather
                var iconCode = data.weather[0].icon;
                var iconURL = `https://openweathermap.org/img/w/${iconCode}.png`;
                
                // create container in html for city's current weather
                $("#currentCityWeather").empty();
                $("#currentCityWeather").addClass("col-11 border border-dark bg-light");
                $("#currentCityWeather").append(`
                    <h2><strong><u>${data.name}</u></stong><br></h2>
                    <h2>${currentDate}</h2>
                    <div class="text-capitalize"><img src="${iconURL}"> ${data.weather[0].description}</div><br>
                    <div>Current Temp: ${Math.round(data.main.temp)}°F</div><br>
                    <div>Wind Speed: ${Math.round(data.wind.speed)} MPH</div><br>
                    <div>Humidity: ${data.main.humidity} %</div><br>
                `);               
                    
                // create variables for the longitude and latitude of the current city
                var lat = data.coord.lat;
                var lon = data.coord.lon;
                
                // second api call using longitude and latitude to find uv and 5 day forecast data
                var queryURL_onecall = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + APIKey;
                
                // fetch request for uv index and 5 day forecast data
                fetch(queryURL_onecall)
                    .then(function (response_onecall){
                        response_onecall.json().then(function (data_onecall){
                            console.log(data_onecall);
                            $("#currentCityWeather").append(`
                            <div id="uvIndex">UV Index: <span>${data_onecall.current.uvi}</span></div><br> 
                            `);
                            if(data_onecall.current.uvi >= 0 && data_onecall.current.uvi <= 2){
                                $("span").css("background-color", "lightgreen")
                            }else if (data_onecall.current.uvi > 2 && data_onecall.current.uvi <= 5){
                                $("span").css("background-color", "yellow")
                            }else if (data_onecall.current.uvi > 5 && data_onecall.current.uvi <= 7){
                                $("span").css("background-color", "orange")
                            }else if (data_onecall.current.uvi > 7 && data_onecall.current.uvi <= 10){
                                $("span").css("background-color", "red")
                            }else if (data_onecall.current.uvi > 10){
                                $("span").css("background-color", "violet")
                            }

                            var cityForcast = [];
                            // Clear header if there was a previous search
                            $("#header-5day").empty();                            
                            // Create a header for the 5 day forecast
                            $("#header-5day").append(`
                            <h3 class="p-2">5-Day Forecast</h3>`);
                            
                            // loop used to create 5 containers for the 5 day forecast
                            for(var i = 1; i < 6; i++){
                                
                                // variables used to lookup icon for each day in 5 day forecast
                                var date = moment.unix(data_onecall.daily[i].dt).format('dddd (l)');
                                var iconURL = `https://openweathermap.org/img/w/${data_onecall.daily[i].weather[0].icon}.png`;
                                
                                // container if there was a previous search
                                $(`#day-${i}-forecast`).empty();
                                // adding class with bootstrap library for styling
                                $(`#day-${i}-forecast`).addClass("col-md-2 p-1 m-2 text-white bg-primary");
                                // Create the container with a future day's data
                                $(`#day-${i}-forecast`).append(`
                                    <h3 class="fs-1">${date}</h3>
                                    <div class="text-capitalize"><br><img src="${iconURL}"> ${data_onecall.daily[i].weather[0].description}</div><br>
                                    <div>Temp: ${Math.round(data_onecall.daily[i].temp.day)}°F</div><br>
                                    <div>Wind: ${Math.round(data_onecall.daily[i].wind_speed)} MPH</div><br>
                                    <div>Humidity: ${data_onecall.daily[i].humidity} %</div><br>

                                `);
                            };
                        });
                    });                    
            });
        });              
    };
    
$("#searchcontent").on("click", "li", function(){
    var searchListCity = $(this).text();
    getWeather(searchListCity);
});

$("button").on("click", getWeather);
//     var searchInput = $("#search-input").val().trim();
//     getWeather(searchInput);
// });