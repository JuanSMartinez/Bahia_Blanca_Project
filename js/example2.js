(function(){
    
    // generate some random data
    var series = [];
    for (var i = 0, variance = 0, value; i < 1500; i++) {
        variance += (Math.random() - 0.5) / 10;
        series.push(Math.abs(Math.cos(i/100) + variance)); // only positive values
    }

    var horizonChart = d3.horizonChart();
    // 4-band horizon (4 negative & 4 positive bands)
    var colors = ['#313695', '#4575b4', '#74add1', '#abd9e9', '#fee090', '#fdae61', '#f46d43', '#d73027'];
    var n = colors.length / 2;

    var horizons = d3.select('body').selectAll('.horizon')
        .data(d3.range(0, n).map(function() {return series;}))
        .enter().append('div')
        .attr('class', 'horizon')
        .each(function(d, i) {
            var j = i+1;
            horizonChart.colors(colors.slice(n-j, n+j))
                .height(120/j)
                .title('Horizon, ' + j + '-band (' + 120/j + 'px)')
                .call(this, d);
        });
    
})();