// TODO: these should be proportioned to the vis dimensions
const NODE_REPEL_STRENGTH = 1.2;
const NODE_DISTANCE_FACTOR = 5;

class ForceDirectedGraph extends View {

    initVis() {
        super.initVis();
        let vis = this;
        vis.graph = d3.forceSimulation()
            .force('link', d3.forceLink()
                .id(d => d.id)
                .distance(d => d.value*NODE_DISTANCE_FACTOR))
            .force('charge', d3.forceManyBody()
                .strength(-NODE_REPEL_STRENGTH));
        // a categorical color scale
        vis.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        vis.updateVis();
    }

    updateVis() {
        super.updateVis();
        let vis = this;

        vis.colorScale.domain(unique(vis.getData().nodes, decode(vis.attribute)));

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
        
        // TODO: use custom enter-update-exit pattern for updates
        const nodes = vis.getChart().selectAll('circle')
            .data(vis.getData().nodes, d => d.id)
            .join('circle')
            .attr('r', 4)
            .attr('fill', d => vis.colorScale(decode(vis.attribute)(d)))
            .attr('stroke', 'black')
        .on('mouseover', (e, d) => {
            console.log(d);
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