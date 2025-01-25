
import { dates } from '/dates.js'//import the dates utility class
require('dotenv').config();
const polygon_api_key = process.env.POLYGON_API_KEY;




//Array to store the tickets received from user
const tickersArr = []

//get the generate report button
const generateReportBtn = document.querySelector('.generate-report-btn')

//when the button is clicked, it fetches the stock data through API
generateReportBtn.addEventListener('click', fetchStockData)

document.getElementById('ticker-input-form').addEventListener('submit', (e) => {
    e.preventDefault()
    const tickerInput = document.getElementById('ticker-input')
    if(tickerInput.value.length > 2) {//once the input has more than 2 characters 
        generateReportBtn.disabled=false //re-enable the btn to be clickable
        const newTickerStr = tickerInput.value //get the value of the tickerInput
        tickersArr.push(newTickerStr.toUpperCase())
        tickerInput.value=''//empty the tickerInput field
        renderTickers()//update the list of tickers
    }
    else{
        const label = document.getElementsByTagName('label')[0]
        label.style.color='red'
        label.textContent='You must add at least one ticker.'
    }
})

//update the current tickers with new added current tickers
//to enable user to see what and how many tickers that were added
function renderTickers(){
    const tickersDiv = document.querySelector('.ticker-choice-display')
    tickersDiv.innerHTML = ''
    tickersArr.forEach((ticker) => {
        const newTickerSpan = document.createElement('span')
        newTickerSpan.textContent = ticker
        newTickerSpan.classList.add('ticker')
        tickersDiv.appendChild(newTickerSpan)
    })
}


const loadingArea = document.querySelector('.loading-panel')
const apiMessage = document.getElementById('api-message')

async function fetchStockData() {
    document.querySelector('.action-panel').style.display = 'none' //blank the screen
    loadingArea.style.display = 'flex'
    //get the tickers information of past 3 days  by using the API 
    try {
        const stockData = await Promise.all(tickersArr.map(async (ticker) => {
            const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${polygon_api_key}`
            const response = await fetch(url)
            const data = await response.text()
            const status = await response.status
            if (status === 200) {
                apiMessage.innerText = 'Creating report...'
                return data
            } else {
                loadingArea.innerText = 'There was an error fetching stock data.'
            }
        }))
        console.log("Stock Data:", stockData)
        fetchReport(stockData)
    } catch(err) {
        loadingArea.innerText = 'There was an error fetching stock data.'
        console.error('error: ', err)
    }
}



//function to use the data fetched from the polygon to the 
async function fetchReport(data) {
    console.log("Stock data passed to fetched report:",data)
    // the "response" contains an object of methods and properties
    const response = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
        },
        body: JSON.stringify({data:data[0]}),
    });

    console.log("The response before being parsed: ", response)
    //after the server reply the post request, parse the JSON from the response body
    const jsonResponse = await response.json();
    console.log("This is the json after being parsed: ",jsonResponse)//see how the parsed json looks like
    renderReport(jsonResponse.response);
}

//generate and display the report to the page 
function renderReport(output) {
    loadingArea.style.display = 'none'
    const outputArea = document.querySelector('.output-panel')
    const report = document.createElement('p')
    outputArea.appendChild(report)
    report.textContent = output
    outputArea.style.display = 'flex'

}

// {id: "chatcmpl-8Go69bvmGWV8JHvZ9uxYXSUAimEb8", object: "chat.completion", created: 1699016517, model: "gpt-4-0613", choices: [{index: 0, message: {role: "assistant", content: "The invention of television was the work of many individuals in the late 19th century and early 20th century. However, Scottish engineer John Logie Baird is often associated with creating the first mechanical television. He demonstrated his working device in January 1926 in London. Concurrently in the United States, Philo Farnsworth is credited with inventing the first fully electronic television in the late 1920s."}, finish_reason: "stop"}], usage: {prompt_tokens: 24, completion_tokens: 86, total_tokens: 110}}


