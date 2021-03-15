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

  
    // Init charts
    barChart = new BarChart({ parentElement: '#bar'}, data);
    forceDirectedGraph = new ForceDirectedGraph({ parentElement: '#forceDirected'}, data);
    matrix = new Matrix({ parentElement: '#matric'}, data);
  
  });