// Fetch the dataset
fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
    .then(response => response.json())
    .then(data => {
        const dataset = data.monthlyVariance;

        // Set up the dimensions and margins for the chart
        const margin = { top: 50, right: 50, bottom: 100, left: 100 };
        const width = 1200 - margin.left - margin.right;
        const height = 600 - margin.top - margin.bottom;

        // Create the SVG container
        const svg = d3.select('body')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // Add title to the chart
        svg.append('text')
            .attr('id', 'title')
            .attr('x', width / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .text('Heat Map');

        // Add description to the chart
        svg.append('text')
            .attr('id', 'description')
            .attr('x', width / 2)
            .attr('y', -40)
            .attr('text-anchor', 'middle')
            .text('This is a heat map showing the global temperature variance.');

        // Create the scales for the x and y axes
        const xScale = d3.scaleBand()
            .domain(dataset.map(d => d.year))
            .range([0, width]);

        const yScale = d3.scaleBand()
            .domain(d3.range(1, 13)) // Months from 1 (January) to 12 (December)
            .range([0, height]);

        // Create the color scale for the temperature values
        const colorScale = d3.scaleQuantize()
            .domain([d3.min(dataset, d => d.variance), d3.max(dataset, d => d.variance)])
            .range(['#4575b4', '#74add1', '#abd9e9', '#e0f3f8']);

        // Create the x and y axes
        const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const yAxis = d3.axisLeft(yScale).tickFormat(d => monthNames[d - 1]);

        svg.append('g')
            .attr('id', 'x-axis')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis);

        svg.append('g')
            .attr('id', 'y-axis')
            .call(yAxis);

        // Create the cells representing the data
        svg.selectAll('.cell')
            .data(dataset)
            .enter()
            .append('rect')
            .attr('class', 'cell')
            .attr('x', d => xScale(d.year))
            .attr('y', d => yScale(d.month))
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .attr('fill', d => colorScale(d.variance))
            .attr('data-month', d => d.month - 1) // Subtract 1 to make it within the range of 0-11
            .attr('data-year', d => d.year) // Remove the subtraction to keep it within the range of the data
            .attr('data-temp', d => d.variance);

        // Create the legend
        const legend = svg.append('g')
            .attr('id', 'legend')
            .attr('transform', `translate(${width - 200}, ${height + 50})`);

        const legendColors = ['#4575b4', '#74add1', '#abd9e9', '#e0f3f8'];
        const legendWidth = 40;
        const legendHeight = 20;

        legend.selectAll('.legend-rect')
            .data(legendColors)
            .enter()
            .append('rect')
            .attr('class', 'legend-rect')
            .attr('x', (d, i) => i * legendWidth)
            .attr('y', 0)
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .attr('fill', d => d);

        // Create the tooltip
        const tooltip = d3.select('body')
            .append('div')
            .attr('id', 'tooltip')
            .style('opacity', 0)
            .style('position', 'absolute') // This allows us to position the tooltip using top and left styles
            .style('pointer-events', 'none'); // This makes the tooltip ignore mouse events, which can interfere with the mouseover and mouseout events on the cells

        // Add mouseover event to show tooltip
        svg.selectAll('.cell')
            .on('mouseover', function (d) {
                const [x, y] = d3.mouse(this);
                tooltip.html(`Year: ${d.year}<br>Month: ${d.month}<br>Variance: ${d.variance}`)
                    .style('opacity', 1)
                    .style('left', `${x}px`) // Position the tooltip using the left style
                    .style('top', `${y}px`) // Position the tooltip using the top style
                    .attr('data-year', d.year);
            })
            .on('mouseout', () => {
                tooltip.style('opacity', 0);
            });
    });
