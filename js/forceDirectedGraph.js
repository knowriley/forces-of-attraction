const data = {
    nodes: [
        {"id": "Myriel", "group": 1},
        {"id": "Napoleon", "group": 1},
        {"id": "Mlle.Baptistine", "group": 1},
    ],
    links: [
        {"source": "Napoleon", "target": "Myriel", "value": 1},
        {"source": "Mlle.Baptistine", "target": "Myriel", "value": 8},
    ],
};

class ForceDirectedGraph extends View {

    initVis() {
        super.initVis();
        let vis = this;
        vis.graph = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id))
            .force('charge', d3.forceManyBody().strength(-10));
        vis.updateVis();
    }

    // override
    getData() {
        // STUB
        return data;
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
            .attr('r', 10);

        vis.graph.on('tick', () => {
            nodes
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('fill', 'red');
            });
    }

}