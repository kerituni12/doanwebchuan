const puppeteer = require('puppeteer');
exports.sendChart = function(){  
    let response;
    const htmlString = `<html>
    <head>
        <title></title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.6.0/Chart.min.js"></script>
    </head>
    <body style="max-width: 850px; margin: auto;">
        <div>
                <canvas id="myChart" width="600" height="400"></canvas>
        </div>
       
    </body>
    <script>
      var ctx = document.getElementById('myChart').getContext('2d');
      var myChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
              datasets: [{
                  label: 'Sale',
                  data: [12, 19, 3, 5, 2, 3],
                  borderWidth: 1
              }]
          },
          options: {
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero: true
                      }
                  }]
              }
          }
      });
      </script>
    </html>`;
  
    (async () => {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.setContent(htmlString)
        await page.screenshot({path: 'aaa.png'})
        await browser.close()
        console.log('ben trong')
        return response = {
            "text": `You sent the message`
          }

      })()  
    console.log('da xong');
  }
  