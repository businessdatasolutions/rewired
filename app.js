document.addEventListener('DOMContentLoaded', async () => {
    const ctx = document.getElementById('scoreChart').getContext('2d');
    const scoreForm = document.getElementById('scoreForm');
    const domainSelect = document.getElementById('domain');

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

    // Function to generate a random jitter value within a specified range
    function getJitter() {
        return (Math.random() - 0.5) * 0.2; // Jitter value between -0.1 and 0.1
    }

    let chartData = {
        datasets: []
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
                    min: 0, // Set minimum to 0
                    max: 5, // Set maximum to 5
                    ticks: {
                        stepSize: 1, // Ensure tick marks only appear on whole numbers
                        callback: function(value) {
                            if (Number.isInteger(value)) {
                                return value; // Show only whole numbers
                            }
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Value'
                    },
                    min: 0, // Set minimum to 0
                    max: 5, // Set maximum to 5
                    ticks: {
                        stepSize: 1, // Ensure tick marks only appear on whole numbers
                        callback: function(value) {
                            if (Number.isInteger(value)) {
                                return value; // Show only whole numbers
                            }
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            // Retrieve the original scores from the dataset
                            const originalValue = context.raw.originalY;
                            const originalFeasibility = context.raw.originalX;
                            return `Domain: ${context.dataset.label} (Value: ${originalValue}, Feasibility: ${originalFeasibility})`;
                        }
                    }
                }
            }
        }
    });

    // Function to add a data point to the chart
    function addDataToChart(domain, value, feasibility) {
        console.log(`Adding data to chart: Domain=${domain}, Value=${value}, Feasibility=${feasibility}`);

        // Apply jitter to avoid overlapping points
        const jitteredValue = value + getJitter();
        const jitteredFeasibility = feasibility + getJitter();

        // Check if the dataset for this domain already exists
        let dataset = chartData.datasets.find(d => d.label === domain);

        if (!dataset) {
            // Create a new dataset for this domain
            dataset = {
                label: domain,
                data: [],
                backgroundColor: domainColors[domain],
                borderColor: domainColors[domain],
                borderWidth: 1,
                pointRadius: 8, // Increase the marker size
                showLine: false // Ensure lines are not shown between points
            };
            chartData.datasets.push(dataset);
        }

        // Add the new data point to the dataset with jitter and original values
        dataset.data.push({
            x: jitteredFeasibility,
            y: jitteredValue,
            originalX: feasibility, // Store original feasibility score
            originalY: value // Store original value score
        });

        console.log('Current dataset:', dataset);

        // Update the chart with the new data point
        scoreChart.update();
    }

    // Fetch data from the Baserow database and populate the chart
    const databaseUrl = 'https://api.baserow.io/api/database/rows/table/337802/?user_field_names=true';
    const token = 'xFalGLz7taK8tEcpD1Hsp9cuF1TTq4Ih'; // Replace with your actual token

    try {
        const response = await fetch(databaseUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Fetched data from database:', data);

        data.results.forEach(item => {
            // Convert string values to numbers before adding to the chart
            const value = parseFloat(item.value);
            const feasibility = parseFloat(item.feasibility);

            addDataToChart(item.domain, value, feasibility);
        });
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }

    scoreForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const domain = domainSelect.value;
        const value = parseFloat(document.querySelector('input[name="value"]:checked').value);
        const feasibility = parseFloat(document.querySelector('input[name="feasibility"]:checked').value);

        // Send data to the Baserow database
        try {
            const response = await fetch(databaseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    domain: domain,
                    value: value,
                    feasibility: feasibility
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Data successfully sent to the database:', data);

            // After successful POST, add the data to the chart
            addDataToChart(domain, value, feasibility);

            // Remove the selected domain from the dropdown options
            const optionToRemove = domainSelect.querySelector(`option[value="${domain}"]`);
            if (optionToRemove) {
                optionToRemove.remove();
            }

            // Reset the form to the first available option and clear the radio buttons
            scoreForm.reset();
            domainSelect.selectedIndex = 0;
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    });
});
