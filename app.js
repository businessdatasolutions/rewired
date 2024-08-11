document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('scoreChart').getContext('2d');
    const scoreForm = document.getElementById('scoreForm');

    // Define colors for each domain
    const domainColors = {
        'Manufacturing': 'rgba(255, 99, 132, 0.6)',
        'Revenue Management': 'rgba(54, 162, 235, 0.6)',
        'Logistics': 'rgba(75, 192, 192, 0.6)',
        'Store Execution': 'rgba(255, 206, 86, 0.6)',
        'Innovation/R&D': 'rgba(153, 102, 255, 0.6)',
        'Digital Engagement': 'rgba(255, 159, 64, 0.6)',
        'Procurement': 'rgba(99, 255, 132, 0.6)',
        'Integrated Supply Chain Planning': 'rgba(235, 54, 162, 0.6)',
        'Personalized Marketing': 'rgba(192, 75, 75, 0.6)',
    };

    let chartData = {
        labels: [],
        datasets: [{
            label: 'Business Domains',
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1,
            pointRadius: 8, // Increase the marker size
        }]
    };

    const scoreChart = new Chart(ctx, {
        type: 'scatter',
        data: chartData,
        options: {
            layout: {
                padding: {
                    left: 20,
                    right: 20,
                    top: 20,
                    bottom: 20
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Feasibility'
                    },
                    min: 0,
                    max: 5
                },
                y: {
                    title: {
                        display: true,
                        text: 'Value'
                    },
                    min: 0,
                    max: 5
                }
            }
        }
    });

    scoreForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const domain = document.getElementById('domain').value;
        const value = parseFloat(document.getElementById('value').value);
        const feasibility = parseFloat(document.getElementById('feasibility').value);

        chartData.labels.push(domain);
        chartData.datasets[0].data.push({ x: feasibility, y: value });
        chartData.datasets[0].backgroundColor.push(domainColors[domain]);
        chartData.datasets[0].borderColor.push(domainColors[domain]);

        scoreChart.update();

        scoreForm.reset();
    });
});
