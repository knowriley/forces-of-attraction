const ITEM_WIDTH = 150;
const CHARACTER_WIDTH = 11;

// eslint-disable-next-line no-unused-vars
class Legend extends View {
  constructor(parent, colorDomain, colorScale) {
    super({ parentElement: parent }, [], '');
    this.colorDomain = colorDomain;
    this.colorScale = colorScale;
    this.config.containerHeight = 100;
  }

  set(colorDomain, colorScale) {
    this.colorDomain = Array.from(colorDomain);
    this.colorScale = colorScale;
  }

  getData() {
    return this.colorDomain ? this.colorDomain : [];
  }

  initVis() {
    super.initVis();
    const vis = this;
    vis.updateVis();
  }

  updateVis() {
    super.updateVis();
    const vis = this;
    vis.itemWidth = d3.max(vis.getData(), item => item ? item.toString().length : 0) * CHARACTER_WIDTH + CHARACTER_WIDTH;

    vis.renderVis();
  }

  renderVis() {
    const vis = this;
    if (vis.items) {
      vis.items.remove();
    }
    vis.items = vis.getChart().selectAll('circle')
      .data(vis.getData(), (d) => d)
      .join('g')
      .attr('transform', (d) => vis.positionLegendItem(vis.getData().indexOf(d), 3));
    vis.items.append('circle')
      .attr('r', NODE_RADIUS)
      .attr('fill', (d) => vis.colorScale(d))
      .attr('stroke', 'black');
    vis.items.append('text')
      .text((d) => d)
      .attr('transform', `translate(${NODE_RADIUS + 6}, 4)`);
  }

  // Algorithm to compute position of a legend item dynamically. We enforce
  // a maximum of n items vertically and extend in the horizontal direction
  positionLegendItem(i, n) {
    const vis = this;
    const itemHeight = (vis.getHeight() / n) * 0.7;
    let y = i % n;
    const x = (i - y) / n;
    return `translate(${x * vis.itemWidth}, ${y * itemHeight})`;
  }
}
