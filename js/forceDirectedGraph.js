// TODO: these should be proportioned to the vis dimensions
const NODE_REPEL_STRENGTH = 50;
const NODE_LIKE_DISTANCE_FACTOR = 50;
const NODE_MATCH_DISTANCE_FACTOR = 10;

const DEFAULT_DISTANCE = 'like';

class ForceDirectedGraph extends View {

    initVis() {
        super.initVis();
        let vis = this;
        vis.distance = DEFAULT_DISTANCE;
        vis.graph = d3.forceSimulation();
        vis.repel = d3.forceManyBody().strength(-NODE_REPEL_STRENGTH);
        vis.graph.force('charge', vis.repel);
        vis.graph.force('collision', d3.forceCollide().radius(4));
        vis.linkForce = d3.forceLink().id(d => d.id);
        vis.graph.force('link', vis.linkForce)
        // a categorical color scale
        vis.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        vis.updateVis();
    }

    setNodeDistance(dist) {
        if (dist === 'like' || dist === 'match') {
            this.distance = dist;
        }
    }

    nodeDistance() {
        switch (this.distance) {
            case 'like':
                return l => (10 - l['like'])*NODE_LIKE_DISTANCE_FACTOR;
            case 'match':
                return NODE_MATCH_DISTANCE_FACTOR;
        }
    }

    updateVis() {
        super.updateVis();
        let vis = this;

        vis.colorDomain = unique(vis.getData().nodes, decode(vis.attribute));
        vis.colorScale.domain(vis.colorDomain);

        // update attraction force
        vis.linkForce.distance(vis.nodeDistance()).strength(0.1);

        //update graph center
        vis.graph.force('center', 
            d3.forceCenter(vis.getWidth() / 2, vis.getHeight() / 2));

        const nodes = vis.getData().nodes;


        vis.graph.nodes(nodes);
        vis.linkForce.links(this.distance == 'match' ? d3.filter(vis.getData().links, l => l['match']) : vis.getData().links);

        vis.graph.stop();
        vis.graph.alpha(1).restart();

        vis.renderVis();
    }

    renderVis() {
        super.renderVis();
        let vis = this;
        
        // TODO: use custom enter-update-exit pattern for updates
        const nodes = vis.getChart().selectAll('circle')
            .data(vis.getData().nodes, d => d.id)
            .join('circle')
            .attr('r', 4)
            .attr('fill', d => vis.colorScale(decode(vis.attribute)(d)))
            .attr('stroke', 'black')
            .call(drag(vis.graph))
        .on('mouseover', (e, d) => {
            d3.select('#tooltip')
                .style('display', 'block')
                .style('left', (e.pageX) + 'px')
                .style('top', (e.pageY) + 'px')
                .html(`
                <h1>Participant ${decode('id')(d)}</h1>
                <p>Wave: ${decode('wave')(d)}<p>
                <p>Field: ${decode('field_cd')(d)}<p>
                <p>Career: ${decode('career_c')(d)}<p>
                <p>race: ${decode('race')(d)}<p>
                <p>From: ${decode('from')(d)}<p>
                `);
        })
        .on('mouseout', (e, d) => {
            d3.select('#tooltip').style('display', 'none');
          });

        const matchLinks = d3.filter(vis.getData().links, 
            l => l['match']);

        const links = vis.chart.selectAll('line')
          .data(matchLinks, d => [d.source, d.target])
          .join('line')
          .attr('opacity', 0.7)
          .attr('stroke', 'black')
          .attr('stroke-width', 0.1)

        vis.graph.on('tick', () => {
            nodes
                .attr('cx', function(d) { return d.x = Math.max(4, Math.min(vis.getWidth() - 4, d.x)); }) //https://bl.ocks.org/mbostock/1129492
                .attr('cy', function(d) { return d.y = Math.max(4, Math.min(vis.getHeight() - 4, d.y)); });
            links
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
            });
    }
}

// Drag simulation code curtesy of
// https://observablehq.com/@d3/force-directed-graph
const drag = simulation => {
  
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}