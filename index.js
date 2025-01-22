
import { dates } from '/dates.js'//import the dates utility class

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
        renderTickers()//
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
            const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${process.env.POLYGON_API_KEY}`
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
        fetchReport(stockData.join(''))
    } catch(err) {
        loadingArea.innerText = 'There was an error fetching stock data.'
        console.error('error: ', err)
    }
}

async function fetchReport(data) {
    
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




