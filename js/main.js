/**
 * Global Constants
 */

/**
 * Load data from CSV file asynchronously and render charts
 */
 d3.csv('data/speedDating.csv').then(data => {
  
    data.forEach(d => {
      // TODO
    });

    const container = document.getElementById('vis-container');

    let updateSize = () => {
        let height = container.clientHeight;
        let width = container.clientWidth;
        d3.select(`#${container.id}`)
            .attr('class', width > height ? 'landscape' : 'portrait');
    }
  
    // Init charts
    barChart = new BarChart({ parentElement: '#bar'}, data);
    forceDirectedGraph = new ForceDirectedGraph({ parentElement: '#forceDirected'}, data);
    matrix = new Matrix({ parentElement: '#matric'}, data);

    let update = () => {
        updateSize();
        barChart.updateVis();
        forceDirectedGraph.updateVis();
        matrix.updateVis();
    }

    update();

    d3.select(window).on('resize', update);
  
  });