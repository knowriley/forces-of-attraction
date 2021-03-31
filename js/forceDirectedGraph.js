// TODO: these should be proportioned to the vis dimensions
const NODE_REPEL_STRENGTH = 0;
const NODE_LIKE_DISTANCE_FACTOR = 50;
const NODE_MATCH_DISTANCE_FACTOR = 250;

const DEFAULT_DISTANCE = 'like';

class ForceDirectedGraph extends View {

    initVis() {
        super.initVis();
        let vis = this;
        vis.distance = DEFAULT_DISTANCE;
        vis.graph = d3.forceSimulation();
        vis.repel = d3.forceManyBody().strength(-NODE_REPEL_STRENGTH)
        vis.graph.force('charge', vis.repel);
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
                return l => (l['match'] ? 0 : 1)*NODE_MATCH_DISTANCE_FACTOR;
        }
    }

    updateVis() {
        super.updateVis();
        let vis = this;

        vis.colorDomain = unique(vis.getData().nodes, decode(vis.attribute));
        vis.colorScale.domain(vis.colorDomain);

        // update attraction force
        vis.linkForce.distance(vis.nodeDistance());

        //update graph center
        vis.graph.force('center', 
            d3.forceCenter(vis.getWidth() / 2, vis.getHeight() / 2));

        const nodes = vis.getData().nodes;

        vis.graph.nodes(nodes);
        vis.linkForce.links(vis.getData().links);

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
                <p>Field: ${decode('field_cd')(d)}<p>
                <p>From: ${decode('from')(d)}<p>
                `);
        })
        .on('mouseout', (e, d) => {
            d3.select('#tooltip').style('display', 'none');
          });

        vis.graph.on('tick', () => {
            nodes
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
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