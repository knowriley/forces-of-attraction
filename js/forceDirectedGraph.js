const NODE_REPEL_STRENGTH = 50;

class ForceDirectedGraph extends View {

    initVis() {
        super.initVis();
        let vis = this;
        vis.graph = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id).distance(d => d.value))
            .force('charge', d3.forceManyBody().strength(-NODE_REPEL_STRENGTH));
        vis.updateVis();
    }

    updateVis() {
        super.updateVis();
        let vis = this;

        //update graph center
        vis.graph.force('center', 
            d3.forceCenter(vis.getWidth() / 2, vis.getHeight() / 2));

        vis.graph.nodes(vis.getData().nodes);
        vis.graph.force('link').links(vis.getData().links);

        vis.renderVis();
    }

    renderVis() {
        super.renderVis();
        let vis = this;
        
        const nodes = vis.getChart().selectAll('circle')
            .data(vis.getData().nodes, d => d.id)
            .join('circle')
            .attr('r', 3);

        vis.graph.on('tick', () => {
            nodes
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('fill', 'red');
            });
    }

}