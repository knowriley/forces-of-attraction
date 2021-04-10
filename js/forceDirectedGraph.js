// FORCING PARAMETERS
// TODO: these should probably be proportioned to the vis dimensions
const NODE_REPEL_STRENGTH = 50;
const NODE_LIKE_DISTANCE_FACTOR = 50;
const NODE_MATCH_DISTANCE_FACTOR = 10;

// Default attraction attribute key
const DEFAULT_DISTANCE = 'like';

/*
    A force-directed simulation view representing unique participants
    as nodes, and allowing a user to interactively control forcing
    between the nodes based on different features in the dataset.
*/
// eslint-disable-next-line no-unused-vars
class ForceDirectedGraph extends View {
  initVis() {
    super.initVis();
    const vis = this;

    vis.config.containerHeight = 400;

    // non-visual wave state
    vis.wave = 1;

    // Static elements for simulation
    vis.distance = DEFAULT_DISTANCE;
    vis.graph = d3.forceSimulation();
    vis.repel = d3.forceManyBody().strength(-NODE_REPEL_STRENGTH);
    vis.graph.force('charge', vis.repel);
    vis.graph.force('collision', d3.forceCollide().radius(4));
    vis.linkForce = d3.forceLink().id((d) => d.id);
    vis.graph.force('link', vis.linkForce);
    // a categorical color scale
    vis.colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Highlight selection
    vis.highlightedMaleLabel = NONE;
    vis.highlightedFemaleLabel = NONE;

    vis.updateVis();
  }

  setWave(w) {
    this.wave = w;
  }

  getWaveData() {
    const vis = this;
    const data = this.getData();
    const waveData = {
      nodes: d3.filter(data.nodes, (n) => n.waves.includes(vis.wave)),
      links: d3.filter(data.links, (l) => l.wave === vis.wave),
    };
    return waveData;
  }

  // Set the forcing/attraction attribute
  // TODO: could be converted to an enum
  setNodeDistance(dist) {
    if (dist === 'like' || dist === 'match') {
      this.distance = dist;
    }
  }

  // Based on the current attraction attribute, produce
  // the actual link distance
  nodeDistance() {
    switch (this.distance) {
      case 'like':
        return (l) => (10 - l.like) * NODE_LIKE_DISTANCE_FACTOR;
      case 'match':
      default:
        return NODE_MATCH_DISTANCE_FACTOR;
    }
  }

  updateVis() {
    super.updateVis();
    const vis = this;

    // Colorize by categories in the current attr.
    vis.colorDomain = unique(vis.getData().nodes, decode(vis.attribute));
    vis.colorScale.domain(vis.colorDomain);

    // update attraction force
    vis.linkForce.distance(vis.nodeDistance()).strength(0.1);

    // update graph center
    vis.graph.force('center',
      d3.forceCenter(vis.getWidth() / 2, vis.getHeight() / 2));

    // Set data for the simulation
    const { nodes, links } = vis.getWaveData();
    vis.graph.nodes(nodes);
    vis.linkForce.links(this.distance === 'match' ? d3.filter(links, (l) => l.match) : links);

    // Reboot the simulation
    vis.graph.stop();
    vis.graph.alpha(1).restart();

    vis.renderVis();
  }

  renderVis() {
    const vis = this;

    const data = vis.getWaveData();
    const nodesData = data.nodes;
    const linksData = data.links;

    // Map node elements, with tooltip interactivity.
    // See tooltip example:
    // https://github.com/UBC-InfoVis/2021-436V-case-studies/blob/097d13b05d587f4fab3e3fcd23f5e99274397c2c/case-study_measles-and-vaccines/css/style.css
    const nodes = vis.getChart().selectAll('circle')
      .data(nodesData, (d) => d.id)
      .join('circle')
      .attr('r', 4)
      .attr('fill', (d) => vis.colorScale(decode(vis.attribute)(d)))
      .attr('stroke', 'black')
      .attr('opacity', (d) => {
        if (vis.highlightedMaleLabel == NONE && vis.highlightedFemaleLabel == NONE) {
          return 1;
        } else if ((d.gender == 0 && getLabel(vis.attribute, d[vis.attribute]) == vis.highlightedFemaleLabel) ||
            (d.gender == 1 && getLabel(vis.attribute, d[vis.attribute]) == vis.highlightedMaleLabel)) {
              return 1;
        } else {
            return 0.1;
        }
      })
      .call(drag(vis.graph))
      .on('mouseover', (e, d) => {
        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', `${e.pageX}px`)
          .style('top', `${e.pageY}px`)
          .html(`
                <h1>Participant ${decode('id')(d)}</h1>
                <p>Gender: ${decode('gender')(d)}<p>
                <p>Age: ${d.age}<p>
                <p>Wave: ${decode('wave')(d)}<p>
                <p>Field: ${decode('field_cd')(d)}<p>
                <p>Career: ${decode('career_c')(d)}<p>
                <p>Race: ${decode('race')(d)}<p>
                <p>From: ${decode('from')(d)}<p>
                `);
      })
      .on('mouseout', (_, __) => {
        d3.select('#tooltip').style('display', 'none');
      });

    const matchLinks = d3.filter(linksData,
      (l) => l.match);

    const links = vis.chart.selectAll('line')
      .data(matchLinks, (d) => [d.source, d.target])
      .join('line')
      .attr('opacity', 0.7)
      .attr('stroke', 'black')
      .attr('stroke-width', 0.1);

    vis.graph.on('tick', () => {
      nodes
        .attr('cx', (d) => { d.x = Math.max(4, Math.min(vis.getWidth() - 4, d.x)); return d.x; }) // https://bl.ocks.org/mbostock/1129492
        .attr('cy', (d) => { d.y = Math.max(4, Math.min(vis.getHeight() - 4, d.y)); return d.y; });
      links
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
    });
  }
}

// Drag simulation code curtesy of
// https://observablehq.com/@d3/force-directed-graph
const drag = (simulation) => {
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
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
};
