class ChartController
{
    constructor(canvasId = "chart")
    {
        this.options =
            {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: true, // Show OX
                        position: 'center',
                        grid:
                            {
                                drawOnChartArea: true, // show axis OX
                                lineWidth: 0.25, // grid width
                                color: "white"
                            },
                        title:
                            {
                                display: true,
                                text: 'x' // Tiltle of OX
                            },
                        ticks:
                            {
                                color: 'white',
                                stepSize: 1
                            }
                    },
                    y: {
                        display: true, // Show OY
                        position: 'center',
                        grid:
                            {
                                drawOnChartArea: true, // show axis OX
                                lineWidth: 0.25, // grid width
                                color: "white"
                            },
                        title:
                            {
                                display: true,
                                text: 'y' // Title of OY
                            },
                        ticks:
                            {
                                color: 'white',
                                stepSize: 1
                            }
                    }
                }
            };

        this.data =
            {
                labels: [],
                datasets: []
            };

        this.ctx = document.getElementById(canvasId).getContext("2d");

        this.chart = new Chart(this.ctx,
            {
                type: 'line',
                data: this.data,
                options: this.options
            });
    }

    addDataSet(name = "", color = "lime", width = 2)
    {
        this.data.datasets.push(
            {
                label: name,
                color: color,
                data: [],
                borderColor: color,
                borderWidth: width,
                pointRadius: 0,
                fill: false
            });
    }

    plot(X,Y,dataSetNr = 0, name = "", color = "lime", width = 2)
    {
        while(this.chart.data.datasets.length < dataSetNr + 1)
        {
            this.addDataSet(name, color);
        }

        this.chart.data.labels = X;
        this.chart.data.datasets[dataSetNr].data = Y;
        this.data.datasets[dataSetNr].label = name;
        this.data.datasets[dataSetNr].borderColor = color;
        this.data.datasets[dataSetNr].backgroundColor = color;
        this.data.datasets[dataSetNr].borderWidth = width;

        this.chart.update();
    }

    clear()
    {
        while(this.chart.data.datasets.length > 0)
        {
            this.chart.data.datasets.pop();
        }
    }
}
